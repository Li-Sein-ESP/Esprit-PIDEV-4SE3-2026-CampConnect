package com.campconnect.service.impl;

import com.campconnect.dto.PostDTO;
import com.campconnect.dto.StoryGeneratorRequestDTO;
import com.campconnect.dto.StoryGeneratorResponseDTO;
import com.campconnect.exception.BadRequestException;
import com.campconnect.moderation.ModerationDecision;
import com.campconnect.moderation.dto.PostModerationResult;
import com.campconnect.moderation.service.PostModerationService;
import com.campconnect.model.Post;
import com.campconnect.predict.service.OpenAIService;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.FollowService;
import com.campconnect.service.PostService;
import com.campconnect.service.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
public class PostServiceImpl implements PostService {

    /** Si true : le feed public n'affiche que les posts approuvés par un admin (après analyse IA). */
    @Value("${moderation.workflow.require-admin-approval:true}")
    private boolean requireAdminApproval;

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final OpenAIService openAIService;
    private final PostModerationService postModerationService;
    private final FollowService followService;

    @Override
    public PostDTO createPost(PostDTO postDTO) {
        // Security check: Verify if the user is banned before allowing them to post
        if (postDTO.getAuthorId() != null) {
            System.out.println("[Security] Checking ban status for user: " + postDTO.getAuthorId());
            userRepository.findById(postDTO.getAuthorId()).ifPresent(user -> {
                if (user.getProfileDetails() != null) {
                    Object status = user.getProfileDetails().get("moderationStatus");
                    System.out.println("[Security] User status found: " + status);
                    if ("BANNED".equals(status)) {
                        System.out.println("[Security] BLOCKING banned user post attempt!");
                        throw new BadRequestException("Your account has been banned due to moderation policy violations.");
                    }
                }
            });
        } else {
            System.out.println("[Security] WARNING: No authorId provided in PostDTO!");
        }

        Post post = new Post();
        // Fallback for content/description mismatch
        post.setContent(postDTO.getContent() != null ? postDTO.getContent() : postDTO.getDescription());

        // Use manual string references instead of DBRef
        post.setThreadId(postDTO.getThreadId());
        post.setAuthorId(postDTO.getAuthorId());
        post.setAuthorName(postDTO.getAuthorName() != null ? postDTO.getAuthorName() : "Explorer");
        post.setAuthorUsername(postDTO.getAuthorUsername() != null ? postDTO.getAuthorUsername() : "explorer");
        post.setTitle(postDTO.getTitle());
        post.setCategory(postDTO.getCategory());
        if (postDTO.getTags() != null) {
            post.setTags(postDTO.getTags());
        }
        if (postDTO.getImageUrls() != null) {
            post.setImageUrls(postDTO.getImageUrls());
        }
        post.setLocation(postDTO.getLocation());

        PostModerationResult moderationResult = postModerationService.moderatePost(post.getContent(), post.getImageUrls());
        post.setModerationDecision(moderationResult.getDecision().name());
        post.setModerationScore(moderationResult.getMaxCombinedScore());
        post.setModerationReasons(moderationResult.getReasons());
        if (requireAdminApproval) {
            post.setModerationStatus("PENDING_REVIEW");
        } else {
            post.setModerationStatus(moderationResult.getDecision() == ModerationDecision.ALLOW
                ? "APPROVED"
                : "PENDING_REVIEW");
            if (moderationResult.getDecision() == ModerationDecision.BLOCK) {
                post.setContent("[BLOCKED_BY_AI_MODERATION] " + (post.getContent() == null ? "" : post.getContent()));
            }
        }

        Post savedPost = postRepository.save(post);
        postModerationService.saveRecord(
            savedPost.getId(),
            savedPost.getAuthorId(),
            savedPost.getAuthorName(),
            savedPost.getContent(),
            savedPost.getImageUrls(),
            moderationResult
        );
        return mapToDTO(savedPost);
    }

