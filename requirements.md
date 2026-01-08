# Requirements Document

## Introduction

Assistant Devis est une application permettant aux artisans et prestataires de services de créer des devis professionnels complexes (articles, TVA, remises) par la voix ou par écrit via un chatbot, éliminant la saisie manuelle fastidieuse. L'application cible les artisans (BTP, électriciens, plombiers), indépendants et commerciaux terrain.

## Glossaire

- **Devis**: Document commercial détaillant les articles, prix, taxes et remises pour un client
- **numéro_devis**: Numéro unique attribué au devis generer automatiquement depuis base de données
- **Article**: Ligne du devis contenant description, quantité, prix unitaire, taxe et remise optionnelles
- **HT (Hors Taxe)**: Montant avant application de la TVA
- **TTC (Toutes Taxes Comprises)**: Montant final incluant toutes les taxes
- **TVA**: Taxe sur la Valeur Ajoutée appliquée aux articles ou au total
- **Remise**: Réduction du prix d'un article ou du total
- **Agent_IA**: Service d'intelligence artificielle traitant les commandes vocales/textuelles
- **Real_Time_API**: Interface de communication à faible latence pour l'interaction vocale
- **Tool_Calling**: Mécanisme permettant à l'IA d'appeler des fonctions métier

## Requirements

### Requirement 1: Interaction Vocale et Textuelle

**User Story:** En tant qu'artisan, je veux pouvoir dicter ou écrire mes commandes de devis naturellement, afin de créer des devis sans saisie manuelle fastidieuse.

#### Acceptance Criteria

1. WHEN l'utilisateur clique sur le bouton micro, THE Interface SHALL activer l'enregistrement vocal et afficher une animation d'onde sonore
2. WHEN l'utilisateur parle, THE Agent_IA SHALL transcrire et interpréter la commande vocale en temps réel
3. WHEN l'utilisateur saisit du texte dans le champ chat, THE Agent_IA SHALL interpréter la commande textuelle
4. WHEN une commande est traitée, THE Interface SHALL afficher la commande utilisateur et la confirmation de l'IA dans l'historique de chat
5. IF l'enregistrement vocal échoue, THEN THE Interface SHALL afficher un message d'erreur explicite et proposer la saisie textuelle

### Requirement 2: Gestion des Articles du Devis

**User Story:** En tant qu'artisan, je veux ajouter, modifier et supprimer des articles dans mon devis par commande vocale ou textuelle, afin de construire mon devis dynamiquement.

#### Acceptance Criteria

1. WHEN l'utilisateur demande d'ajouter un article (ex: "Ajoute une pose de parquet pour 50m² à 45000 XOF le mètre"), THE Agent_IA SHALL appeler la fonction addItem avec les paramètres extraits (description, quantité, prix unitaire)
2. WHEN la fonction addItem est appelée, THE Devis_State SHALL ajouter l'article à la liste et recalculer les totaux
3. WHEN l'utilisateur demande de modifier un article (ex: "modifie le prix de l'article pose de parquet à 50000 XOF"), THE Agent_IA SHALL appeler la fonction updateItem avec les nouveaux paramètres
4. WHEN l'utilisateur demande de supprimer un article, THE Agent_IA SHALL appeler la fonction deleteItem pour retirer l'article de la liste
5. WHEN un article est ajouté avec taxe et remise optionnelles, THE Devis_State SHALL stocker et appliquer ces valeurs au calcul de l'article

### Requirement 3: Calculs Automatiques

**User Story:** En tant qu'artisan, je veux que les calculs de TVA, remises et totaux soient automatiques, afin de ne pas faire d'erreurs de calcul.

#### Acceptance Criteria

1. WHEN un article est ajouté ou modifié, THE Devis_State SHALL calculer automatiquement le montant HT de l'article (quantité × prix unitaire)
2. WHEN une remise est appliquée à un article, THE Devis_State SHALL soustraire le pourcentage de remise du montant HT de l'article
3. WHEN une taxe est appliquée à un article, THE Devis_State SHALL ajouter le pourcentage de taxe au montant après remise
4. WHEN le devis contient des articles, THE Devis_State SHALL calculer le total HT, le total des taxes, le total des remises et le montant TTC
5. WHEN l'utilisateur demande une remise ou taxe globale (ex: "Applique une remise de 10% sur le total"), THE Agent_IA SHALL appeler updateDiscount ou updateTax pour modifier le taux global

### Requirement 4: Gestion des Informations Client

**User Story:** En tant qu'artisan, je veux pouvoir définir les informations du client sur le devis, afin de personnaliser le document.

#### Acceptance Criteria

1. WHEN l'utilisateur fournit les informations client (ex: "Le devis est pour Monsieur Martin, 12 rue de Paris, 0612345678"), THE Agent_IA SHALL appeler la fonction setClientInfo avec nom, adresse et téléphone
2. WHEN la fonction setClientInfo est appelée, THE Devis_State SHALL mettre à jour les informations client affichées sur l'aperçu
3. WHEN les informations client sont partielles, THE Devis_State SHALL accepter et stocker uniquement les champs fournis

### Requirement 5: Visualisation en Temps Réel

**User Story:** En tant qu'artisan, je veux voir mon devis se mettre à jour instantanément à chaque modification, afin de vérifier visuellement le contenu.

