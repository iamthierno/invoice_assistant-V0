# Development Plan: Assistant Devis

## 1. Project Infrastructure
- [X] 1.1 Create folder structure (`frontend`, `backend`, `invoice_agent`)
## 2. Frontend - Client Side
- [X] 2.0 .env et config.ts doivent être dans le dossier frontend
- [X] 2.1 **Core Logic**: Define TS types and implement calculation logic
- [X] 2.2 **State Management**: Implement `useInvoiceStore` (Zustand)
- [X] 2.3 **Services**: Implement `api.ts` (Backend) and `agent.ts` (NDJSON Streaming)
- [X] 2.4 **Hooks**: Implement `useVoiceInput`, `useAgent`, `useChat`
- [X] 2.5 **Components**: Modularize UI (`VoiceInputButton`, `ChatInput`, `ChatHistory`, `DevisPreview`, etc.)
- [X] 2.6 **Styling**: Finalize minimalist white design and premium animations
- [X] 2.7 **Testing**: Property tests for calculations
  - **Property 1**: Calcul correct des totaux d'article
  - **Property 2**: Calcul correct des totaux du devis

## 3. Backend - Server Side
- [X] 3.0 .env et config.ts doivent être dans le dossier backend
- [X] 3.1 **DB Layer**: PostgreSQL models and stored procedures
- [X] 3.2 **Logic**: CRUD controllers for invoices and analytics
- [X] 3.3 **API**: Define routes (/api/devis, /api/agent/command, /api/agent/analytics)
- [X] 3.4 **PDF**: Implement PDF generation service
- [X] 3.5 **Testing**: NDJSON format validation
  - **Property 7**: Format NDJSON valide pour streaming

## 4. AI Agent - Intelligence Side
- [X] 4.0 .env et config.py doivent être dans le dossier invoice_agent
- [X] 4.1 **Foundation**: Setup FastAPI and LangChain core

- [X] 4.3 **Tools**: Implement toolkit 
- [X] 4.4 **Agent Core**: Deep Agent logic with streaming output
- [X] 4.5 **API**: FastAPI endpoints for real-time command processing
- [X] 4.6 **Testing**: NDJSON format validation
  - **Property 10**: Format NDJSON valide pour streaming

## 5. System Integration & Verification
- [ ] 5.1 End-to-end flow: Voice/Text -> Agent -> State Update -> DB Persist
- [ ] 5.2 PDF generation and sharing (Email/WhatsApp)
  - **Property 8**: Contenu PDF complet
- [ ] 5.3 Final verification walkthrough
