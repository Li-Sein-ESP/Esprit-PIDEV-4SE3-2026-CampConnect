package com.campconnect.service;

import com.campconnect.dto.AtRiskUserDto;
import com.campconnect.dto.CampGuardKpiDto;
import com.campconnect.dto.TriggerActionsResponseDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CampGuardService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;

    @Value("${campguard.files.predictions-path:campguard_predictions.csv}")
    private String predictionsPath;

    @Value("${campguard.files.queue-path:campaign_queue_antispam.csv}")
    private String queuePath;

    @Value("${campguard.files.history-path:campaign_history.csv}")
    private String historyPath;

    @Value("${campguard.logic.antispam-days:7}")
    private long antiSpamDays;

    @Value("${campguard.kpi.recall:0.0}")
    private double recall;

    @Value("${campguard.kpi.precision:0.0}")
    private double precision;

    @Value("${campguard.kpi.reengagement-rate:0.0}")
    private double reengagementRate;

    @Value("${campguard.kpi.churn-before:0.0}")
    private double churnBefore;

    @Value("${campguard.kpi.churn-after:0.0}")
    private double churnAfter;

    public List<AtRiskUserDto> getAtRiskUsers(String level, String search) {
        List<Map<String, String>> predictionRows = readCsv(resolvePath(predictionsPath));
        Map<String, LocalDate> lastActionByCustomer = buildLastContactDateMap(readCsv(resolvePath(historyPath)));

        return predictionRows.stream()
                .map(row -> toAtRiskUser(row, lastActionByCustomer.get(normalizeId(row.get("customer_id")))))
                .filter(Objects::nonNull)
                .filter(user -> filterByLevel(user, level))
                .filter(user -> filterBySearch(user, search))
                .sorted(Comparator.comparing(AtRiskUserDto::getChurnScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    public synchronized TriggerActionsResponseDto triggerActions() {
        Path queueFile = resolvePath(queuePath);
        Path historyFile = resolvePath(historyPath);

        List<Map<String, String>> queueRows = readCsv(queueFile);
        List<Map<String, String>> historyRows = readCsv(historyFile);
        Map<String, LocalDate> lastActionByCustomer = buildLastContactDateMap(historyRows);

        LocalDate today = LocalDate.now();
        int queued = 0;
        int skipped = 0;

        for (Map<String, String> row : queueRows) {
            String customerId = normalizeId(row.get("customer_id"));
            if (customerId.isBlank()) {
                continue;
            }

            LocalDate lastActionDate = lastActionByCustomer.get(customerId);
            boolean eligible = lastActionDate == null || ChronoUnit.DAYS.between(lastActionDate, today) >= antiSpamDays;

            row.put("last_action_date", lastActionDate == null ? "" : DATE_FORMAT.format(lastActionDate));
            row.put("days_since_last_action", lastActionDate == null ? "9999" : String.valueOf(ChronoUnit.DAYS.between(lastActionDate, today)));

            if (eligible) {
                row.put("eligible_to_contact", "true");
                row.put("status", "queued");
                queued++;
            } else {
                row.put("eligible_to_contact", "false");
                row.put("status", "skipped_antispam");
                row.put("action", "monitoring");
                skipped++;
            }

            Map<String, String> historyEntry = new LinkedHashMap<>();
            historyEntry.put("customer_id", customerId);
            historyEntry.put("date_action", DATE_FORMAT.format(today));
            historyEntry.put("action", row.getOrDefault("action", "monitoring"));
            historyEntry.put("risk_level", row.getOrDefault("risk_level", "Low"));
            historyEntry.put("status", row.getOrDefault("status", "queued"));
            historyRows.add(historyEntry);
        }

        writeCsv(queueFile, queueRows, defaultQueueHeaders(queueRows));
        writeCsv(historyFile, historyRows, List.of("customer_id", "date_action", "action", "risk_level", "status"));

        return new TriggerActionsResponseDto(queued, skipped, DATE_FORMAT.format(today));
    }

    public CampGuardKpiDto getKpis() {
        List<Map<String, String>> predictionRows = readCsv(resolvePath(predictionsPath));
        int high = 0;
        int medium = 0;
        int low = 0;

        for (Map<String, String> row : predictionRows) {
            String riskLevel = row.getOrDefault("risk_level", "").trim().toLowerCase(Locale.ROOT);
            switch (riskLevel) {
                case "high" -> high++;
                case "medium" -> medium++;
                default -> low++;
            }
        }

        return new CampGuardKpiDto(
                high,
                medium,
                low,
                recall,
                precision,
                reengagementRate,
                churnBefore,
                churnAfter
        );
    }

    private AtRiskUserDto toAtRiskUser(Map<String, String> row, LocalDate lastActionDate) {
        String customerId = normalizeId(row.get("customer_id"));
        if (customerId.isBlank()) {
            return null;
        }

        Double churnScore = parseDouble(row.get("churn_score"));
        String riskLevel = row.getOrDefault("risk_level", "Low");
        String action = row.getOrDefault("action", "monitoring");
        String lastActionDateValue = lastActionDate == null ? "" : DATE_FORMAT.format(lastActionDate);

        return new AtRiskUserDto(customerId, churnScore, riskLevel, action, lastActionDateValue);
    }

    private boolean filterByLevel(AtRiskUserDto user, String level) {
        if (level == null || level.isBlank()) {
            return true;
        }
        return user.getRiskLevel() != null && user.getRiskLevel().equalsIgnoreCase(level.trim());
    }

    private boolean filterBySearch(AtRiskUserDto user, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        return user.getCustomerId() != null
                && user.getCustomerId().toLowerCase(Locale.ROOT).contains(search.trim().toLowerCase(Locale.ROOT));
    }

    private Map<String, LocalDate> buildLastContactDateMap(List<Map<String, String>> historyRows) {
        Map<String, LocalDate> latestByCustomer = new HashMap<>();
        for (Map<String, String> row : historyRows) {
            String customerId = normalizeId(row.get("customer_id"));
            String status = normalizeId(row.get("status")).toLowerCase(Locale.ROOT);
            if ("skipped_antispam".equals(status)) {
                continue;
            }
            LocalDate actionDate = parseDate(row.get("date_action"));
            if (customerId.isBlank() || actionDate == null) {
                continue;
            }
            LocalDate current = latestByCustomer.get(customerId);
            if (current == null || actionDate.isAfter(current)) {
                latestByCustomer.put(customerId, actionDate);
            }
        }
        return latestByCustomer;
    }

    private List<String> defaultQueueHeaders(List<Map<String, String>> queueRows) {
        if (queueRows.isEmpty()) {
            return List.of("customer_id", "churn_score", "risk_level", "action", "pred_churn",
                    "priority", "priority_rank", "last_action_date", "days_since_last_action",
                    "eligible_to_contact", "status");
        }

        List<String> headers = new ArrayList<>(queueRows.get(0).keySet());
        if (!headers.contains("last_action_date")) {
            headers.add("last_action_date");
        }
        if (!headers.contains("days_since_last_action")) {
            headers.add("days_since_last_action");
        }
        if (!headers.contains("eligible_to_contact")) {
            headers.add("eligible_to_contact");
        }
        if (!headers.contains("status")) {
            headers.add("status");
        }
        return headers;
    }

    private Path resolvePath(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return Path.of("").toAbsolutePath().normalize();
        }

        Path configured = Path.of(filePath).normalize();
        Path configuredAbsolute = configured.isAbsolute()
                ? configured
                : Path.of("").toAbsolutePath().resolve(configured).normalize();

        if (Files.exists(configuredAbsolute)) {
            return configuredAbsolute;
        }

        String filename = configured.getFileName() == null ? filePath : configured.getFileName().toString();
        Path cwd = Path.of("").toAbsolutePath().normalize();

        List<Path> candidates = List.of(
                cwd.resolve(filename),
                cwd.resolve("backend").resolve(filename),
                cwd.resolve("connectcamp").resolve("backend").resolve(filename),
                cwd.getParent() != null ? cwd.getParent().resolve("backend").resolve(filename).normalize() : cwd.resolve(filename)
        );

        for (Path candidate : candidates) {
            if (Files.exists(candidate)) {
                return candidate;
            }
        }

        return configuredAbsolute;
    }

    private List<Map<String, String>> readCsv(Path path) {
        if (!Files.exists(path)) {
            return new ArrayList<>();
        }

        try {
            List<String> lines = Files.readAllLines(path, StandardCharsets.UTF_8);
            if (lines.isEmpty()) {
                return new ArrayList<>();
            }

            List<String> headers = parseCsvLine(lines.get(0));
            List<Map<String, String>> rows = new ArrayList<>();

            for (int i = 1; i < lines.size(); i++) {
                String line = lines.get(i);
                if (line == null || line.isBlank()) {
                    continue;
                }
                List<String> values = parseCsvLine(line);
                Map<String, String> row = new LinkedHashMap<>();
                for (int j = 0; j < headers.size(); j++) {
                    String header = headers.get(j).trim();
                    String value = j < values.size() ? values.get(j) : "";
                    row.put(header, value);
                }
                rows.add(row);
            }

            return rows;
        } catch (IOException e) {
            throw new IllegalStateException("Unable to read CampGuard CSV file: " + path, e);
        }
    }

    private void writeCsv(Path path, List<Map<String, String>> rows, List<String> headers) {
        try {
            List<String> lines = new ArrayList<>();
            lines.add(String.join(",", headers));

            for (Map<String, String> row : rows) {
                List<String> cells = new ArrayList<>();
                for (String header : headers) {
                    String value = row.getOrDefault(header, "");
                    cells.add(escapeCsv(value));
                }
                lines.add(String.join(",", cells));
            }

            Path parent = path.getParent();
            if (parent != null && !Files.exists(parent)) {
                Files.createDirectories(parent);
            }
            Files.write(path, lines, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to write CampGuard CSV file: " + path, e);
        }
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }

        boolean mustQuote = value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r");
        if (!mustQuote) {
            return value;
        }
        return "\"" + value.replace("\"", "\"\"") + "\"";
    }

    private List<String> parseCsvLine(String line) {
        List<String> cells = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);
            if (ch == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == ',' && !inQuotes) {
                cells.add(current.toString().trim());
                current.setLength(0);
            } else {
                current.append(ch);
            }
        }
        cells.add(current.toString().trim());
        return cells;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() >= 10) {
            normalized = normalized.substring(0, 10);
        }
        try {
            return LocalDate.parse(normalized, DATE_FORMAT);
        } catch (Exception ignored) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Double.parseDouble(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String normalizeId(String id) {
        return Optional.ofNullable(id).orElse("").trim();
    }
}
