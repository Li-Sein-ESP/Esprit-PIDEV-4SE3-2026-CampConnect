$mavenPath = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.2\plugins\maven\lib\maven3\bin\mvn.cmd"
if (Test-Path $mavenPath) {
    Write-Host "Starting Maven from $mavenPath"
    & $mavenPath spring-boot:run
} else {
    Write-Error "Maven not found at $mavenPath"
}