#### Acceptance Criteria

1. WHEN un article est ajouté, modifié ou supprimé, THE Interface SHALL mettre à jour l'aperçu du devis instantanément
2. WHEN les informations client sont modifiées, THE Interface SHALL afficher les nouvelles informations sur l'aperçu
3. WHEN les totaux sont recalculés, THE Interface SHALL afficher les nouveaux montants HT, TVA, remise et TTC
4. THE Interface SHALL présenter l'aperçu du devis dans un format ressemblant à un document papier professionnel

### Requirement 6: Génération PDF

**User Story:** En tant qu'artisan, je veux générer un PDF de mon devis finalisé, afin de l'envoyer à mon client.

#### Acceptance Criteria

1. WHEN l'utilisateur demande de générer le PDF (ex: "Génère le PDF"), THE Agent_IA SHALL appeler la fonction generatePDF
2. WHEN la fonction generatePDF est appelée, THE Backend SHALL créer un fichier PDF avec toutes les informations du devis
3. WHEN le PDF est généré, THE Interface SHALL permettre le téléchargement immédiat du fichier
4. THE PDF SHALL contenir les informations client, la liste des articles avec leurs détails, et tous les totaux calculés

### Requirement 7: Interface Utilisateur Dashboard

**User Story:** En tant qu'artisan, je veux une interface moderne et intuitive divisée en deux colonnes, afin de contrôler et visualiser mon devis efficacement.

#### Acceptance Criteria

1. THE Interface SHALL afficher une colonne gauche contenant le bouton micro avec animation, le champ de saisie chat et l'historique des échanges
2. THE Interface SHALL afficher une colonne droite contenant l'aperçu live du devis au format document
3. THE Interface SHALL utiliser un design minimaliste blanc avec des ombres subtiles au survol
4. THE Interface SHALL être responsive et fonctionner sur différentes tailles d'écran

### Requirement 8: Communication Agent IA - Backend

**User Story:** En tant que développeur, je veux une communication streaming entre l'agent IA et le backend, afin d'avoir des réponses en temps réel.

#### Acceptance Criteria

1. WHEN l'agent IA traite une commande, THE API SHALL utiliser le format NDJSON pour le streaming des réponses
2. WHEN l'agent IA appelle un tool, THE Backend SHALL exécuter la fonction correspondante et mettre à jour l'état du devis
3. THE Agent_IA SHALL utiliser LangChain avec un provider LLM configurable (Ollama ou OpenRouter)
4. THE Agent_IA SHALL maintenir une mémoire court terme et long terme (PostgreSQL) pour le contexte conversationnel

### Requirement 9: Persistance des Données

**User Story:** En tant qu'artisan, je veux que mes devis soient sauvegardés, afin de pouvoir les retrouver ultérieurement.

#### Acceptance Criteria

1. WHEN un devis est créé ou modifié, THE Backend SHALL persister les données dans PostgreSQL
2. WHEN l'utilisateur revient sur l'application, THE Backend SHALL permettre de charger les devis existants
3. THE Database SHALL stocker les informations client, les articles et les paramètres de taxe/remise pour chaque devis
4. creer des procedures CRUD ou autre dans postgresql pour faciliter l'acces aux données et ce qui permet de simplifier les logiques du backend

### Requirement 10: Frontend

**User Story:** En tant qu'artisan, je veux une interface utilisateur moderne et intuitive, afin de contrôler et visualiser mon devis efficacement.

#### Acceptance Criteria

1. THE Interface SHALL afficher une colonne gauche contenant le bouton micro avec animation, le champ de saisie chat et l'historique des échanges
2. THE Interface SHALL afficher une colonne droite contenant l'aperçu live du devis au format document
3. THE Interface SHALL utiliser un design theme "white", un design futuriste bien stylisé avec des ombres subtiles au survol.
4. THE Interface SHALL être responsive et fonctionner sur différentes tailles d'écran


frontend/
  src/
    components/         # Composants React
    pages/              # Pages de l'application
    hooks/              # Custom hooks React
    assets/             # Images, styles, polices
    services/           # Appels API
    utils/              # Fonctions utilitaires


backend/
  src/
    routes/             # Endpoints Express
    controllers/        # Logique métier des routes
    models/             # Schémas PostgreSQL
    services/           # Logique métier complexe
    middleware/         # Auth, validation
   
invoice_agent/
  core/
    main_agent.py       # Agent principal LangChain Deep Agents
    subagent.py         # Subagents spécialisés (analyse, PDF)
    prompts.py          # Tous les prompts système
  tools/
    # ajouter les tools ici
    _toolkit_.py          # Regroupement de tous les tools ici
  memories/
    backend.py    # Backend Redis pour session éphémère
    memory_manager.py   # Gestion mémoire (Redis + PostgreSQL)
  llm/
    ollama.py           # Client Ollama
    openrouter.py       # Client OpenRouter
    llm_provider.py     # Switcher entre providers
  api/v1/
    endpoints.py        # Endpoints FastAPI NDJSON streaming
    schemas.py          # Schémas Pydantic
  main.py               # Démarrage FastAPI + uvicorn
  .env                # Variables d'environnement
  config.py             # Variables d'environnement Python
  requirements.txt      # Dépendances Python
```
