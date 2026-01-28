"""
Invoice Sending Tools for Deep Agent.
These tools handle sending invoices via email, WhatsApp, or print.
"""
from langchain_core.tools import tool
import httpx
from config import BACKEND_API_URL


@tool
def send_email_invoice(invoice_id: str, to_email: str) -> str:
    """
    Send the invoice PDF to a client via email.
    
    Args:
        invoice_id: The ID of the invoice to send
        to_email: The recipient's email address
    
    Returns:
        Confirmation message
    """
    try:
        response = httpx.post(
            f"{BACKEND_API_URL}/invoices/{invoice_id}/send-email",
            json={"toEmail": to_email},
            timeout=60  # Email can take time
        )
        response.raise_for_status()
        return f"✅ Devis envoyé par email à {to_email}"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de l'envoi email: {str(e)}"


@tool
def send_whatsapp_invoice(invoice_id: str, phone_number: str) -> str:
    """
    Send the invoice PDF to a client via WhatsApp.
    
    Args:
        invoice_id: The ID of the invoice to send
        phone_number: The recipient's phone number (with country code, e.g., '22376001952')
    
    Returns:
        Confirmation message
    """
    try:
        response = httpx.post(
            f"{BACKEND_API_URL}/invoices/{invoice_id}/send-whatsapp",
            json={"toPhoneNumber": phone_number},
            timeout=60
        )
        response.raise_for_status()
        return f"✅ Devis envoyé par WhatsApp à +{phone_number}"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de l'envoi WhatsApp: {str(e)}"

