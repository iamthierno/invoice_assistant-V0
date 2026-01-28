import sys
from pathlib import Path
import json

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from core.main_agent import get_agent

def test_context_sync():
    print("\n" + "="*70)
    print("🧪 TEST: SYNCHRONISATION DU CONTEXTE (ID DEVIS)")
    print("="*70)
    
    agent = get_agent()
    thread_id = "test-sync-context"
    
    # 1. Simuler un ID de devis existant (fictif pour le test, ou récupérer un vrai via list)
    # Pour ce test, on va supposer que l'ID est fourni par le frontend.
    dummy_invoice_id = "550e8400-e29b-41d4-a716-446655440000"
    
    # Commande avec contexte
    prompt = f"[CONTEXT] Current Invoice ID: {dummy_invoice_id}\n\n[USER COMMAND] Ajoute 5 pelles à 2000"
    
    print(f"\n📝 PROMPT ENVOYÉ:\n{prompt}")
    
    found_correct_id = False
    
    for event in agent.stream({
        "messages": [{"role": "user", "content": prompt}]
    }, config={"configurable": {"thread_id": thread_id}}, stream_mode="updates"):
        
        for node_name, node_output in event.items():
            if "messages" in node_output:
                for msg in node_output["messages"]:
                    if hasattr(msg, 'tool_calls') and msg.tool_calls:
                        for tc in msg.tool_calls:
                            if tc['name'] == 'task':
                                print(f"📍 DÉLÉGATION: {tc['args']['request']}")
                            if tc['name'] == 'add_invoice_item':
                                print(f"✅ APPEL OUTIL: add_invoice_item avec invoice_id={tc['args']['invoice_id']}")
                                if tc['args']['invoice_id'] == dummy_invoice_id:
                                    found_correct_id = True
                    
                    if hasattr(msg, 'name') and msg.name == 'add_invoice_item':
                        print(f"📥 RÉPONSE OUTIL: {msg.content}")

    if found_correct_id:
        print("\n✨ RÉSULTAT: SUCCÈS - L'agent a utilisé l'ID du contexte !")
    else:
        print("\n❌ RÉSULTAT: ÉCHEC - L'agent n'a pas utilisé l'ID du contexte.")

def test_item_lookup_before_edit():
    print("\n" + "="*70)
    print("🧪 TEST: RECHERCHE D'ITEM ID AVANT MODIFICATION")
    print("="*70)
    
    agent = get_agent()
    thread_id = "test-item-lookup"
    
    # On utilise un vrai ID (le dernier créé) pour que get_invoice_details renvoie quelque chose
    from core.agent_kit.tools.invoice_tools import list_invoices
    import re
    
    res = list_invoices(limit=1)
    match = re.search(r"ID:\s*([a-f0-9\-]+)", res)
    if not match:
        print("⚠️ Aucun devis trouvé pour tester la modification. Créez-en un d'abord.")
        return
        
    invoice_id = match.group(1)
    prompt = f"[CONTEXT] Current Invoice ID: {invoice_id}\n\n[USER COMMAND] Change le prix du service 'Test' à 5000"
    
    print(f"\n📝 PROMPT ENVOYÉ:\n{prompt}")
    
    called_details = False
    
    for event in agent.stream({
        "messages": [{"role": "user", "content": prompt}]
    }, config={"configurable": {"thread_id": thread_id}}, stream_mode="updates"):
        
        for node_name, node_output in event.items():
            if "messages" in node_output:
                for msg in node_output["messages"]:
                    if hasattr(msg, 'tool_calls') and msg.tool_calls:
                        for tc in msg.tool_calls:
                            name = tc['name']
                            if name == 'get_invoice_details':
                                called_details = True
                                print(f"🔍 APPEL OUTIL: get_invoice_details pour l'ID {tc['args']['invoice_id']}")
                            if name == 'edit_invoice_item':
                                print(f"✏️ APPEL OUTIL: edit_invoice_item")
                                
    if called_details:
        print("\n✨ RÉSULTAT: SUCCÈS - L'agent a cherché les détails avant de modifier !")
    else:
        print("\n❌ RÉSULTAT: ÉCHEC - L'agent a tenté de modifier sans chercher l'ID de l'item.")

if __name__ == "__main__":
    test_context_sync()
    test_item_lookup_before_edit()
