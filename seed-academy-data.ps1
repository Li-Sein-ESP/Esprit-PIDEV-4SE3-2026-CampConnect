# ============================================================
# SCRIPT DE SEED - MODULE ACADEMY - CampConnect
# Backend: http://localhost:8089/api
# AI:      http://localhost:5000
#
# USAGE:
#   1. Editez les identifiants admin ci-dessous
#   2. Lancez: .\seed-academy-data.ps1
# ============================================================

# ─── CONFIGURATION ─────────────────────────────────────────
$BASE      = "http://localhost:8089/api"
$AI_BASE   = "http://localhost:5000"

# Mettez ici les identifiants de votre compte Admin
$ADMIN_EMAIL    = "admin@campconnect.tn"
$ADMIN_PASSWORD = "Admin1234!"
# ─────────────────────────────────────────────────────────

function Login-Admin {
    Write-Host ""
    Write-Host ">>> Connexion Admin..." -ForegroundColor Magenta
    try {
        $loginBody = @{ email = $ADMIN_EMAIL; password = $ADMIN_PASSWORD } | ConvertTo-Json
        $loginBytes = [System.Text.Encoding]::UTF8.GetBytes($loginBody)
        $loginResp = Invoke-RestMethod -Method POST -Uri "$BASE/auth/login" `
            -Headers @{ "Content-Type" = "application/json" } `
            -Body $loginBytes
        $token = $loginResp.token
        if (-not $token) { $token = $loginResp.accessToken }
        if (-not $token) { $token = $loginResp.jwt }
        if ($token) {
            Write-Host "[OK] Connecte en tant qu'Admin. Token obtenu." -ForegroundColor Green
            return $token
        } else {
            Write-Host "[WARN] Login reussi mais pas de token dans la reponse. Cle disponibles: $($loginResp | Get-Member -Type NoteProperty | Select-Object -ExpandProperty Name)" -ForegroundColor Yellow
            return $null
        }
    } catch {
        Write-Host "[ERR] Echec de login: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "      Verifiez les identifiants au debut du script." -ForegroundColor Yellow
        return $null
    }
}

