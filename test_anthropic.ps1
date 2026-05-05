$headers = @{
    "x-api-key" = "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"
    "anthropic-version" = "2023-06-01"
    "content-type" = "application/json"
}

$body = @{
    "model" = "claude-3-haiku-20240307"
    "max_tokens" = 1024
    "system" = "System prompt"
    "messages" = @(
        @{ "role" = "user"; "content" = "Hello" }
    )
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.anthropic.com/v1/messages" -Method Post -Headers $headers -Body $body
    $response | ConvertTo-Json
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $reader.ReadToEnd()
}
