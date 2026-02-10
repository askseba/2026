# Test /api/match with Fragella + IFRA
# Run: npm run dev (in another terminal), then: .\scripts\test-match-api.ps1

$bodyPath = Join-Path $PSScriptRoot "match-test-body.json"
$body = Get-Content -Path $bodyPath -Raw -Encoding UTF8

try {
  $r = Invoke-RestMethod -Uri "http://localhost:3000/api/match" -Method POST `
    -ContentType "application/json; charset=utf-8" -Body $body
  Write-Host "success:" $r.success
  Write-Host "tier:" $r.tier
  Write-Host "perfumes count:" $r.perfumes.Count
  $first = $r.perfumes[0]
  if ($first) {
    Write-Host "first perfume - id:" $first.id "name:" $first.name "ifraScore:" $first.ifraScore "source:" $first.source
    Write-Host "symptomTriggers:" ($first.symptomTriggers -join ", ")
  }
  $r | ConvertTo-Json -Depth 6
} catch {
  Write-Error $_
}