function Invoke-Api($method, $url, $body, $token) {
    $headers = @{ "Content-Type" = "application/json; charset=utf-8" }
    if ($token) { $headers["Authorization"] = "Bearer $token" }
    try {
        if ($body) {
            $json = $body | ConvertTo-Json -Depth 10 -Compress
            $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
            $resp = Invoke-RestMethod -Method $method -Uri $url -Headers $headers -Body $bytes
        } else {
            $resp = Invoke-RestMethod -Method $method -Uri $url -Headers $headers
        }
        Write-Host "[OK] $method $url" -ForegroundColor Green
        return $resp
    } catch {
        $code = $_.Exception.Response.StatusCode.Value__
        Write-Host "[ERR $code] $method $url => $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  SEEDING MODULE ACADEMY - CampConnect  " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# ETAPE 0 : Authentification
$TOKEN = Login-Admin
if (-not $TOKEN) {
    Write-Host ""
    Write-Host "ATTENTION: Pas de token JWT. Les routes protegees echoueront." -ForegroundColor Yellow
    Write-Host "Continuons quand meme pour les routes publiques..." -ForegroundColor Yellow
    Write-Host ""
}

# ─────────────────────────────────────────────────────────
# INSPECTION DES DONNEES EXISTANTES
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> Inspection des donnees existantes..." -ForegroundColor Cyan
$existingCourses = Invoke-Api "GET" "$BASE/academy/courses" $null $null
$existingCerts   = Invoke-Api "GET" "$BASE/academy/certifications" $null $null
$existingVideos  = Invoke-Api "GET" "$BASE/academy/videos" $null $null
$existingBadges  = Invoke-Api "GET" "$BASE/academy/badges" $null $null

Write-Host ""
Write-Host "Cours existants    : $($existingCourses.Count)" -ForegroundColor Gray
Write-Host "Certifications     : $($existingCerts.Count)" -ForegroundColor Gray
Write-Host "Videos             : $($existingVideos.Count)" -ForegroundColor Gray
Write-Host "Badges             : $($existingBadges.Count)" -ForegroundColor Gray
Write-Host ""

# Afficher les cours APPROVED existants (pour la demo)
Write-Host ">>> Cours APPROVED disponibles pour la demo:" -ForegroundColor Cyan
$approvedCourses = $existingCourses | Where-Object { $_.status -eq "APPROVED" }
$approvedCourses | ForEach-Object {
    Write-Host "  - [$($_.id)] $($_.title) (cat: $($_.category))" -ForegroundColor White
}

$pendingCourses = $existingCourses | Where-Object { $_.status -eq "PENDING" }
Write-Host ""
Write-Host ">>> Cours PENDING (a approuver en demo admin):" -ForegroundColor Cyan
$pendingCourses | ForEach-Object {
    Write-Host "  - [$($_.id)] $($_.title)" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────
# ETAPE 1 : AJOUT DE COURS SUPPLEMENTAIRES (si < 3 APPROVED)
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> [1/4] Ajout de cours si necessaire..." -ForegroundColor Magenta

if ($approvedCourses.Count -lt 3) {
    Write-Host "  Moins de 3 cours approuves, creation de cours supplementaires..." -ForegroundColor Yellow

    # Note: Le backend derive creatorId du token JWT - pas besoin de le passer
    Invoke-Api "POST" "$BASE/academy/courses" @{
        title        = "Wilderness Survival Essentials"
        description  = "Master the fundamental skills of fire, shelter, water and navigation in extreme wilderness conditions. Covers survival psychology, foraging edible plants, emergency signaling, and building emergency shelters from natural materials."
        category     = "survival"
        difficulty   = "INTERMEDIATE"
        duration     = 12
        price        = 0
        rating       = 4.8
        reviews      = 142
        enrolledCount= 328
        passingScore = 60
        tags         = @("survival", "fire", "shelter", "navigation")
        prerequisites= @()
        imageUrl     = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800"
        documentUrl  = ""
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/courses" @{
        title        = "GPS Navigation and Orienteering"
        description  = "Master navigation using map, compass and GPS. Topographic maps, declination, coordinate systems, waypoint planning, and navigating at night."
        category     = "navigation"
        difficulty   = "BEGINNER"
        duration     = 6
        price        = 0
        rating       = 4.6
        reviews      = 156
        enrolledCount= 389
        passingScore = 60
        tags         = @("navigation", "GPS", "compass", "orienteering")
        prerequisites= @()
        imageUrl     = "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
        documentUrl  = ""
    } $TOKEN | Out-Null

} else {
    Write-Host "  $($approvedCourses.Count) cours approuves deja presents - pas besoin d'en creer." -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────
# ETAPE 2 : CERTIFICATIONS (utilise les cours existants)
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> [2/4] Creation des Certifications..." -ForegroundColor Magenta

# Rafraichir la liste des cours apres eventuelle creation
$allCourses = Invoke-Api "GET" "$BASE/academy/courses" $null $null
$approvedNow = $allCourses | Where-Object { $_.status -eq "APPROVED" }

if ($existingCerts.Count -lt 2) {
    # Prendre les IDs des cours approuves existants
    $courseIds = @()
    if ($approvedNow.Count -ge 1) { $courseIds += $approvedNow[0].id }

    Invoke-Api "POST" "$BASE/academy/certifications" @{
        name            = "Certified Wilderness Expert"
        description     = "The highest recognition for wilderness survival mastery. Holders demonstrate exceptional proficiency in fire, shelter, water sourcing, navigation, and first aid."
        requirements    = @("Complete Wilderness Survival course", "Pass AI quiz with 60% minimum", "Demonstrate practical skills")
        validityPeriod  = 12
        imageUrl        = "CWE"
        issuer          = "CampConnect Wilderness Academy"
        requiredCourseIds = $courseIds
    } $TOKEN | Out-Null

    $courseIds2 = @()
    if ($approvedNow.Count -ge 2) { $courseIds2 += $approvedNow[1].id }

    Invoke-Api "POST" "$BASE/academy/certifications" @{
        name            = "Expert Trail Navigator"
        description     = "Demonstrates mastery of orienteering, map reading, GPS navigation and route planning for backcountry expeditions in all conditions."
        requirements    = @("Complete Navigation course", "Pass quiz with 60%", "Plan a real-world navigation route")
        validityPeriod  = 12
        imageUrl        = "ETN"
        issuer          = "CampConnect Academy"
        requiredCourseIds = $courseIds2
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/certifications" @{
        name            = "Wilderness First Aid Professional"
        description     = "Internationally recognized certification for wilderness medical response. Manage emergencies with limited resources in remote environments."
        requirements    = @("Complete First Aid course", "Score 70% on assessment", "CPR demonstration")
        validityPeriod  = 24
        imageUrl        = "WFA"
        issuer          = "CampConnect Medical Academy"
        requiredCourseIds = @()
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/certifications" @{
        name            = "Wildlife Conservation Specialist"
        description     = "Recognition of ecological knowledge and commitment to wildlife conservation. Identify 50+ species and understand ecosystem protection."
        requirements    = @("Complete Wildlife course", "Submit observation journal", "Pass identification quiz")
        validityPeriod  = 24
        imageUrl        = "WCS"
        issuer          = "CampConnect Ecology Institute"
        requiredCourseIds = @()
    } $TOKEN | Out-Null

} else {
    Write-Host "  $($existingCerts.Count) certifications deja presentes." -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────
# ETAPE 3 : VIDEOS
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> [3/4] Creation des Videos Knowledge..." -ForegroundColor Magenta

if ($existingVideos.Count -lt 4) {
    Invoke-Api "POST" "$BASE/academy/videos" @{
        title        = "Building a Debris Hut Shelter"
        description  = "Expert shows how to build a debris hut shelter using only natural materials. No tools required. Essential wilderness survival skill."
        videoUrl     = "https://www.youtube.com/embed/GZWK3KjFRpk"
        thumbnailUrl = "https://images.unsplash.com/photo-1445307806294-bff7f67ff225?w=800"
        category     = "survival"
        type         = "TUTORIAL"
        views        = 4821
        helpfulCount = 312
        takeaways    = @("Use dry dead leaves for insulation", "Hut should barely fit your body", "Cover with at least 2 feet of debris")
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/videos" @{
        title        = "Bow Drill Fire Technique"
        description  = "Complete guide to starting fire with the bow drill technique. Wood selection, proper form, and troubleshooting the most common mistakes."
        videoUrl     = "https://www.youtube.com/embed/dLbWTFQ5nzo"
        thumbnailUrl = "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"
        category     = "survival"
        type         = "TUTORIAL"
        views        = 6234
        helpfulCount = 487
        takeaways    = @("Dry wood is non-negotiable", "Consistent pressure not speed", "Prepare tinder bundle first")
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/videos" @{
        title        = "Reading Topographic Maps"
        description  = "Master topographic map reading: contour lines, elevation profiles, route planning through challenging terrain. Essential navigation skill."
        videoUrl     = "https://www.youtube.com/embed/CoVcAN7UkOA"
        thumbnailUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800"
        category     = "navigation"
        type         = "EXPERIENCE"
        views        = 3109
        helpfulCount = 201
        takeaways    = @("Contour lines show elevation", "Packed lines mean steep terrain", "Always orient map North first")
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/videos" @{
        title        = "Wilderness First Aid - Hypothermia"
        description  = "Emergency response for hypothermia in the field. Recognize symptoms, proper rewarming techniques, when to call for evacuation."
        videoUrl     = "https://www.youtube.com/embed/QlBnFcU2GHE"
        thumbnailUrl = "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800"
        category     = "first-aid"
        type         = "TUTORIAL"
        views        = 8934
        helpfulCount = 721
        takeaways    = @("Remove wet clothing first", "Insulate from ground up", "Rewarm slowly never rub skin")
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/videos" @{
        title        = "Identifying Edible Wild Plants"
        description  = "Visual guide to 10 common edible wild plants in temperate forests. Look-alike warnings for dangerous species included."
        videoUrl     = "https://www.youtube.com/embed/T7fM_uVKUXE"
        thumbnailUrl = "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800"
        category     = "wildlife"
        type         = "REEL"
        views        = 5671
        helpfulCount = 389
        takeaways    = @("Never eat without certainty", "Dandelion and plantain are safe", "Learn dangerous look-alikes first")
    } $TOKEN | Out-Null

    Invoke-Api "POST" "$BASE/academy/videos" @{
        title        = "Night Navigation Using Stars"
        description  = "Navigate at night using Polaris and key constellations. Critical skill for any wilderness expedition or emergency survival situation."
        videoUrl     = "https://www.youtube.com/embed/zSCFjbkREJM"
        thumbnailUrl = "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800"
        category     = "navigation"
        type         = "REEL"
        views        = 2887
        helpfulCount = 178
        takeaways    = @("Polaris never moves - True North", "Find via Ursa Major pointer stars", "Build shadow compass at dawn")
    } $TOKEN | Out-Null

} else {
    Write-Host "  $($existingVideos.Count) videos deja presentes." -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────
# ETAPE 4 : TEST AI
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> [4/4] Test Service AI..." -ForegroundColor Magenta

try {
    $aiHealth = Invoke-RestMethod -Method GET -Uri "$AI_BASE/" -TimeoutSec 3
    Write-Host "[OK] AI Service ONLINE!" -ForegroundColor Green

    $quizBody = [System.Text.Encoding]::UTF8.GetBytes('{"topic":"Wilderness Survival","description":"fire shelter water navigation"}')
    $quizResp = Invoke-RestMethod -Method POST -Uri "$AI_BASE/api/ai/quiz/generate" `
        -Headers @{"Content-Type"="application/json"} -Body $quizBody -TimeoutSec 5
    Write-Host "[OK] AI Quiz OK - $($quizResp.questions.Count) questions generees:" -ForegroundColor Green
    $quizResp.questions | ForEach-Object { Write-Host "  Q: $($_.q)" -ForegroundColor Gray }
} catch {
    Write-Host "[WARN] AI Service offline - Lancez: cd python-ai && python app.py" -ForegroundColor Yellow
}

# ─────────────────────────────────────────────────────────
# ETAPE 5 : SIMULER USERCERTIFICATION (pour demo TACHE 3)
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host ">>> [BONUS] Creation UserCertification de demo (TACHE 3)..." -ForegroundColor Magenta

$finalCerts = Invoke-Api "GET" "$BASE/academy/certifications" $null $null
if ($finalCerts -and $finalCerts.Count -gt 0) {
    $demoUserId = "699b81924fabf57ebaf62fa5"  # Admin user ID vu dans les donnees
    $demoCertId = $finalCerts[0].id
    $demoCertName = $finalCerts[0].name

    $earnedDate = (Get-Date).AddMonths(-3).ToString("yyyy-MM-ddTHH:mm:ss")
    $expiryDate = (Get-Date).AddMonths(9).ToString("yyyy-MM-ddTHH:mm:ss")

    Invoke-Api "POST" "$BASE/academy/users/certifications" @{
        certificationId   = $demoCertId
        certificationName = $demoCertName
        userId            = $demoUserId
        username          = "Admin Camper"
        status            = "ACTIVE"
        earnedDate        = $earnedDate
        expiryDate        = $expiryDate
        certificateUrl    = ""
    } $TOKEN | Out-Null

    # Une certification expiree (pour demo du scheduler)
    if ($finalCerts.Count -gt 1) {
        $expiredEarned = (Get-Date).AddMonths(-14).ToString("yyyy-MM-ddTHH:mm:ss")
        $expiredExpiry = (Get-Date).AddMonths(-2).ToString("yyyy-MM-ddTHH:mm:ss")
        Invoke-Api "POST" "$BASE/academy/users/certifications" @{
            certificationId   = $finalCerts[1].id
            certificationName = $finalCerts[1].name
            userId            = $demoUserId
            username          = "Admin Camper"
            status            = "EXPIRED"
            earnedDate        = $expiredEarned
            expiryDate        = $expiredExpiry
            certificateUrl    = ""
        } $TOKEN | Out-Null
        Write-Host "  Certification EXPIRED creee pour demo du Scheduler (TACHE 1)" -ForegroundColor Gray
    }
}

# ─────────────────────────────────────────────────────────
# RESUME FINAL
# ─────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "          RESUME FINAL                  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$fc = Invoke-Api "GET" "$BASE/academy/courses" $null $null
$fce = Invoke-Api "GET" "$BASE/academy/certifications" $null $null
$fv = Invoke-Api "GET" "$BASE/academy/videos" $null $null
$fb = Invoke-Api "GET" "$BASE/academy/badges" $null $null

$fApproved = ($fc | Where-Object { $_.status -eq "APPROVED" }).Count
$fPending  = ($fc | Where-Object { $_.status -eq "PENDING" }).Count

Write-Host ""
Write-Host "Cours Total        : $($fc.Count)" -ForegroundColor White
Write-Host "  - APPROVED       : $fApproved" -ForegroundColor Green
Write-Host "  - PENDING        : $fPending (a approuver pour demo admin)" -ForegroundColor Yellow
Write-Host "Certifications     : $($fce.Count)" -ForegroundColor White
Write-Host "Videos             : $($fv.Count)" -ForegroundColor White
Write-Host "Badges             : $($fb.Count)" -ForegroundColor White
Write-Host ""
Write-Host "--- LIENS UTILES ---" -ForegroundColor Cyan
Write-Host "Academy Frontend   : http://localhost:4200/academy" -ForegroundColor Cyan
Write-Host "Admin Governance   : http://localhost:4200/admin/academy" -ForegroundColor Cyan
Write-Host "Swagger API        : http://localhost:8089/swagger-ui.html" -ForegroundColor Cyan
Write-Host "AI Docs (FastAPI)  : http://localhost:5000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "--- DEMO SOUTENANCE ---" -ForegroundColor Yellow
Write-Host "1. Connectez-vous ADMIN -> Admin Panel -> Academy Governance" -ForegroundColor White
Write-Host "2. Approuvez un cours PENDING -> email envoye automatiquement" -ForegroundColor White
Write-Host "3. Allez sur GET /certifications/stats -> TACHE 2 MongoDB Aggregation" -ForegroundColor White
Write-Host "4. En tant qu'USER -> Suivez un cours -> Lancez Quiz IA -> Telecharger cert" -ForegroundColor White
Write-Host "5. My Badges -> Filtrez ACTIVE puis EXPIRED -> TACHE 3 multi-entite" -ForegroundColor White
Write-Host ""