    @Override
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
            .filter(post -> "APPROVED".equalsIgnoreCase(post.getModerationStatus()))
            .sorted(Comparator.comparing(Post::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PostDTO getPostById(String id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        if (post.getModerationStatus() != null && !"APPROVED".equalsIgnoreCase(post.getModerationStatus())) {
            throw new BadRequestException("Post is pending moderation and not publicly visible yet");
        }
        return mapToDTO(post);
    }

    @Override
    public List<PostDTO> getPostsByThreadId(String threadId) {
        return postRepository.findAll().stream()
            .filter(p -> p.getThreadId() != null && p.getThreadId().equals(threadId))
            .filter(post -> "APPROVED".equalsIgnoreCase(post.getModerationStatus()))
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PostDTO updatePost(String id, PostDTO postDTO) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setContent(postDTO.getContent());
        return mapToDTO(postRepository.save(post));
    }

    @Override
    public StoryGeneratorResponseDTO generateAdventureStory(StoryGeneratorRequestDTO request) {
        String content = request.getContent() == null ? "" : request.getContent().trim();
        if (content.length() < 5 || content.length() > 1000) {
            throw new BadRequestException("content must be between 5 and 1000 characters");
        }

        // ── Validation : Détection de texte sans sens (gibberish) supprimée pour éviter les faux positifs ──

        String tone = normalizeTone(request.getTone());
        String length = normalizeLength(request.getLength());
        String language = normalizeLanguage(request.getLanguage());
        String location = request.getLocation() == null ? "" : request.getLocation().trim();

        String systemPrompt = buildSystemPrompt(length, language, tone);
        String userPrompt = buildUserPrompt(content, location, tone, length, language);

        String aiOutput = openAIService.generateText(systemPrompt, userPrompt);
        if (aiOutput == null || aiOutput.isBlank() || isMockOrError(aiOutput)) {
            String fallback = buildFallbackStory(content, location, language, length);
            return new StoryGeneratorResponseDTO(fallback, content, true, "fallback");
        }

        return new StoryGeneratorResponseDTO(aiOutput.trim(), content, false, "openai");
    }

    /**
     * Détecte si un texte est du charabia (suite de lettres aléatoires sans sens).
     * Analyse 3 critères :
     * 1. Ratio de voyelles (un texte normal a entre 25% et 60% de voyelles)
     * 2. Longueur moyenne des mots (trop long = probablement du gibberish)
     * 3. Ratio de consonnes consécutives (plus de 5 consonnes de suite = suspect)
     */
    private boolean isGibberish(String text) {
        if (text == null || text.isBlank()) return false;
        String normalized = text.toLowerCase(Locale.ROOT).replaceAll("[^a-zàâäéèêëîïôùûüœç ]", " ").trim();
        if (normalized.isBlank()) return false;

        // Critère 1 : Ratio de voyelles
        String vowels = "aàâäeéèêëiîïoôuùûüœy";
        long vowelCount = normalized.chars().filter(c -> vowels.indexOf(c) >= 0).count();
        long letterCount = normalized.chars().filter(Character::isLetter).count();
        if (letterCount < 3) return false;
        double vowelRatio = (double) vowelCount / letterCount;
        // Un texte lisible a entre 25% et 65% de voyelles
        if (vowelRatio < 0.10 || vowelRatio > 0.85) return true;

        // Critère 2 : Longueur moyenne des mots
        String[] words = normalized.split("\\s+");
        double avgWordLength = java.util.Arrays.stream(words)
            .mapToInt(String::length)
            .average()
            .orElse(0);
        // Un mot moyen de plus de 12 caractères est suspect
        if (avgWordLength > 12) return true;

        // Critère 3 : Séquences trop longues de consonnes consécutives
        int maxConsecutiveConsonants = 0;
        int currentRun = 0;
        for (char c : normalized.toCharArray()) {
            if (Character.isLetter(c)) {
                if (vowels.indexOf(c) < 0) {
                    currentRun++;
                    maxConsecutiveConsonants = Math.max(maxConsecutiveConsonants, currentRun);
                } else {
                    currentRun = 0;
                }
            } else {
                currentRun = 0;
            }
        }
        if (maxConsecutiveConsonants > 5) return true;

        return false;
    }

    @Override
    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    @Override
    public List<PostDTO> getFollowingPosts(String userId) {
        // ── Fonction Complexe (Aggregation = "Join" MongoDB) ───────────────
        // Étape 1 : Récupérer les IDs des utilisateurs suivis via la collection 'follows'
        List<String> authorIds = new java.util.ArrayList<>(followService.getFollowingIds(userId));
        
        // On ajoute aussi l'ID de l'utilisateur actuel pour qu'il voie ses propres posts dans son feed
        // comme sur Instagram ou Twitter.
        authorIds.add(userId);
        
        // Étape 2 : Lancer la recherche sur la collection 'posts'
        // On récupère tous les posts des personnes suivies
        return postRepository.findAll().stream()
                .filter(p -> authorIds.contains(p.getAuthorId()))
                .filter(p -> "APPROVED".equalsIgnoreCase(p.getModerationStatus()))
                .sorted(Comparator.comparing(Post::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PostDTO toggleLike(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getModerationStatus() == null || !"APPROVED".equalsIgnoreCase(post.getModerationStatus())) {
            throw new BadRequestException("Post is not published yet");
        }

        if (post.getLikedByUsers() == null) {
            post.setLikedByUsers(new ArrayList<>());
        }

        if (post.getLikedByUsers().contains(userId)) {
            post.getLikedByUsers().remove(userId);
            post.setLikes(Math.max(0, post.getLikes() - 1));
        } else {
            post.getLikedByUsers().add(userId);
            post.setLikes(post.getLikes() + 1);
        }

        Post savedPost = postRepository.save(post);
        PostDTO dto = mapToDTO(savedPost);
        dto.setLiked(post.getLikedByUsers().contains(userId));
        return dto;
    }

    private String normalizeTone(String tone) {
        if (tone == null || tone.isBlank()) {
            return "immersive";
        }
        String normalized = tone.trim().toLowerCase(Locale.ROOT);
        return ("immersive".equals(normalized) || "default".equals(normalized)) ? normalized : "immersive";
    }

    private String normalizeLength(String length) {
        if (length == null || length.isBlank()) {
            return "medium";
        }
        String normalized = length.trim().toLowerCase(Locale.ROOT);
        return ("short".equals(normalized) || "medium".equals(normalized) || "long".equals(normalized))
            ? normalized : "medium";
    }

    private String normalizeLanguage(String language) {
        if (language == null || language.isBlank()) {
            return "fr";
        }
        String normalized = language.trim().toLowerCase(Locale.ROOT);
        return ("fr".equals(normalized) || "en".equals(normalized)) ? normalized : "fr";
    }

    private boolean isMockOrError(String text) {
        String lowered = text.toLowerCase(Locale.ROOT);
        return lowered.startsWith("mock ai response") || lowered.startsWith("error from ai service");
    }

    private String buildSystemPrompt(String length, String language, String tone) {
        String words = switch (length) {
            case "short" -> "50-80 words";
            case "long" -> "140-220 words";
            default -> "80-140 words";
        };

        if ("en".equals(language)) {
            return "You are an outdoor adventure storyteller. Rewrite the user text into a vivid, immersive, natural story. " +
                "Keep only the facts provided by the user. Do not invent major events. " +
                "Tone: " + tone + ". Length target: " + words + ".";
        }

        return "Tu es un storyteller d'aventure outdoor. Recris le texte utilisateur en francais immersif, naturel et vivant. " +
            "Conserve uniquement les faits fournis par l'utilisateur, sans inventer des evenements majeurs. " +
            "Ton: " + tone + ". Longueur cible: " + words + ".";
    }

    private String buildUserPrompt(String content, String location, String tone, String length, String language) {
        return "Texte source: " + content + "\n" +
            "Lieu: " + (location.isBlank() ? "non precise" : location) + "\n" +
            "Ton: " + tone + "\n" +
            "Longueur: " + length + "\n" +
            "Langue: " + language;
    }

    private String buildFallbackStory(String content, String location, String language, String length) {
        String compactContent = content.replaceAll("\\s+", " ").trim();
        boolean isEn = "en".equals(language);
        
        // On utilise un index basé sur la longueur du texte pour varier les templates
        int variant = (compactContent.length() % 3);

        if (isEn) {
            String[][] enTemplates = {
                {
                    location.isBlank() ? "The scene opens in the outdoors, where every detail matters." : "In " + location + ", the adventure begins with changing conditions.",
                    "From the first moment, this is the core challenge: " + compactContent + ".",
                    "With patience, adaptation, and calm decisions, the experience turns into a meaningful outdoor story."
                },
                {
                    "Exploring the wild always brings unexpected moments.",
                    "The journey took a turn when we faced this: " + compactContent + ".",
                    "It's these small details that make the camping experience truly unique."
                },
                {
                    location.isBlank() ? "Out in the fresh air, nature speaks its own language." : "Near " + location + ", the spirit of adventure was high.",
                    "The story of the day revolved around this: " + compactContent + ".",
                    "In the end, it was a lesson in resilience and outdoor passion."
                }
            };
            
            String[] t = enTemplates[variant];
            if ("short".equals(length)) return t[0] + " " + t[1];
            return t[0] + " " + t[1] + " " + t[2];
        }

        // Français
        String[][] frTemplates = {
            {
                location.isBlank() ? "L'aventure commence en pleine nature, là où chaque détail compte." : "À " + location + ", l'aventure démarre dans des conditions changeantes.",
                "Dès les premiers instants, le défi est clair : " + compactContent + ".",
                "Avec de la patience et de l'adaptation, ce moment devient une vraie histoire d'expérience outdoor."
            },
            {
                "Explorer les grands espaces réserve toujours des surprises.",
                "Tout a basculé quand nous avons rencontré cette situation : " + compactContent + ".",
                "Ce sont ces détails qui rendent chaque bivouac mémorable et authentique."
            },
            {
                location.isBlank() ? "Au grand air, la nature nous impose son propre rythme." : "Du côté de " + location + ", l'esprit d'aventure était à son comble.",
                "Le récit de la journée s'est articulé autour de ceci : " + compactContent + ".",
                "Finalement, ce fut une belle leçon de résilience et de passion pour le camping."
            }
        };

        String[] t = frTemplates[variant];
        if ("short".equals(length)) return t[0] + " " + t[1];
        return t[0] + " " + t[1] + " " + t[2];
    }

    private PostDTO mapToDTO(Post post) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setThreadId(post.getThreadId());
        dto.setAuthorId(post.getAuthorId());
        dto.setAuthorName(post.getAuthorName());
        dto.setAuthorUsername(post.getAuthorUsername());
        dto.setTitle(post.getTitle());
        dto.setCategory(post.getCategory());
        dto.setTags(post.getTags());
        dto.setImageUrls(post.getImageUrls());
        dto.setLocation(post.getLocation());
        dto.setLikes(post.getLikes());
        
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetailsImpl principal) {
                dto.setLiked(post.getLikedByUsers() != null && post.getLikedByUsers().contains(principal.getId()));
            }
        } catch (Exception e) {
            // pas de contexte sécurité
        }

        dto.setCommentCount(post.getComments() != null ? post.getComments().size() : 0);
        dto.setModerationStatus(post.getModerationStatus());
        dto.setModerationDecision(post.getModerationDecision());
        dto.setModerationScore(post.getModerationScore());
        dto.setModerationReasons(post.getModerationReasons());
        return dto;
    }
}
