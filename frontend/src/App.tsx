
import { useEffect, useState } from 'react'
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
import { WhatsAppModal } from './components/modals/WhatsAppModal'
import { apiService } from './services/api'

function App() {
  const {
    items, clientInfo, globalTax, globalDiscount, totals, isSyncing, showSuccess, invoiceId,
    initializeInvoice, addItem, updateItem, deleteItem, setClientInfo, reference, saveInvoice, refreshInvoice
  } = useInvoiceStore()

  const { messages, addMessage } = useChat()
  const { isListening, toggleListening } = useVoiceInput()
  const { isProcessing, processCommand } = useAgent()

  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    initializeInvoice()
  }, [])

  const handleSendMessage = async (text: string) => {
    addMessage('user', text)

    // Process through agent
    await processCommand(text, (event) => {
      // Direct handlers if agent returns structured events
      if (event.type === 'invoiceCreated') {
        refreshInvoice(event.invoiceId)
      } else if (event.type === 'invoiceUpdated') {
        refreshInvoice()
      } else if (event.type === 'text') {
        addMessage('assistant', event.content)
      } else if (event.type === 'error') {
        addMessage('assistant', `Désolé, une erreur est survenue: ${event.content}`)
      }
    })
  }

  const LeftPanel = (
    <>
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
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

  const handleWhatsAppClick = () => {
    setIsWhatsAppModalOpen(true)
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

  const handleSendWhatsApp = async (phoneNumber: string) => {
    if (!invoiceId) return;

    setIsSending(true);
    try {
      await apiService.sendWhatsApp(invoiceId, phoneNumber);
      setIsWhatsAppModalOpen(false);
      // Trigger success toast and reset via store
      await saveInvoice();
    } catch (error) {
      console.error("Failed to send WhatsApp", error);
      alert("Erreur lors de l'envoi du message WhatsApp");
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
        onWhatsAppClick={handleWhatsAppClick}
        showSuccess={showSuccess}
      />
      <MailModal
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
        onSend={handleSendEmail}
        isSending={isSending}
      />
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onSend={handleSendWhatsApp}
        defaultPhoneNumber={clientInfo.phone}
      />
    </>
  )
}

export default App