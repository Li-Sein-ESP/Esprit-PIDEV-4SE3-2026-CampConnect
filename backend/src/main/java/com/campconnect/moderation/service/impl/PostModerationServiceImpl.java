package com.campconnect.moderation.service.impl;

import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.moderation.ModerationDecision;
import com.campconnect.moderation.dto.ImageModerationPrediction;
import com.campconnect.moderation.dto.PostModerationResult;
import com.campconnect.moderation.model.ModerationImageEvidence;
import com.campconnect.moderation.model.PostModerationRecord;
import com.campconnect.moderation.repository.PostModerationRecordRepository;
import com.campconnect.moderation.service.PostModerationService;
import com.campconnect.model.Incident;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.model.Post;
import com.campconnect.model.User;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostModerationServiceImpl implements PostModerationService {

    private static final String STATUS_PENDING = "PENDING_REVIEW";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_REJECTED = "REJECTED";

    private final PostModerationRecordRepository moderationRecordRepository;
    private final PostRepository postRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final com.campconnect.service.EmailNotificationService emailNotificationService;

    @Value("${moderation.python.command:python}")
    private String pythonCommand;

    @Value("${moderation.python.script:ml/moderation/predict_moderation.py}")
    private String moderationScriptPath;

    @Value("${moderation.data.dir:C:/Users/marye/Downloads/datasets_clean}")
    private String moderationDatasetDir;

    @Value("${moderation.model.dir:ml/models}")
    private String moderationModelDir;

    @Value("${moderation.threshold.review:0.30}")
    private double reviewThreshold;

    @Value("${moderation.threshold.block:0.75}")
    private double blockThreshold;

    @Value("${moderation.text.keyword.weight:0.35}")
    private double textKeywordWeight;

    @Value("${moderation.user.auto-ban.block-count:3}")
    private long autoBanBlockCount;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public PostModerationResult moderatePost(String content, List<String> imageUrls) {
        List<String> safeImageUrls = imageUrls == null ? List.of() : imageUrls;

        // Always evaluate text risk, even without images
        double textRisk = computeTextRiskScore(content);
        log.info("[Moderation] images={}, textRisk={:.3f}, workingDir={}",
                safeImageUrls.size(), textRisk,
                Paths.get("").toAbsolutePath().toString());

        if (safeImageUrls.isEmpty()) {
            ModerationDecision textDecision = decide(textRisk);
            List<String> reasons = new ArrayList<>();
            if (textRisk >= reviewThreshold) {
                reasons.add("Dangerous keywords detected in text");
            } else {
                reasons.add("No images provided - text only post approved");
            }
            return PostModerationResult.builder()
                    .decision(textDecision)
                    .maxCombinedScore(textRisk)
                    .avgCombinedScore(textRisk)
                    .reasons(reasons)
                    .predictions(List.of())
                    .build();
        }

        List<ImageModerationPrediction> predictions = new ArrayList<>();
        for (String imageUrl : safeImageUrls) {
            ImageModerationPrediction prediction = evaluateSingleImage(imageUrl, content);
            predictions.add(prediction);
        }

        double maxScore = predictions.stream().mapToDouble(ImageModerationPrediction::getCombinedScore).max().orElse(0.0);
        double avgScore = predictions.stream().mapToDouble(ImageModerationPrediction::getCombinedScore).average().orElse(0.0);

        ModerationDecision finalDecision = ModerationDecision.ALLOW;
        if (predictions.stream().anyMatch(p -> p.getDecision() == ModerationDecision.BLOCK)) {
            finalDecision = ModerationDecision.BLOCK;
        } else if (predictions.stream().anyMatch(p -> p.getDecision() == ModerationDecision.REVIEW)) {
            finalDecision = ModerationDecision.REVIEW;
        }

        Set<String> reasonSet = new LinkedHashSet<>();
        for (ImageModerationPrediction prediction : predictions) {
            reasonSet.addAll(prediction.getReasons());
        }

        return PostModerationResult.builder()
                .decision(finalDecision)
                .maxCombinedScore(maxScore)
                .avgCombinedScore(avgScore)
                .reasons(new ArrayList<>(reasonSet))
                .predictions(predictions)
                .build();
    }

    @Override
    public PostModerationRecord saveRecord(String postId, String authorId, String authorName, String content, List<String> imageUrls, PostModerationResult result) {
        List<ModerationImageEvidence> evidence = result.getPredictions().stream()
                .map(prediction -> ModerationImageEvidence.builder()
                        .sourceUrl(prediction.getSourceUrl())
                        .resolvedPath(prediction.getResolvedPath())
                        .unsafeProbability(prediction.getUnsafeProbability())
                        .textRiskScore(prediction.getTextRiskScore())
                        .combinedScore(prediction.getCombinedScore())
                        .decision(prediction.getDecision())
                        .reasons(prediction.getReasons())
                        .modelName(prediction.getModelName())
                        .rawOutput(prediction.getRawOutput())
                        .build())
                .collect(Collectors.toList());

        String status = result.getDecision() == ModerationDecision.ALLOW ? STATUS_APPROVED : STATUS_PENDING;

        PostModerationRecord record = PostModerationRecord.builder()
                .postId(postId)
                .authorId(authorId)
                .authorName(authorName)
                .content(content)
                .imageUrls(imageUrls)
                .decision(result.getDecision())
                .status(status)
                .maxCombinedScore(result.getMaxCombinedScore())
                .avgCombinedScore(result.getAvgCombinedScore())
                .reasons(result.getReasons())
                .evidence(evidence)
                .updatedAt(LocalDateTime.now())
                .build();

        PostModerationRecord saved = moderationRecordRepository.save(record);

        if (result.getDecision() != ModerationDecision.ALLOW) {
            createModerationIncident(saved);
        }

        if (result.getDecision() == ModerationDecision.BLOCK && authorId != null && !authorId.isBlank()) {
            long blockedCount = moderationRecordRepository.countByAuthorIdAndDecision(authorId, ModerationDecision.BLOCK);
            if (blockedCount >= autoBanBlockCount) {
                banUserByModeration(authorId);
            }
        }

        return saved;
    }

    @Override
    public List<PostModerationRecord> getPendingRecords() {
        return moderationRecordRepository.findByStatusOrderByCreatedAtDesc(STATUS_PENDING);
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void trainModel() {
        Path scriptPath = resolveModerationScriptPath();

        if (scriptPath == null) {
            log.error("[Moderation] Cannot start training: Script not found");
            return;
        }

        Path modelDir = resolveModelDirPath();
        Path modelPath = modelDir.resolve("image_safety_model.pkl");

        log.info("[Moderation] STARTING model training process... (This may take a few minutes)");

        List<String> command = List.of(
                pythonCommand,
                scriptPath.toString(),
                "train",
                "--dataset-dir",
                moderationDatasetDir,
                "--model-path",
                modelPath.toString(),
                "--image-size",
                "64",
                "--max-samples-per-class",
                "300"  // Reduced for fast training (~1-2 min). Increase to 3000 for production.
        );

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();
            
            // Read output in a separate thread to avoid blocking the @Async thread if needed,
            // or just wait since we are already in an @Async method.
            // But let's log the output lines as they come.
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.info("[Moderation-Python] {}", line);
                }
            }
            
            int exitCode = process.waitFor();
            if (exitCode == 0) {
                log.info("[Moderation] Model training COMPLETED successfully.");
            } else {
                log.error("[Moderation] Model training FAILED with exit code {}", exitCode);
            }
        } catch (Exception ex) {
            log.error("[Moderation] Training invocation CRASHED: {}", ex.getMessage());
        }
    }

    @Override
    public PostModerationRecord approveRecord(String recordId, String adminUserId, String note) {
        log.info("[Moderation] Admin {} is approving record {}", adminUserId, recordId);
        
        PostModerationRecord record = moderationRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Moderation record", "id", recordId));

        Post post = postRepository.findById(record.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", record.getPostId()));

        // Clean up the content by removing the AI block prefix
        String content = post.getContent();
        if (content != null && content.startsWith("[BLOCKED_BY_AI_MODERATION] ")) {
            post.setContent(content.substring("[BLOCKED_BY_AI_MODERATION] ".length()));
        } else if (content != null && content.startsWith("[BLOCKED_BY_AI_MODERATION]")) {
            post.setContent(content.substring("[BLOCKED_BY_AI_MODERATION]".length()));
        }

        post.setModerationStatus(STATUS_APPROVED);
        post.setModerationDecision(ModerationDecision.ALLOW.name());
        post.setModerationScore(record.getMaxCombinedScore());
        post.setModerationReasons(record.getReasons());
        postRepository.save(post);

        record.setStatus(STATUS_APPROVED);
        record.setAdminDecision("APPROVED_BY_ADMIN");
        record.setAdminNote(note);
        record.setReviewedBy(adminUserId);
        record.setReviewedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        
        PostModerationRecord saved = moderationRecordRepository.save(record);
        log.info("[Moderation] Record {} approved successfully. Post {} is now public.", recordId, record.getPostId());
        return saved;
    }

    @Override
    public PostModerationRecord rejectRecord(String recordId, String adminUserId, String note, boolean banUser) {
        PostModerationRecord record = moderationRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Moderation record", "id", recordId));

        Post post = postRepository.findById(record.getPostId())
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", record.getPostId()));

        post.setModerationStatus(STATUS_REJECTED);
        post.setModerationDecision(ModerationDecision.BLOCK.name());
        post.setModerationScore(record.getMaxCombinedScore());
        post.setModerationReasons(record.getReasons());
        postRepository.save(post);

        record.setStatus(STATUS_REJECTED);
        record.setAdminDecision("REJECTED_BY_ADMIN");
        record.setAdminNote(note);
        record.setReviewedBy(adminUserId);
        record.setReviewedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        PostModerationRecord saved = moderationRecordRepository.save(record);

        if (banUser) {
            banUserByModeration(record.getAuthorId());
        }

        return saved;
    }

    private void banUserByModeration(String authorId) {
        if (authorId == null || authorId.isBlank()) {
            return;
        }

        Optional<User> userOpt = userRepository.findById(authorId);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        user.setVerifiedExpert(false);
        
        // Incrémenter le compteur de bannissements (Strikes)
        int currentBanCount = user.getBanCount() + 1;
        user.setBanCount(currentBanCount);
        
        // Déterminer le statut final
        String moderationStatus = (currentBanCount >= 2) ? "PERMANENTLY_BANNED" : "BANNED";
        String emailMessage = (currentBanCount >= 2) 
            ? "Votre compte a été banni DÉFINITIVEMENT suite à une récidive de contenu dangereux. Conformément à nos règles, aucune réactivation n'est possible."
            : "Votre compte a été suspendu suite à la détection de contenu inapproprié. Vous avez une seule chance de le réactiver en passant notre quiz de sécurité.";

        user.setProfileDetails(new java.util.HashMap<>(Map.of(
                "moderationStatus", moderationStatus,
                "reason", "Récidive ou contenu grave détecté par notre système IA",
                "strikeCount", currentBanCount
        )));
        
        userRepository.save(user);

        // ── Notification proactive par email ──────────────────────────────────
        String userEmail = user.getEmail();
        String username = user.getUsername() != null ? user.getUsername() : user.getEmail();
        emailNotificationService.sendBanNotification(
            userEmail, 
            username, 
            emailMessage
        );
        log.info("[Moderation] Email de bannissement ({}) envoyé à {}", moderationStatus, userEmail);
    }

    private ImageModerationPrediction evaluateSingleImage(String imageUrl, String content) {
        String resolvedPath = resolveImagePath(imageUrl);
        double textRisk = computeTextRiskScore(content);

        if (resolvedPath == null) {
            // Image present but cannot be verified on disk — flag for REVIEW as a security precaution
            // Score 0.45 always triggers REVIEW (above 0.30 threshold)
            double fallbackScore = clamp(0.45 + (textRisk * textKeywordWeight));
            ModerationDecision fallbackDecision = decide(fallbackScore);
            log.warn("[Moderation] Cannot resolve image path '{}' → forcing {} (score={})",
                    imageUrl, fallbackDecision, fallbackScore);
            List<String> reasons = new ArrayList<>();
            reasons.add("Image could not be verified on server — manual review required");
            if (textRisk >= reviewThreshold) {
                reasons.add("Risky textual context detected");
            }
            return ImageModerationPrediction.builder()
                    .sourceUrl(imageUrl)
                    .resolvedPath(null)
                    .unsafeProbability(0.45)
                    .textRiskScore(textRisk)
                    .combinedScore(fallbackScore)
                    .decision(fallbackDecision)
                    .reasons(reasons)
                    .modelName("ml-moderation-fallback")
                    .success(false)
                    .rawOutput("{}")
                    .build();
        }

        PythonModerationResponse pythonResponse = invokePythonPrediction(resolvedPath, content);
        double unsafeProbability = pythonResponse.unsafeProbability();
        
        // Evaluate decisions separately for image and text to avoid dilution
        ModerationDecision imageDecision = decide(unsafeProbability);
        ModerationDecision textDecision = decide(textRisk);
        
        // Take the most restrictive decision
        ModerationDecision decision = (imageDecision.ordinal() > textDecision.ordinal()) ? imageDecision : textDecision;
        
        double combinedScore = clamp((unsafeProbability * (1.0 - textKeywordWeight)) + (textRisk * textKeywordWeight));

        List<String> reasons = new ArrayList<>();
        reasons.addAll(pythonResponse.reasons());
        if (textRisk >= reviewThreshold) {
            reasons.add("Risky textual context detected");
        }
        if (reasons.isEmpty()) {
            reasons.add("Manual review recommended");
        }

        return ImageModerationPrediction.builder()
                .sourceUrl(imageUrl)
                .resolvedPath(resolvedPath)
                .unsafeProbability(unsafeProbability)
                .textRiskScore(textRisk)
                .combinedScore(combinedScore)
                .decision(decision)
                .reasons(reasons)
                .modelName(pythonResponse.modelName())
                .success(pythonResponse.success())
                .rawOutput(pythonResponse.rawOutput())
                .build();
    }

    private ModerationDecision decide(double score) {
        if (score >= blockThreshold) {
            return ModerationDecision.BLOCK;
        }
        if (score >= reviewThreshold) {
            return ModerationDecision.REVIEW;
        }
        return ModerationDecision.ALLOW;
    }

    private String resolveImagePath(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) {
            return null;
        }

        if (!imageUrl.startsWith("/uploads/")) {
            log.debug("[Moderation] Skipping non-upload URL: {}", imageUrl);
            return null;
        }

        String relative = imageUrl.substring("/uploads/".length());
        String workingDir = Paths.get("").toAbsolutePath().toString();
        log.info("[Moderation] Resolving image '{}', relative='{}', workingDir='{}', uploadDir='{}'",
                imageUrl, relative, workingDir, uploadDir);

        List<Path> candidates = new ArrayList<>();
        // 1st: configured upload dir (same as FileStorageService)
        candidates.add(Paths.get(uploadDir).toAbsolutePath().normalize());
        // 2nd: 'uploads' relative to current working directory
        candidates.add(Paths.get("uploads").toAbsolutePath().normalize());
        // 3rd: 'backend/uploads' (if running from project root)
        candidates.add(Paths.get("backend", "uploads").toAbsolutePath().normalize());

        for (Path base : candidates) {
            try {
                Path resolved = base.resolve(relative).normalize();
                log.debug("[Moderation] Trying path: {}", resolved);
                if (!resolved.startsWith(base)) {
                    continue;
                }
                if (Files.exists(resolved)) {
                    log.info("[Moderation] Found image at: {}", resolved);
                    return resolved.toString();
                }
            } catch (Exception e) {
                log.warn("[Moderation] Error checking path {}: {}", base, e.getMessage());
            }
        }

        log.warn("[Moderation] Image not found at any candidate path. URL={}, workingDir={}",
                imageUrl, workingDir);
        return null;
    }

    private PythonModerationResponse invokePythonPrediction(String imagePath, String content) {
        Path scriptPath = resolveModerationScriptPath();
        if (scriptPath == null) {
            log.warn("Moderation script not found at {}", scriptPath);
            return PythonModerationResponse.fallback("Script not found");
        }

        Path modelDir = resolveModelDirPath();
        Path modelPath = modelDir.resolve("image_safety_model.pkl");

        List<String> command = new ArrayList<>();
        command.add(pythonCommand);
        command.add(scriptPath.toString());
        command.add("predict");
        command.add("--image-path");
        command.add(imagePath);
        command.add("--model-path");
        command.add(modelPath.toString());
        command.add("--dataset-dir");
        command.add(moderationDatasetDir);
        command.add("--text");
        command.add(content == null ? "" : content);

        ProcessBuilder processBuilder = new ProcessBuilder(command);
        processBuilder.redirectErrorStream(true);

        String output = "";
        try {
            Process process = processBuilder.start();
            output = readOutput(process);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.warn("Moderation python process exited with code {} and output: {}", exitCode, output);
                return PythonModerationResponse.fallback(output);
            }

            JsonNode root = objectMapper.readTree(output);
            boolean success = root.path("success").asBoolean(false);
            if (!success) {
                return PythonModerationResponse.fallback(output);
            }

            double unsafeProbability = clamp(root.path("unsafe_probability").asDouble(0.15));
            String modelName = root.path("model_name").asText("image-safety-baseline");
            List<String> reasons = new ArrayList<>();
            JsonNode reasonsNode = root.path("reasons");
            if (reasonsNode.isArray()) {
                reasonsNode.forEach(node -> reasons.add(node.asText()));
            }

            if (reasons.isEmpty()) {
                reasons.add("Model evaluated image without critical warning");
            }

            return new PythonModerationResponse(true, unsafeProbability, modelName, reasons, output);
        } catch (Exception ex) {
            log.warn("Moderation python invocation failed: {}", ex.getMessage());
            return PythonModerationResponse.fallback(output.isBlank() ? ex.getMessage() : output);
        }
    }

    private String readOutput(Process process) throws IOException {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    private Path resolveExistingPath(List<String> rawPaths) {
        for (String rawPath : rawPaths) {
            if (rawPath == null || rawPath.isBlank()) {
                continue;
            }
            Path path = Paths.get(rawPath).toAbsolutePath().normalize();
            if (Files.exists(path)) {
                return path;
            }
        }
        return null;
    }

    private Path resolveModerationScriptPath() {
        String userDir = System.getProperty("user.dir");
        log.info("[Moderation] Attempting to resolve script. Working directory: {}", userDir);
        
        List<String> candidates = new ArrayList<>();
        candidates.add(moderationScriptPath);
        candidates.add(Paths.get(userDir, moderationScriptPath).toString());
        candidates.add(Paths.get(userDir, "backend", moderationScriptPath).toString());
        candidates.add(Paths.get(userDir, "ml", "moderation", "predict_moderation.py").toString());
        candidates.add(Paths.get(userDir, "backend", "ml", "moderation", "predict_moderation.py").toString());
        
        // Handle nested folder structure (Esprit-PIDEV.../Esprit-PIDEV...)
        String folderName = new File(userDir).getName();
        candidates.add(Paths.get(userDir, folderName, "backend", "ml", "moderation", "predict_moderation.py").toString());
        candidates.add(Paths.get(userDir, folderName, "ml", "moderation", "predict_moderation.py").toString());
        
        // Specific user path seen in workspace
        candidates.add(Paths.get(userDir, "Esprit-PIDEV-4SE3-2026-CampConnect-Nawres_Persona2", "backend", "ml", "moderation", "predict_moderation.py").toString());

        Path resolved = resolveExistingPath(candidates);
        if (resolved != null) {
            log.info("[Moderation] Script resolved to: {}", resolved);
        } else {
            log.error("[Moderation] FAILED to resolve script in any of: {}", candidates);
        }
        return resolved;
    }

    private Path resolveModelDirPath() {
        String userDir = System.getProperty("user.dir");
        String folderName = new File(userDir).getName();
        
        List<String> candidates = new ArrayList<>();
        candidates.add(moderationModelDir);
        candidates.add(Paths.get(userDir, moderationModelDir).toString());
        candidates.add(Paths.get(userDir, "backend", moderationModelDir).toString());
        candidates.add(Paths.get(userDir, folderName, "backend", moderationModelDir).toString());
        candidates.add(Paths.get(userDir, "ml", "models").toString());
        candidates.add(Paths.get(userDir, "backend", "ml", "models").toString());
        candidates.add(Paths.get(userDir, folderName, "backend", "ml", "models").toString());
        
        for (String c : candidates) {
            Path p = Paths.get(c).toAbsolutePath().normalize();
            if (Files.exists(p)) {
                return p;
            }
        }
        return Paths.get(moderationModelDir).toAbsolutePath().normalize();
    }

    private double computeTextRiskScore(String content) {
        if (content == null || content.isBlank()) {
            return 0.0;
        }

        String normalized = content.toLowerCase(Locale.ROOT);
        List<String> riskyKeywords = List.of(
                "kill", "knife", "weapon", "blood", "bomb", "hate", "nazi",
                "terror", "violence", "attack", "abuse", "racist", "extremist",
                "tuer", "couteau", "arme", "sang", "bombe", "haine", "terrorisme",
                "violence", "attaque", "abus", "raciste", "extremiste", "fusil", "pistolet"
        );

        long hits = riskyKeywords.stream().filter(normalized::contains).count();
        if (hits == 0) {
            return 0.0;
        }

        return clamp((double) hits / (double) riskyKeywords.size() * 3.0);
    }

    private double clamp(double value) {
        if (value < 0.0) {
            return 0.0;
        }
        if (value > 1.0) {
            return 1.0;
        }
        return value;
    }

    private void createModerationIncident(PostModerationRecord record) {
        Incident incident = Incident.builder()
                .title("Community post flagged by AI moderation")
                .description(buildIncidentDescription(record))
                .severity(record.getDecision() == ModerationDecision.BLOCK ? "high" : "medium")
                .level(record.getDecision() == ModerationDecision.BLOCK ? "critical" : "warning")
                .regionName("Community Feed")
                .latitude(0.0)
                .longitude(0.0)
                .reporterId(record.getAuthorId())
                .location("community")
                .status("pending")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .reportedAt(LocalDateTime.now())
                .build();

        incidentRepository.save(incident);
    }

    private String buildIncidentDescription(PostModerationRecord record) {
        String reasons = record.getReasons() == null || record.getReasons().isEmpty()
                ? "No explicit reasons"
                : String.join(", ", record.getReasons());
        return "PostId=" + record.getPostId()
                + ", author=" + (record.getAuthorName() == null ? "unknown" : record.getAuthorName())
                + ", decision=" + record.getDecision()
                + ", score=" + String.format(Locale.ROOT, "%.3f", record.getMaxCombinedScore())
                + ", reasons=" + reasons;
    }

    @Override
    public Map<String, Object> getModelStatus() {
        Map<String, Object> status = new LinkedHashMap<>();
        Path modelDir = resolveModelDirPath();
        Path modelPath = modelDir.resolve("image_safety_model.pkl");

        boolean exists = Files.exists(modelPath);
        status.put("exists", exists);
        status.put("modelName", "image_safety_rf_v2 (Random Forest)");
        status.put("imageSize", 64);
        status.put("reviewThreshold", reviewThreshold);
        status.put("blockThreshold", blockThreshold);
        status.put("pythonPath", pythonCommand);

        if (exists) {
            try {
                status.put("lastModified", Files.getLastModifiedTime(modelPath).toString());
                status.put("sizeBytes", Files.size(modelPath));
            } catch (IOException e) {
                status.put("error", "Could not read model metadata: " + e.getMessage());
            }
        } else {
            status.put("warning", "Model file not found. Training recommended.");
        }

        return status;
    }

    private record PythonModerationResponse(boolean success,
                                            double unsafeProbability,
                                            String modelName,
                                            List<String> reasons,
                                            String rawOutput) {
        static PythonModerationResponse fallback(String rawOutput) {
            return new PythonModerationResponse(
                    false,
                    0.45, // Risk score 0.45 triggers Manual Review (above 0.20 threshold)
                    "ml-moderation-fallback",
                    List.of("AI Moderation encountered an error - Manual review required"),
                    rawOutput == null ? "" : rawOutput
            );
        }
    }
}
