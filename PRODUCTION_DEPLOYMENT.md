# Guide Officiel de Déploiement en Production — MémoirePro Gabon 🇬🇦

Ce document détaille toutes les étapes et exigences techniques, réglementaires et d'infrastructure pour mettre en production la plateforme **MémoirePro Gabon**.

---

## 1. Certificats SSL/TLS & Sécurité Réseau

### A. Configuration Cloudflare (SSL / TLS Full Strict)
La plateforme utilise Cloudflare pour le routage Edge, le CDN mondial et la terminaison SSL.
1. **Mode de chiffrement SSL :** Sélectionner **« Full (Strict) »** dans Cloudflare Dashboard > SSL/TLS > Overview. Cela garantit que le trafic entre le visiteur, Cloudflare et le serveur d'origine est chiffré de bout en bout avec vérification stricte des certificats.
2. **Certificat d'Origine Cloudflare (Origin CA) :**
   - Générer un certificat d'origine RSA 2048-bit valide pour 15 ans couvrant `memoirepro.ga` et `*.memoirepro.ga`.
   - Installer la clé privée et le certificat sur votre reverse-proxy ou environnement d'hébergement.
3. **HSTS (HTTP Strict Transport Security) :**
   - Activer HSTS avec un `max-age` de **31 536 000 secondes (1 an)**, incluant les sous-domaines et le préchargement (`preload`).
   - Les en-têtes sont déjà configurés dans [`public/_headers`](file:///c:/Users/chris.ngomarosa/Documents/Chris/Site_Mémoires/public/_headers).
4. **DNSSEC :** Activer DNSSEC dans le bureau d'enregistrement du domaine `.ga` (ANINF / NIC Gabon) et sur Cloudflare pour prévenir toute falsification DNS.

---

## 2. Hébergement & Build de Production

Le projet est propulsé par **TanStack Start**, **Vite** et **Nitro** avec le preset Cloudflare Module.

### Commandes de Build
```bash
# 1. Installation des dépendances
npm ci

# 2. Build complet de l'application SSR & Static
npm run build

# 3. Prévisualisation locale de la version de production
npx vite preview
```

### Déploiement sur Cloudflare Workers / Pages
Le bundle de production est généré dans `.output/server` et `.output/public`.
```bash
# Déploiement direct via Wrangler
npx wrangler deploy
```

---

## 3. Base de Données Supabase & Règles RLS (Row Level Security)

1. **Vérification des Politiques RLS :**
   Exécuter le script de validation avant tout déploiement :
   ```bash
   node test_reports/verify-rls.js
   ```
   Toutes les 7 règles de sécurité doivent afficher `[PASS]` avec 100% de conformité :
   - Lecture anonyme bloquée.
   - Isolation client (un étudiant ne peut lire que ses propres commandes).
   - Tentative d'auto-promotion bloquée au niveau de la base de données.
   - Contrôle d'accès RBAC (seul un administrateur peut modifier les rôles rédacteur/client).

2. **Chiffrement au repos :**
   - S'assurer que le bucket Supabase Storage stockant les mémoires finaux et pièces jointes est configuré en **« Private »** avec des URL signées temporaires d'expiration (TTL 15 minutes).

---

## 4. Passerelles de Paiement Gabon (Fintech & Banques)

### A. Airtel Money Gabon
- Obtenir un compte marchand B2B auprès d'Airtel Gabon (Libreville).
- Renseigner `AIRTEL_MONEY_CLIENT_ID`, `AIRTEL_MONEY_CLIENT_SECRET` et `AIRTEL_MONEY_MERCHANT_PIN` dans l'environnement de production.
- Pointer l'URL de notification instantanée (IPN / Webhook) sur : `https://memoirepro.ga/api/webhooks/airtel`.

### B. Moov Money (Moov Africa Gabon Telecom)
- Contractualiser l'accès à l'API marchande Flooz / Moov Money Gabon.
- Configurer `MOOV_MONEY_MERCHANT_ID` et `MOOV_MONEY_API_KEY`.
- Pointer le webhook sur `https://memoirepro.ga/api/webhooks/moov`.

### C. Virement Bancaire Local
- Compte récepteur officiel : **BGFI Bank Gabon** (Agence Libreville Centre) ou **UBA Gabon**.
- Les validations manuelles de virement s'effectuent depuis l'Espace Rédacteur / Administrateur (`/redacteur` ou `/admin`) en cochant *« Valider Paiement »*.

---

## 5. Conformité Juridique & Protection des Données (Gabon)

1. **Déclaration CNPDCP :**
   - La plateforme respecte la **Loi n° 001/2011** relative à la protection des données à caractère personnel en République Gabonaise.
   - Les documents légaux obligatoires sont en ligne et accessibles :
     - Conditions Générales de Vente et d'Utilisation : `/cgv`
     - Politique de Confidentialité : `/confidentialite`
     - Charte Éthique & Déontologie CAMES : `/charte-ethique`
     - Mentions Légales : `/mentions-legales`
     - Registre de Vérification des Certificats : `/certificat`

2. **Droit à l'Oubli & Purge des Fichiers :**
   - Dès la soutenance passée ou 30 jours après la livraison finale, les fichiers sources sont éligibles à la purge définitive sur demande auprès de `dpo@memoirepro.ga`.

---

## 6. Système de Certification Anti-Plagiat & Authenticité

Chaque mémoire livré génère :
- Une attestation officielle avec numéro unique : `CERT-GA-2026-XXXX`.
- Une empreinte cryptographique d'intégrité **SHA-256**.
- Un rapport de similarité certifié Turnitin / Compilatio inférieur à 5%.
- Une page publique de vérification accessible aux jurys et facultés : `https://memoirepro.ga/certificat?id=CERT-GA-2026-XXXX`.

---

## 7. Checklist Finale avant Ouverture Publique

| Élément | Statut | Vérification |
|---|---|---|
| **Certificats SSL / TLS** | Prêt | Cloudflare Full (Strict) + HSTS actif dans `_headers` |
| **Sécurité RLS / RBAC** | Validé | 7/7 tests passés avec succès (`verify-rls.js`) |
| **Documents Légaux Gabon** | Rédigés | CGV, Confidentialité Loi 001/2011, Charte CAMES, Mentions |
| **Système de Certificat** | Fonctionnel | Affichage modal, export PDF / impression, route `/certificat` |
| **Formulaire de Commande** | Validé | 10 critères, Airtel Money par défaut, Moov Money, +241 |
| **PWA & Offline** | Actif | Manifest, Service Worker et page `offline.html` opérationnels |
| **Robots & Sitemap** | Configuré | `robots.txt` protégeant `/admin`, sitemap dynamique actif |
