param([ValidateSet('dev','neon')][string]$Profile='dev')
$ErrorActionPreference = 'Stop'
if ($Profile -eq 'neon') {
    $taskEnvFile=Join-Path $PSScriptRoot '.env.neon.local'
    if (-not (Test-Path -LiteralPath $taskEnvFile)) { throw 'Falta backend/.env.neon.local.' }
    foreach ($taskLine in Get-Content -LiteralPath $taskEnvFile) {
        if ($taskLine -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
            [Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process')
        }
    }
}
$taskJdkCandidates = @($env:JAVA_HOME) + @(Get-ChildItem 'C:/Program Files/Java' -Directory -Filter 'jdk*' -ErrorAction SilentlyContinue | Sort-Object Name -Descending | Select-Object -ExpandProperty FullName)
$taskJdk = $null
foreach ($taskCandidate in $taskJdkCandidates) {
    if (-not $taskCandidate) { continue }
    $taskJava = Join-Path $taskCandidate 'bin/java.exe'
    if (-not (Test-Path -LiteralPath $taskJava)) { continue }
    $ErrorActionPreference = 'Continue'
    $taskVersion = (& $taskJava -version 2>&1 | Out-String)
    $ErrorActionPreference = 'Stop'
    if ($taskVersion -match 'version "(\d+)' -and [int]$Matches[1] -ge 21) { $taskJdk = $taskCandidate; break }
}
if (-not $taskJdk) { throw 'Configura JAVA_HOME con un JDK 21 o posterior.' }
$env:JAVA_HOME = $taskJdk
$env:PATH = "$taskJdk/bin;$env:PATH"
Push-Location $PSScriptRoot
try { & ./mvnw.cmd -B -ntp spring-boot:run "-Dspring-boot.run.profiles=$Profile" }
finally { Pop-Location }
