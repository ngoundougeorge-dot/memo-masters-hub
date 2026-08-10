# MémoirePro — Auth Testing Playbook

Auth: JWT Bearer token (email/password), bcrypt hashing. Token returned in login/register
response body as `token`; frontend stores it in localStorage (`mp_token`) and sends
`Authorization: Bearer <token>`.

## Accounts
- Admin: admin@memoirepro.africa / admin123 (role: admin) — seeded at startup.
- Writer access key (redacteur dashboard): `redacteur-memoirepro-2026`

## API checks
```
API=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d= -f2)
# Register
curl -s -X POST $API/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"t1@ex.com","password":"secret1"}'
# Login
TOKEN=$(curl -s -X POST $API/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@memoirepro.africa","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['token'])")
# Me
curl -s $API/api/auth/me -H "Authorization: Bearer $TOKEN"
```
