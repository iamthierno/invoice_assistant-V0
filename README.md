# Assistant Devis 🤖🧾

Une application web moderne et intelligente pour générer, gérer et éditer des devis via un chatbot.

> **État du Projet** : En cours de développement (Alpha)
> **Dernière mise à jour** : Janvier 2026

## 🌟 Vision du Projet

Assistant Devis repense la création de documents administratifs en remplaçant les formulaires complexes par une conversation naturelle. Que ce soit par la voix ou le texte, l'utilisateur exprime ses besoins ("Ajoute un article...", "Applique une remise de 10%...") et l'assistant s'occupe de tout modifications en temps réel.

## 🚀 Fonctionnalités Clés

### 🧠 Intelligence & Chatbot (Frontend)
- **Interface Conversationnelle** : Un panneau de chat dédié pour interagir avec le système.
- **Commandes Naturelles** : L'utilisateur peut parler ou écrire pour piloter le devis.
- **Feedback Immédiat** : Le devis se met à jour visuellement à chaque interaction.
- **Mode Hybride** : Possibilité d'utiliser l'interface graphique classique ET le chat simultanément.

### ⚙️ Moteur de Calcul (Backend & BDD)
- **Fiabilité Maximale** : Toute la logique de calcul (TVA, remises, totaux) est exécutée directement dans la base de données (PostgreSQL) via des procédures stockées.
- **Gestion Avancée des Taxes** :
  - Taxes spécifiques par ligne (ex: TVA 5.5% sur l'alimentaire).
  - Taxes globales (ex: TVA 20% sur le reste).
  - Remises cumulables (Remise article + Remise commerciale globale).
- **Intégrité des Données** : Chaque opération est atomique et vérifiée.

---

## 🛠️ Stack Technique

### Frontend (Client)
- **Framework** : React 19 (Vite)
- **Langage** : TypeScript
- **Design** : TailwindCSS v4 (Alpha) & Framer Motion (Animations)
- **Gestion d'État** : Zustand (Store global synchronisé)
- **HTTP Client** : Axios

### Backend (Serveur)
- **Runtime** : Node.js (v20+)
- **Framework** : Express.js
- **Langage** : TypeScript
- **Base de Données** : PostgreSQL
- **Logique** : PL/pgSQL (Procédures stockées pour `perform_invoice_calculation`)

---

## � Architecture

```
assistant_invoice/
├── backend/            # Cerveau Logique
│   ├── src/models/     # init.sql (Le cœur du calcul)
│   ├── src/controllers/# Pont entre API et BDD
│   └── package.json    # Dépendances (pg, express)
│
├── frontend/           # Interface Chatbot
│   ├── src/components/ # ChatInput, DevisPreview, VoiceButton
│   ├── src/services/   # api.ts, useInvoiceStore (Logique client)
│   └── src/hooks/      # useAgent, useVoiceInput
│
└── invoice_agent/      # (Futur) Microservice IA Python
```

## 🚀 Guide de Démarrage

### 1. Prérequis
- Node.js (v20 ou supérieur)
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

## ✅ Roadmap
- [x] Architecture du projet et configuration PNPM/NPM.
- [x] Backend : Implémentation du moteur de calcul SQL.
- [x] Backend : Création des endpoints API CRUD.
- [x] Frontend : Mise en place de l'interface Chat & Devis.
- [ ] Frontend : Connexion finale au Backend (En cours).
- [ ] IA : Intégration du module "Deep Agent" pour le NLP.
