# Development Plan: Assistant Devis

## 1. Project Infrastructure
- [ ] 1.1 Create folder structure (`frontend`, `backend`, `invoice_agent`)
## 2. Frontend - Client Side
- [ ] 2.0 .env.frontend et config.ts doivent être dans le dossier frontend
- [ ] 2.1 **Core Logic**: Define TS types and implement calculation logic
- [ ] 2.2 **State Management**: Implement `useInvoiceStore` (Zustand)
- [ ] 2.3 **Services**: Implement `api.ts` (Backend) and `agent.ts` (NDJSON Streaming)
- [ ] 2.4 **Hooks**: Implement `useVoiceInput`, `useAgent`, `useChat`
- [ ] 2.5 **Components**: Modularize UI (`VoiceInputButton`, `ChatInput`, `ChatHistory`, `DevisPreview`, etc.)
- [ ] 2.6 **Styling**: Finalize minimalist white design and premium animations
- [ ] 2.7 **Testing**: Property tests for calculations
  - **Property 1**: Calcul correct des totaux d'article
  - **Property 2**: Calcul correct des totaux du devis

## 3. Backend - Server Side
- [ ] 3.0 .env.backend et config.ts doivent être dans le dossier backend
- [ ] 3.1 **DB Layer**: PostgreSQL models and stored procedures
- [ ] 3.2 **Logic**: CRUD controllers for invoices and analytics
- [ ] 3.3 **API**: Define routes (/api/devis, /api/agent/command, /api/agent/analytics)
- [ ] 3.4 **PDF**: Implement PDF generation service
- [ ] 3.5 **Testing**: NDJSON format validation
  - **Property 7**: Format NDJSON valide pour streaming

## 4. AI Agent - Intelligence Side
- [ ] 4.0 .env.agent et config.py doivent être dans le dossier invoice_agent
- [ ] 4.1 **Foundation**: Setup FastAPI and LangChain core
- [ ] 4.2 **Memory**: Implement Redis-backed session memory
  - **Property 9**: Mémoire session éphémère dans Redis
- [ ] 4.3 **Tools**: Implement toolkit (add_item, set_client, send_email, etc.)
- [ ] 4.4 **Agent Core**: Deep Agent logic with streaming output
- [ ] 4.5 **API**: FastAPI endpoints for real-time command processing
- [ ] 4.6 **Testing**: NDJSON format validation
  - **Property 10**: Format NDJSON valide pour streaming

## 5. System Integration & Verification
- [ ] 5.1 End-to-end flow: Voice/Text -> Agent -> State Update -> DB Persist
- [ ] 5.2 PDF generation and sharing (Email/WhatsApp)
  - **Property 8**: Contenu PDF complet
- [ ] 5.3 Final verification walkthrough
