$ErrorActionPreference = 'Stop'
$root   = "C:\1.CODE\vault-manager"
$mobile = "$root\apps\mobile"
$android = "$mobile\android"
$destFile = "$root\dist\VaultManager.apk"

# Set JAVA_HOME and ANDROID_HOME environment variables
if (-not $env:JAVA_HOME -and (Test-Path 'C:\Program Files\Android\Android Studio\jbr')) {
    $env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}
if (-not $env:ANDROID_HOME -and (Test-Path 'C:\Users\pjdri\AppData\Local\Android\Sdk')) {
    $env:ANDROID_HOME = 'C:\Users\pjdri\AppData\Local\Android\Sdk'
}

# Kill stale Gradle daemons
Stop-Process -Name java -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 1: Run prebuild
Set-Location $mobile
Write-Host "[1/3] Running expo prebuild..."
npx expo prebuild --platform android --no-install

# Write local.properties if missing
$localProps = "$android\local.properties"
if (-not (Test-Path $localProps)) {
    "sdk.dir=C:\\Users\\pjdri\\AppData\\Local\\Android\\Sdk" | Out-File -FilePath $localProps -Encoding ascii
}

# Step 2: Gradle assemble
Write-Host "[2/3] Building release APK with Gradle..."
Set-Location $android
.\gradlew.bat assembleRelease
if ($LASTEXITCODE -ne 0) {
    Set-Location $root
    throw "Gradle build FAILED with exit code $LASTEXITCODE"
}

# Step 3: Copy APK immediately
Write-Host "[3/3] Copying APK to dist folder..."
$apkSrc = "$android\app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apkSrc)) {
    # Fallback: search anywhere
    $found = Get-ChildItem "$android\app\build\outputs" -Recurse -Filter "*.apk" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $apkSrc = $found.FullName }
    else {
        Set-Location $root
        throw "APK not found after successful build! Searched: $android\app\build\outputs"
    }
}

New-Item -ItemType Directory -Force -Path "$root\dist" | Out-Null
Copy-Item -LiteralPath $apkSrc -Destination $destFile -Force

Set-Location $root

$sizeMB = [math]::Round((Get-Item $destFile).Length / 1MB, 1)
Write-Host ""
Write-Host "=========================================================="
Write-Host " BUILD SUCCESSFUL"
Write-Host " APK : $destFile"
Write-Host " Size: $sizeMB MB"
Write-Host "=========================================================="
