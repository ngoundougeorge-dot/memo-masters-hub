# MémoirePro — PRD

## Problem statement
Recréer le site "memo-master / celide lovable" (MémoirePro), un service de rédaction de mémoires
en ligne, sous forme de PWA en gardant le même design, et l'optimiser. Ajouts demandés par
l'utilisateur : authentification email/mot de passe (JWT) et un éditeur avec assistant IA
(Claude Sonnet 4.6).

Source repo (privé→public, TanStack Start + Supabase) :
https://github.com/ngoundougeorge-dot/memo-masters-hub

## Stack
- Frontend: React (CRA) + Tailwind, react-router-dom, sonner, lucide-react. PWA (manifest + service worker).
- Backend: FastAPI + MongoDB (motor). JWT (bcrypt/PyJWT). Object storage (Emergent). AI via emergentintegrations (Claude Sonnet 4.6, SSE streaming).

## Design (preserved from original)
Palette académique : vert forêt profond + or chaud sur ivoire. Typo : Fraunces (serif) + Inter.
Tokens portés dans /app/frontend/src/index.css.

## Personas
- Étudiant/client : commande une rédaction, suit l'avancement, joint des documents, rédige avec l'IA.
- Rédacteur/Admin : consulte les commandes, télécharge les pièces, met à jour les statuts.

## Implemented (2026-06)
- Landing page fidèle : hero, garanties, section Assistant IA, tarifs FCFA, avis, formulaire de commande, footer.
- Commande anonyme + upload de fichiers (object storage) + écran de succès.
- Espace client `/client` : suivi timeline de statut, upload + soumission des documents (verrouillage).
- Auth JWT email/mot de passe (`/connexion`, `/inscription`).
- Éditeur IA `/editeur` (protégé) : documents CRUD, autosave, assistant Claude Sonnet 4.6 en streaming, modes (améliorer/plan/développer), insertion de réponse.
- Dashboard rédacteur `/redacteur` : clé d'accès OU admin JWT, liste des commandes, changement de statut, notifications lues, téléchargement des fichiers.
- Page retour paiement `/paiement/retour`.
- PWA : manifest.json, icônes, service worker (offline shell), bannière d'installation.
- Tests : backend 100% (pytest), frontend flows validés (Playwright).

## Backlog / Next
- P1: Notifications email/WhatsApp réelles à la soumission des documents (actuellement non branché).
- P1: Intégration paiement Mobile Money réelle (page retour existe, provider non branché — MOCKED côté flux).
- P2: Export du document rédigé en Word/PDF.
- P2: Messagerie client ↔ rédacteur.
- P2: Mode sombre (tokens .dark déjà présents).
- Tech: rendre put_object/get_object non bloquants (httpx async), modulariser server.py.
