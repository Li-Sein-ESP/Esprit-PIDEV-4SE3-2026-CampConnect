$ErrorActionPreference = "Stop"
Write-Host "ÉTAPE 1: Création d'un compte utilisateur de test..." -ForegroundColor Cyan

$signupBody = @{
    username = "camper_test_jwt"
    email = "camperjwt@test.com"
    password = "password123"
    name = "Camper Test"
    role = @("user")
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
    Write-Host "-> Compte créé avec succès!" -ForegroundColor Green
} catch {
    Write-Host "-> Le compte existe peut-être déjà, on continue..." -ForegroundColor Yellow
}

Write-Host "`nÉTAPE 2: Connexion pour récupérer le JWT..." -ForegroundColor Cyan
$loginBody = @{
    username = "camper_test_jwt"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/signin" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$userId = $loginResponse.id

Write-Host "-> Connexion réussie!" -ForegroundColor Green
Write-Host "-> Voici le véritable JWT généré par Spring Boot : " -ForegroundColor Magenta
Write-Host $token.Substring(0, 30) "...(tronqué pour la sécurité)"

Write-Host "`nÉTAPE 3: Test de l'Interceptor (Envoi d'une requête protégée avec le token)..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$postBody = @{
    title = "Mon aventure de test JWT"
    description = "Ceci est un test automatisé pour vérifier que le token fonctionne correctement !"
    category = "General"
    authorId = $userId
} | ConvertTo-Json

$postResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/threads" -Method Post -Headers $headers -Body $postBody

Write-Host "-> Requête acceptée par le serveur !" -ForegroundColor Green
Write-Host "-> Nouveau Thread créé avec l'ID :" $postResponse.id -ForegroundColor Magenta
Write-Host "C'EST UN SUCCÈS TOTAL ! LE SYSTÈME DE SÉCURITÉ JWT FONCTIONNE ! 🎉" -ForegroundColor Green
