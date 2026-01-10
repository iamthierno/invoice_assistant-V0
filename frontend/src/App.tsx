import { useEffect } from 'react'
import { MoreHorizontal, Loader2 } from 'lucide-react'
import { useInvoiceStore } from './services/useInvoiceStore'
import { useChat } from './hooks/useChat'
import { useVoiceInput } from './hooks/useVoiceInput'
import { useAgent } from './hooks/useAgent'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ChatHistory } from './components/chat/ChatHistory'
import { ChatInput } from './components/chat/ChatInput'
import { VoiceInputButton } from './components/chat/VoiceInputButton'
import { DevisPreview } from './components/devis/DevisPreview'
import { MailModal } from './components/modals/MailModal'
import { apiService } from './services/api'
import { useState } from 'react'

function App() {
  const {
    items, clientInfo, globalTax, globalDiscount, totals, isSyncing, showSuccess, invoiceId,
    initializeInvoice, addItem, updateItem, deleteItem, setClientInfo, reference, saveInvoice
  } = useInvoiceStore()

  const { messages, addMessage } = useChat()
  const { isListening, toggleListening } = useVoiceInput()
  const { isProcessing, processCommand } = useAgent()

  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    initializeInvoice()
  }, [])

  const handleSendMessage = async (text: string) => {
    addMessage('user', text)

    // Process through agent (mocked logic for frontend verification)
    await processCommand(text, (event) => {
      // Direct handlers if agent returns structured events
      if (event.type === 'addItem') {
        addItem(event.data)
        addMessage('assistant', `J'ai ajouté "${event.data.description}" au devis.`)
      } else if (event.type === 'setClientInfo') {
        setClientInfo(event.data)
        addMessage('assistant', `Les informations client ont été mises à jour.`)
      } else if (event.type === 'text') {
        addMessage('assistant', event.content)
      } else {
        // Fallback simulated logic for demo
        setTimeout(() => {
          if (text.toLowerCase().includes('ajoute')) {
            addItem({ description: 'Nouveau service', quantity: 1, unitPrice: 50000, tax: 18, taxType: 'percent', discount: 0, discountType: 'percent' })
            addMessage('assistant', 'Article ajouté au devis.')
          } else {
            addMessage('assistant', 'Je suis à votre écoute.')
          }
        }, 500)
      }
    })
  }

  const LeftPanel = (
    <>
      <div className="p-6 border-b border-slate-120 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">
            Assistant<span className="text-blue-600">Devis</span>
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
          {isSyncing ? <Loader2 size={16} className="animate-spin text-blue-600" /> : <MoreHorizontal size={16} />}
        </div>
      </div>

      <ChatHistory messages={messages} />

      <div className="p-8 bg-white border-t border-slate-100 space-y-6">
        <VoiceInputButton isListening={isListening} onClick={toggleListening} />
        <ChatInput onSend={handleSendMessage} disabled={isProcessing} />
      </div>
    </>
  )

  const RightPanel = (
    <DevisPreview
      items={items}
      clientInfo={clientInfo}
      totals={totals}
      globalTax={globalTax}
      globalDiscount={globalDiscount}
      reference={reference}
      onDeleteItem={deleteItem}
      onClientInfoChange={setClientInfo}
      onUpdateItem={updateItem}
    />
  )

  const handleAddItem = () => {
    // Add item with empty values - placeholders will show
    addItem({ description: '', quantity: 0, unitPrice: 0, tax: 0, taxType: 'percent', discount: 0, discountType: 'percent' })
  }

  const handleMailClick = () => {
    setIsMailModalOpen(true)
  }

  const handleSendEmail = async (email: string) => {
    if (!invoiceId) return;

    setIsSending(true);
    try {
      await apiService.sendEmail(invoiceId, email);
      setIsMailModalOpen(false);
      // Trigger success toast and reset via store
      await saveInvoice();
    } catch (error) {
      console.error("Failed to send email", error);
      alert("Erreur lors de l'envoi de l'email");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <DashboardLayout
        leftPanel={LeftPanel}
        rightPanel={RightPanel}
        onAddItem={handleAddItem}
        onMailClick={handleMailClick}
        showSuccess={showSuccess}
      />
      <MailModal
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
        onSend={handleSendEmail}
        isSending={isSending}
      />
    </>
  )
}

export default App