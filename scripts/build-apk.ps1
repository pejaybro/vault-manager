$ErrorActionPreference = 'Stop'

if (-not $env:JAVA_HOME -and (Test-Path 'C:\Program Files\Android\Android Studio\jbr')) {
    $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}

Write-Host "[1/4] Stopping background Java/Gradle daemons..."
Stop-Process -Name java -Force -ErrorAction SilentlyContinue

Write-Host "[2/4] Generating native Android files..."
Set-Location "C:\1.CODE\vault-manager\apps\mobile"
npx expo prebuild --platform android --no-install

Write-Host "[3/4] Compiling release APK with Gradle..."
Set-Location "C:\1.CODE\vault-manager\apps\mobile\android"
.\gradlew.bat assembleRelease

$searchDir = "C:\1.CODE\vault-manager\apps\mobile\android\app\build\outputs"
if (-not (Test-Path $searchDir)) {
    Set-Location "C:\1.CODE\vault-manager"
    throw "Gradle build failed to produce outputs directory at $searchDir. Check Gradle errors above."
}

$apkFile = Get-ChildItem $searchDir -Recurse -Filter "*.apk" | Select-Object -First 1 -ExpandProperty FullName
if (-not $apkFile) {
    Set-Location "C:\1.CODE\vault-manager"
    throw "Build failed: No .apk file generated in $searchDir"
}

Write-Host "Found APK at: $apkFile"

$destDir = "C:\1.CODE\vault-manager\dist"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null
$destFile = "$destDir\VaultManager.apk"
Copy-Item -Path $apkFile -Destination $destFile -Force

Set-Location "C:\1.CODE\vault-manager"

Write-Host ""
Write-Host "=========================================================="
Write-Host " SUCCESS! Local APK built successfully."
Write-Host " Output File: $destFile"
Write-Host "=========================================================="
