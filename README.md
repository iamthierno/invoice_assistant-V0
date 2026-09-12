# Assistant Devis 🤖🧾

Une application web moderne et intelligente pour générer, gérer et éditer des devis via un chatbot.

> **État du Projet** : Fonctionnel (Beta)
> **Dernière mise à jour** : Janvier 2026

## 🌟 Vision du Projet

Assistant Devis repense la création de documents administratifs en remplaçant les formulaires complexes par une conversation naturelle. Que ce soit par la voix ou le texte, l'utilisateur exprime ses besoins ("Ajoute un article...", "Applique une remise de 10%...") et l'assistant s'occupe de tout en temps réel.

## 🚀 Fonctionnalités Clés

### 🧠 Intelligence & Chatbot (Frontend)
- **Interface Conversationnelle** : Un panneau de chat dédié pour interagir avec le système.
- **Commandes Naturelles** : L'utilisateur peut parler ou écrire pour piloter le devis.
- **Feedback Immédiat** : Le devis se met à jour visuellement à chaque interaction.
- **Mode Hybride** : Possibilité d'utiliser l'interface graphique classique ET le chat simultanément.

### ⚙️ Moteur de Calcul (SQL & PostgreSQL)
- **Fiabilité Maximale** : Toute la logique de calcul (TVA, remises, totaux) est exécutée directement dans la base de données via des procédures stockées.
- **Calculs Avancés** : Gestion des taxes par article ou globales, et des remises cumulables.

### ✉️ Partage & Communication
- **WhatsApp Integration** : Envoi direct du PDF via l'API Meta Graph.
- **Emailing** : Envoi par email avec pièce jointe PDF via Nodemailer.

---

## 🛠️ Stack Technique

### Frontend
- **Framework** : React 19 (Vite) / TypeScript
- **Design** : TailwindCSS v4 & Framer Motion
- **Gestion d'État** : Zustand (Store global synchronisé)

### Backend (Node.js)
- **Runtime** : Node.js (v20+) / Express.js
- **Services** : Nodemailer (Email), Axios (WhatsApp API)
- **Synchronisation** : Mises à jour en temps réel via Server-Sent Events (SSE)

### Base de données PostgreSQL
- **Schéma** : init.sql
- **Tables** : invoices, invoice_items
- **Logique** : PL/pgSQL (Liste des procédures stockées)

### AI Agent (Python)
- **Framework** : FastAPI / Deep Agent de LangChain
---

## 🏗️ Architecture

```
assistant_invoice/
├── backend/            # Services d'envoi et API support
├── frontend/           # Interface utilisateur React
└── invoice_agent/      # Cerveau IA (Deep Agent Python)
```

## 🚀 Guide de Démarrage

### 1. Prérequis
- Node.js (v20+) 
- PostgreSQL (Serveur local ou cloud)

### 2. Installation Backend
```bash
cd backend
npm install
# Créez un fichier .env avec vos accès BDD
npm run dev
# Le serveur écoute sur http://localhost:4000
```

### 3. Installation Frontend
```bash
cd frontend
npm install
npm run dev
# L'interface est accessible sur http://localhost:5173
```

### 4. Installation Agent IA
```bash
cd invoice_agent
# activate virtual environment
./venv/Scripts/activate.ps1 # or ./venv/Scripts/activate.sh
# install dependencies
uv add -r requirements.txt
# run Deep Agent server
uv run main.py
```

## ✅ Roadmap
- [x] Architecture du projet et configuration.
- [x] Backend : Implémentation du moteur de calcul SQL.
- [x] Backend : Création des endpoints API CRUD.
- [x] Frontend : Mise en place de l'interface Chat & Devis.
- [x] Frontend : Connexion finale au Backend.
- [x] IA : Intégration du module "Deep Agent" pour le NLP.
- [x] Communication : Envoi par WhatsApp et Email.
