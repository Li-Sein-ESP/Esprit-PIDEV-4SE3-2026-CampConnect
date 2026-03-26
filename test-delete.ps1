
$threadId = "699cfcb2c" # Example from Invoke-RestMethod output
try {
    Invoke-RestMethod -Uri "http://localhost:8081/api/threads/$threadId" -Method Delete
    Write-Host "Delete successful"
} catch {
    Write-Host "Delete failed: $_"
}
