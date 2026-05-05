$key = "AIzaSyAX7ZIm9h4zifWOcceiYOnQXT4eHX7J02g"
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    "contents" = @(
        @{ "parts" = @(@{ "text" = "Dis juste: OK" }) }
    )
} | ConvertTo-Json -Depth 10

$models = @("gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-flash-latest", "gemini-flash-lite-latest", "gemma-3-4b-it")

foreach ($m in $models) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/$($m):generateContent?key=$key"
    try {
        $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
        $text = $response.candidates[0].content.parts[0].text
        Write-Host "✅ $m -> FONCTIONNE: $text"
    } catch {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $err = $reader.ReadToEnd() | ConvertFrom-Json
        Write-Host "❌ $m -> $($err.error.code): $($err.error.status)"
    }
}
