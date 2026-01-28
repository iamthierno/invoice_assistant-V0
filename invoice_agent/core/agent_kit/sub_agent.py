"""
Subagent Definitions for Invoice Deep Agent.
Uses dictionary-based SubAgent pattern (preferred LangChain approach).
"""
from .tools.db_tools import manage_invoice_db
from .tools.invoice_tools import send_email_invoice, send_whatsapp_invoice
from .prompt import (
    INVOICE_MANAGER_SYSTEM_PROMPT,
    INVOICE_SENDER_SYSTEM_PROMPT
)


# Dictionary-based SubAgent configuration
# The main agent's `task` tool will spawn these subagents when delegating work
# Each subagent runs with its own context (isolated from main agent)
# Returns concise results to avoid bloating main agent's context

SUBAGENTS = [
    {
        "name": "invoice-manager",
        "description": (
            "Manage invoice items and invoices using direct database access. "
            "Can create invoices, add/edit/delete items, and list or view details. "
            "CRITICAL: Send ALL invoice-related instructions in a SINGLE call "
            "to this sub-agent to maintain transaction/context logic."
        ),
        "system_prompt": INVOICE_MANAGER_SYSTEM_PROMPT,
        "tools": [manage_invoice_db]
    },
    {
        "name": "invoice-sender",
        "description": (
            "Send the invoice to clients via email or WhatsApp. "
            "Use this when the user wants to share their invoice."
        ),
        "system_prompt": INVOICE_SENDER_SYSTEM_PROMPT,
        "tools": [send_email_invoice, send_whatsapp_invoice]
    }
]
