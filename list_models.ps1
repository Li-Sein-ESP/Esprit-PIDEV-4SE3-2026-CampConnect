$key = "AIzaSyAX7ZIm9h4zifWOcceiYOnQXT4eHX7J02g"
$r = Invoke-RestMethod -Uri "https://generativelanguage.googleapis.com/v1beta/models?key=$key"
$r.models | Where-Object { $_.supportedGenerationMethods -contains "generateContent" } | Select-Object name, displayName | Format-Table
