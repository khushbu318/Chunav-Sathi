# Chunav-Sathi

Chunav-Sathi is an election-assistance app focused on helping users understand election timelines, processes, and nearby election offices or polling booths.

## Security Setup

- Never keep `application_default_credentials.json` or any Google credential JSON inside this repository.
- If you want to use Google ADC, store the JSON outside the repo and set `GOOGLE_APPLICATION_CREDENTIALS` to that external path.
- If you prefer API keys, copy `apps/api/.env.example` into `apps/api/.env` and fill in your own values.

Example:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\secure\gcp\service-account.json"
```
echo "# CI/CD check after given all permissions"