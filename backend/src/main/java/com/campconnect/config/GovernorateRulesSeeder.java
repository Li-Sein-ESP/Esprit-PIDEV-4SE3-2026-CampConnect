package com.campconnect.config;

import com.campconnect.model.EnvironmentalRule;
import com.campconnect.repository.EnvironmentalRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GovernorateRulesSeeder implements CommandLineRunner {

    private final EnvironmentalRuleRepository environmentalRuleRepository;

    @Override
    public void run(String... args) {
        log.info("Checking if Governorate environmental rules need to be seeded...");

        // We check if we already have some specific regions to avoid duplicate seeding
        if (environmentalRuleRepository.findByActiveTrueAndRegionContainingIgnoreCase("Jendouba").isEmpty()) {
            log.info("Seeding Governorate environmental rules...");
            seedRules();
            log.info("Governorate environmental rules seeded successfully.");
        } else {
            log.info("Governorate environmental rules already exist. Skipping seeding.");
        }
    }

    private void seedRules() {
        List<EnvironmentalRule> rulesToSave = new ArrayList<>();

        // Nord (zones sensibles et protégées)
        rulesToSave.addAll(createRules(List.of("Jendouba"), 
            "Forêts denses, climat humide, biodiversité riche",
            List.of(
                "❌ Interdiction de feu sauvage",
                "❌ Pas de coupe d’arbres",
                "✅ Camping uniquement zones autorisées",
                "✅ Gestion stricte des déchets"
            )));

        rulesToSave.addAll(createRules(List.of("Bizerte"), 
            "Littoral + lac Ichkeul (zone protégée)",
            List.of(
                "❌ Pollution de l’eau interdite",
                "❌ Camping près des zones humides interdit",
                "✅ Respect zones Ramsar"
            )));

        rulesToSave.addAll(createRules(List.of("Béja"), 
            "Vallées agricoles, montagnes",
            List.of(
                "❌ Dégradation des sols agricoles",
                "✅ Protection des cultures",
                "✅ Gestion eau"
            )));

        rulesToSave.addAll(createRules(List.of("Le Kef"), 
            "Hauts plateaux, zones fragiles",
            List.of(
                "❌ Surpâturage",
                "✅ Préservation sol",
                "✅ Zones de camping limitées"
            )));

        rulesToSave.addAll(createRules(List.of("Siliana"), 
            "Mix montagnes/plaines",
            List.of(
                "❌ Feux",
                "✅ Respect biodiversité",
                "✅ Nettoyage obligatoire"
            )));

        rulesToSave.addAll(createRules(List.of("Zaghouan"), 
            "Montagnes + sources d’eau",
            List.of(
                "❌ Pollution des sources",
                "❌ constructions sauvages",
                "✅ zones écologiques protégées"
            )));

        rulesToSave.addAll(createRules(List.of("Tunis", "Ariana", "Ben Arous", "Manouba"), 
            "Zones urbaines + zones humides",
            List.of(
                "❌ Camping sauvage interdit",
                "❌ Pollution",
                "✅ Espaces verts protégés"
            )));

        // Centre (zones agricoles et semi-arides)
        rulesToSave.addAll(createRules(List.of("Nabeul"), 
            "Péninsule, agriculture + plages",
            List.of(
                "❌ Pollution marine",
                "❌ camping sur dunes",
                "✅ protection littoral"
            )));

        rulesToSave.addAll(createRules(List.of("Sousse", "Monastir", "Mahdia"), 
            "Zones côtières touristiques",
            List.of(
                "❌ déchets sur plages",
                "❌ pollution mer",
                "✅ zones camping organisées"
            )));

        rulesToSave.addAll(createRules(List.of("Kairouan"), 
            "Plaine semi-aride",
            List.of(
                "❌ gaspillage eau",
                "❌ dégradation sol",
                "✅ irrigation contrôlée"
            )));

        rulesToSave.addAll(createRules(List.of("Kasserine"), 
            "Montagnes (Chaambi)",
            List.of(
                "❌ feu",
                "❌ chasse illégale",
                "✅ zones protégées"
            )));

        rulesToSave.addAll(createRules(List.of("Sidi Bouzid"), 
            "Plateau agricole",
            List.of(
                "❌ pollution agricole",
                "✅ gestion durable eau",
                "✅ protection sol"
            )));

        rulesToSave.addAll(createRules(List.of("Sfax"), 
            "Zone industrielle + littoral",
            List.of(
                "❌ pollution industrielle",
                "❌ déchets chimiques",
                "✅ contrôle environnement"
            )));

        // Sud (zones désertiques fragiles)
        rulesToSave.addAll(createRules(List.of("Gabès"), 
            "Oasis + mer",
            List.of(
                "❌ pollution oasis",
                "❌ surexploitation eau",
                "✅ protection palmeraies"
            )));

        rulesToSave.addAll(createRules(List.of("Medenine"), 
            "Zone désertique",
            List.of(
                "❌ dégradation dunes",
                "✅ respect écosystème",
                "✅ déchets contrôlés"
            )));

        rulesToSave.addAll(createRules(List.of("Tataouine"), 
            "Désert rocheux",
            List.of(
                "❌ destruction formations géologiques",
                "✅ tourisme durable"
            )));

        rulesToSave.addAll(createRules(List.of("Gafsa"), 
            "Bassin minier",
            List.of(
                "❌ pollution minière",
                "✅ réhabilitation sites"
            )));

        rulesToSave.addAll(createRules(List.of("Tozeur", "Kébili"), 
            "Chotts + désert",
            List.of(
                "❌ circulation hors pistes",
                "❌ pollution sel",
                "✅ tourisme encadré"
            )));

        environmentalRuleRepository.saveAll(rulesToSave);
    }

    private List<EnvironmentalRule> createRules(List<String> regions, String description, List<String> ruleLines) {
        List<EnvironmentalRule> result = new ArrayList<>();

        for (String region : regions) {
            // Add description as a context rule
            result.add(EnvironmentalRule.builder()
                    .title("Contexte Géographique et Climatique")
                    .description("Environnement de la région de " + region + " : " + description)
                    .category("CONTEXT")
                    .icon("info")
                    .severity("INFO")
                    .region(region)
                    .active(true)
                    .build());

            // Add individual rules
            for (String line : ruleLines) {
                String cleanLine = line.substring(2).trim(); // Remove the icon and space
                boolean isRestriction = line.startsWith("❌");
                
                String title = cleanLine;
                if(title.length() > 50) {
                   title = title.substring(0, 47) + "...";
                }

                result.add(EnvironmentalRule.builder()
                        .title(title)
                        .description(cleanLine)
                        .category(isRestriction ? "RESTRICTION" : "GUIDELINE")
                        .icon(isRestriction ? "warning" : "check_circle")
                        .severity(isRestriction ? "HIGH" : "MEDIUM")
                        .region(region)
                        .active(true)
                        .build());
            }
        }
        return result;
    }
}
