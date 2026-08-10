# MémoirePro — Test Credentials

## Admin account (role: admin) — seeded automatically at backend startup
- Email: admin@memoirepro.africa
- Password: admin123
- After login (`/connexion`) → redirected to `/redacteur` (writer/admin dashboard, no key needed).

## Test client account (create via /inscription or reuse)
- Email: etudiant@ex.com
- Password: secret1
- Role: client → redirected to `/editeur` (AI editor).

## Writer / Rédacteur dashboard access key (for non-admin writers)
- Route: `/redacteur`
- Access key: redacteur-memoirepro-2026

## Auth endpoints
- POST /api/auth/register  { name, email, password }
- POST /api/auth/login     { email, password }  → { token, user }
- GET  /api/auth/me        (Authorization: Bearer <token>)

Auth model: JWT Bearer token returned in response body, stored in localStorage key `mp_token`,
sent as `Authorization: Bearer <token>`.
