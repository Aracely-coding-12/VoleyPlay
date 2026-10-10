$ErrorActionPreference='Stop'
$taskBase='http://localhost:8080/api'
$taskEnv=Get-Content (Join-Path $PSScriptRoot '../.env.neon.local')
if (-not ($taskEnv | Where-Object { $_ -match '^DB_URL=jdbc:postgresql://ep-cold-moon-axcesrn6\.c-4\.us-east-2\.aws\.neon\.tech/neondb\?' })) { throw 'Solo se permite ejecutar esta prueba en la rama Neon aislada.' }
$taskSession=New-Object Microsoft.PowerShell.Commands.WebRequestSession
function Request($method,$path,$body=$null) {
    $taskHeaders=@{}
    if($method -ne 'GET') {
        $taskCsrf=Invoke-RestMethod -Uri "$taskBase/auth/csrf" -WebSession $taskSession
        $taskHeaders[$taskCsrf.headerName]=$taskCsrf.token
    }
    $taskParams=@{Uri="$taskBase$path";Method=$method;WebSession=$taskSession;Headers=$taskHeaders;UseBasicParsing=$true}
    if($null -ne $body){$taskParams.ContentType='application/json';$taskParams.Body=($body|ConvertTo-Json -Compress)}
    $taskResult=Invoke-WebRequest @taskParams
    if($taskResult.Content){return ($taskResult.Content|ConvertFrom-Json)}
}
$taskCsrf=Invoke-RestMethod -Uri "$taskBase/auth/csrf" -WebSession $taskSession
$taskHeaders=@{};$taskHeaders[$taskCsrf.headerName]=$taskCsrf.token
$taskLogin=Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$taskBase/auth/login" -WebSession $taskSession -Headers $taskHeaders -Body @{username='admin';password='VoleyPlay-local-2026!'}
if($taskLogin.StatusCode -ne 204){throw 'Fallo el acceso.'}
$taskCreated=New-Object System.Collections.Generic.List[string]
try {
    foreach($taskEntity in @('cliente','cancha','horario','reserva','pago')) { $taskRows=Request GET "/$taskEntity"; Write-Output "$taskEntity : $(@($taskRows).Count) registros" }
    $taskClient=Request POST /cliente @{nombre='Prueba Neon';apellido='Aislada';dni='';telefono='';email=''}
    $taskCreated.Add("/cliente/$($taskClient.id)")
    $taskOther=Request POST /cliente @{nombre='Prueba Neon';apellido='Opcionales';dni='';telefono='';email=''}
    $taskCreated.Add("/cliente/$($taskOther.id)")
    $taskCourt=Request POST /cancha @{numero=50001;nombre='Prueba Neon aislada';tipoSuperficie='Grass Sintetico';estado='Disponible'}
    $taskCreated.Add("/cancha/$($taskCourt.id)")
    $taskSlot=Request POST /horario @{horaInicio='22:17';horaFin='00:17';precio=50;estado='Disponible'}
    $taskCreated.Add("/horario/$($taskSlot.id)")
    $taskDate=[TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([datetime]::UtcNow,'SA Pacific Standard Time').Date.AddDays(3).ToString('yyyy-MM-dd')
    $taskReserve=Request POST /reserva @{idCliente=$taskClient.id;idCancha=$taskCourt.id;idHorario=$taskSlot.id;fechaReserva=$taskDate;estado='Confirmada'}
    $taskCreated.Add("/reserva/$($taskReserve.id)")
    if($taskReserve.total -ne 50){throw 'Total incorrecto.'}
    $taskToday=[TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([datetime]::UtcNow,'SA Pacific Standard Time').ToString('yyyy-MM-dd')
    $taskPayment=Request POST /pago @{idReserva=$taskReserve.id;fechaPago=$taskToday;monto=20;metodoPago='Yape';estado='Pagado'}
    $taskCreated.Add("/pago/$($taskPayment.id)")
    try { Request POST /pago @{idReserva=$taskReserve.id;fechaPago=$taskPayment.fechaPago;monto=31;metodoPago='Yape';estado='Pagado'}; throw 'No se bloqueo el sobrepago.' } catch { if(-not $_.Exception.Response -or [int]$_.Exception.Response.StatusCode -ne 409){throw} }
    $null=Request PUT "/cliente/$($taskClient.id)" @{nombre='Prueba Neon';apellido='Editada';dni='';telefono='999888777';email=''}
    Write-Output 'CRUD Neon, campos opcionales, turno nocturno, precio y bloqueo de sobrepago: OK.'
} finally {
    for($taskI=$taskCreated.Count-1;$taskI -ge 0;$taskI--){$null=Request DELETE $taskCreated[$taskI]}
}
$null=Request POST /auth/logout
Write-Output 'Registros propios de prueba retirados de la rama aislada; logout: OK.'
