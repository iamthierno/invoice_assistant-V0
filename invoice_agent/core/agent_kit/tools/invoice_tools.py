"""
Invoice Management Tools for Deep Agent.
These tools interact with the backend API to manage invoice items.
"""
from langchain_core.tools import tool
import httpx
from config import BACKEND_API_URL


def get_backend_url(path: str) -> str:
    """Helper to join BACKEND_API_URL and path correctly."""
    base = BACKEND_API_URL.rstrip('/')
    # Ensure path starts with /
    if not path.startswith('/'):
        path = '/' + path
    return f"{base}{path}"


@tool
def create_invoice(
    client_name: str = "",
    client_phone: str = "",
) -> str:
    """
    Create a new empty invoice.
    
    Args:
        client_name: Name of the client (optional)
        client_phone: Phone number of the client (optional)
    
    Returns:
        Confirmation message with the new invoice ID and reference
    """
    try:
        response = httpx.post(
            get_backend_url("invoices"),
            json={
                "clientInfo": {
                    "name": client_name,
                    "phone": client_phone,
                },
                "globalTax": 0,
                "globalDiscount": 0
            },
            timeout=30
        )
        response.raise_for_status()
        invoice = response.json()
        return f"✅ Devis créé avec succès! Référence: {invoice.get('reference')} (ID: {invoice.get('id')})"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de la création du devis: {str(e)}"


@tool
def add_invoice_item(
    invoice_id: str,
    description: str,
    quantity: int = 1,
    unit_price: float = 0,
    tax: float = 0,
    discount: float = 0
) -> str:
    """
    Add a new item to the invoice.
    
    Args:
        invoice_id: The ID of the invoice to add the item to
        description: Description of the item/service
        quantity: Number of units (default: 1)
        unit_price: Price per unit in FCFA (default: 0)
        tax: Tax percentage (default: 0)
        discount: Discount percentage (default: 0)
    
    Returns:
        Confirmation message with the item details
    """
    try:
        response = httpx.post(
            get_backend_url(f"invoices/{invoice_id}/items"),
            json={
                "description": description,
                "quantity": quantity,
                "unitPrice": unit_price,
                "tax": tax,
                "taxType": "percent",
                "discount": discount,
                "discountType": "percent"
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        # Handle potential nesting if backend returns { "add_invoice_item": { ... } }
        item = data.get("add_invoice_item", data) if isinstance(data, dict) else {}
        
        item_id = item.get("id")
        return f"✅ Article ajouté: '{description}' (ID: {item_id}) au devis {invoice_id}"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de l'ajout: {str(e)}"


@tool
def edit_invoice_item(
    item_id: str,
    description: str = None,
    quantity: int = None,
    unit_price: float = None,
    tax: float = None,
    discount: float = None
) -> str:
    """
    Edit an existing item in the invoice.
    
    Args:
        item_id: The ID of the item to edit
        description: New description (optional)
        quantity: New quantity (optional)
        unit_price: New price per unit (optional)
        tax: New tax percentage (optional)
        discount: New discount percentage (optional)
    
    Returns:
        Confirmation message with updated details
    """
    data = {}
    if description is not None:
        data["description"] = description
    if quantity is not None:
        data["quantity"] = quantity
    if unit_price is not None:
        data["unitPrice"] = unit_price
    if tax is not None:
        data["tax"] = tax
    if discount is not None:
        data["discount"] = discount
    
    if not data:
        return "⚠️ Aucune modification spécifiée"
    
    try:
        response = httpx.put(
            get_backend_url(f"invoices/items/{item_id}"),
            json=data,
            timeout=30
        )
        response.raise_for_status()
        return f"✅ Article {item_id} mis à jour avec succès."
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de la modification: {str(e)}"


@tool
def delete_invoice_item(item_id: str) -> str:
    """
    Delete an item from the invoice.
    
    Args:
        item_id: The ID of the item to delete
    
    Returns:
        Confirmation message
    """
    try:
        response = httpx.delete(
            get_backend_url(f"invoices/items/{item_id}"),
            timeout=30
        )
        response.raise_for_status()
        return f"✅ Article {item_id} supprimé du devis"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de la suppression: {str(e)}"


@tool
def get_invoice_details(invoice_id: str) -> str:
    """
    Get the current state of the invoice with all items and totals.
    
    Args:
        invoice_id: The ID of the invoice to retrieve
    
    Returns:
        Invoice details including items and totals
    """
    try:
        response = httpx.get(
            get_backend_url(f"invoices/{invoice_id}"),
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        # Handle potential nesting if backend returns { "get_invoice_with_items": { ... } }
        invoice = data.get("get_invoice_with_items", data) if isinstance(data, dict) else {}
        
        # Format the response
        items_str = "\n".join([
            f"  - {item['description']} (ID: {item['id']}): {item['quantity']} x {item['unitPrice']} FCFA"
            for item in invoice.get('items', [])
        ])
        
        return f"""📄 Devis #{invoice.get('reference', 'N/A')}
Client: {invoice.get('clientInfo', {}).get('name', 'Non défini')}
Articles:
{items_str or '  (aucun article)'}
Total HT: {invoice.get('subtotal', 0)} FCFA
Total TTC: {invoice.get('total', 0)} FCFA"""
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de la récupération: {str(e)}"


@tool
def list_invoices(limit: int = 5) -> str:
    """
    List recent invoices to find an ID.
    
    Args:
        limit: Number of invoices to return (default: 5)
    
    Returns:
        List of invoices with IDs, references, and client names
    """
    try:
        response = httpx.get(
            get_backend_url(f"invoices?limit={limit}"),
            timeout=30
        )
        response.raise_for_status()
        invoices = response.json()
        
        if not invoices:
            return "📭 Aucun devis trouvé."
            
        lines = []
        for inv in invoices:
            client = inv.get('client_name') or "Client inconnu"
            ref = inv.get('reference')
            inv_id = inv.get('id')
            total = inv.get('total_ttc')
            lines.append(f"- {ref} ({client}): {total} FCFA (ID: {inv_id})")
            
        return "📋 Derniers devis:\n" + "\n".join(lines)
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de la récupération de la liste: {str(e)}"


@tool
def send_email_invoice(invoice_id: str, to_email: str) -> str:
    """Send an invoice via email."""
    try:
        response = httpx.post(
            get_backend_url(f"invoices/{invoice_id}/send-email"),
            json={"toEmail": to_email},
            timeout=30
        )
        response.raise_for_status()
        return f"✅ Devis envoyé par email à {to_email}"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de l'envoi email: {str(e)}"


@tool
def send_whatsapp_invoice(invoice_id: str, to_phone: str) -> str:
    """Send an invoice via WhatsApp."""
    try:
        response = httpx.post(
            get_backend_url(f"invoices/{invoice_id}/send-whatsapp"),
            json={"toPhoneNumber": to_phone},
            timeout=30
        )
        response.raise_for_status()
        return f"✅ Devis envoyé par WhatsApp au {to_phone}"
    except httpx.HTTPError as e:
        return f"❌ Erreur lors de l'envoi WhatsApp: {str(e)}"
