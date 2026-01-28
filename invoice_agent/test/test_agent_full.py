"""
Tests complets de l'agent Invoice avec tous les outils et sous-agents.
Affiche le workflow complet: todolist, tool calling, délégation, réponse finale.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from core.main_agent import get_agent

# Agent global pour maintenir le contexte entre les tests
_agent = None

def get_test_agent():
    global _agent
    if _agent is None:
        _agent = get_agent()
    return _agent


def test_agent_with_workflow(prompt: str, thread_id: str = "test-scenario"):
    """Execute une commande et affiche le workflow complet."""
    print(f"\n{'='*70}")
    print(f"📝 PROMPT: {prompt}")
    print('='*70)
    
    agent = get_test_agent()
    
    # Utiliser stream pour voir chaque étape du workflow
    print("\n🔄 WORKFLOW:")
    print("-"*70)
    
    step_count = 0
    final_response = None
    
    for event in agent.stream({
        "messages": [{"role": "user", "content": prompt}]
    }, config={"configurable": {"thread_id": thread_id}}, stream_mode="updates"):
        
        step_count += 1
        
        for node_name, node_output in event.items():
            print(f"\n📍 ÉTAPE {step_count}: [{node_name.upper()}]")
            
            # Gérer différents types de sortie
            messages = None
            if isinstance(node_output, dict) and "messages" in node_output:
                messages = node_output["messages"]
            elif hasattr(node_output, 'messages'):
                messages = node_output.messages
            
            if messages:
                # S'assurer que messages est itérable
                if not isinstance(messages, (list, tuple)):
                    messages = [messages]
                    
                for msg in messages:
                    msg_type = type(msg).__name__
                    
                    # Tool calls (délégation ou appel d'outil)
                    if hasattr(msg, 'tool_calls') and msg.tool_calls:
                        print(f"   🔧 Tool Calls:")
                        for tc in msg.tool_calls:
                            tool_name = tc.get('name', 'unknown') if isinstance(tc, dict) else getattr(tc, 'name', 'unknown')
                            tool_args = tc.get('args', {}) if isinstance(tc, dict) else getattr(tc, 'args', {})
                            print(f"      → {tool_name}")
                            if tool_name == 'task':
                                # Délégation à un sous-agent
                                subagent = tool_args.get('name', 'N/A') if isinstance(tool_args, dict) else 'N/A'
                                request = tool_args.get('request', 'N/A') if isinstance(tool_args, dict) else 'N/A'
                                print(f"        📤 DÉLÉGATION: {subagent}")
                                print(f"        📋 Tâche: {str(request)[:100]}...")
                            else:
                                print(f"        Args: {tool_args}")
                    
                    # Tool response
                    if hasattr(msg, 'name') and hasattr(msg, 'content') and msg_type == 'ToolMessage':
                        print(f"   📥 Réponse outil [{msg.name}]:")
                        content = str(msg.content)[:200]
                        print(f"      {content}{'...' if len(str(msg.content)) > 200 else ''}")
                    
                    # AI Message (réponse finale ou intermédiaire)
                    if msg_type == 'AIMessage' and hasattr(msg, 'content') and msg.content:
                        if not (hasattr(msg, 'tool_calls') and msg.tool_calls):
                            final_response = msg.content
                            print(f"   💬 Message AI:")
                            print(f"      {str(msg.content)[:300]}{'...' if len(str(msg.content)) > 300 else ''}")
            
            # Todos (planification)
            todos = None
            if isinstance(node_output, dict) and "todos" in node_output:
                todos = node_output["todos"]
            elif hasattr(node_output, 'todos'):
                todos = node_output.todos
                
            if todos:
                print(f"   📋 TODOLIST:")
                for todo in todos:
                    if isinstance(todo, dict):
                        status = "✅" if todo.get('done') else "⏳"
                        print(f"      {status} {todo.get('task', 'N/A')}")
    
    print("\n" + "-"*70)
    print(f"🤖 RÉPONSE FINALE:")
    print(final_response or "(Pas de réponse textuelle)")
    print('='*70)
    
    return final_response


def main():
    print("\n" + " 🧪 SCÉNARIO DE TEST COMPLET ".center(70, "="))
    print("Workflow: planification → délégation → outils → réponse")
    print("Thread unique pour maintenir le contexte du devis")
    
    thread = "test-scenario-full"
    
    # ========== PHASE 1: AJOUT DE 5 ARTICLES ==========
    print("\n\n" + "=" * 70)
    print(" 🛠️ PHASE 1: AJOUT DE 5 ARTICLES/SERVICES")
    print("=" * 70)
    
    print("\n\n" + " TEST 1.1: Pose de carrelage ".center(70, "📌"))
    test_agent_with_workflow(
        "Ajoute une pose de carrelage 30m² à 12000 FCFA/m².",
        thread_id=thread
    )
    
    print("\n\n" + " TEST 1.2: Installation électrique ".center(70, "📌"))
    test_agent_with_workflow(
        "Ajoute installation électrique complète, quantité 1, prix 250000 FCFA.",
        thread_id=thread
    )
    
    print("\n\n" + " TEST 1.3: Peinture ".center(70, "📌"))
    test_agent_with_workflow(
        "Ajoute peinture intérieure 4 pièces à 45000 FCFA par pièce.",
        thread_id=thread
    )
    
    print("\n\n" + " TEST 1.4: Plomberie ".center(70, "📌"))
    test_agent_with_workflow(
        "Ajoute travaux de plomberie, 1 unité à 180000 FCFA.",
        thread_id=thread
    )
    
    print("\n\n" + " TEST 1.5: Main d'oeuvre ".center(70, "📌"))
    test_agent_with_workflow(
        "Ajoute main d'oeuvre générale, 5 jours à 25000 FCFA/jour.",
        thread_id=thread
    )
    
    # ========== PHASE 2: ÉTAT DU DEVIS ==========
    print("\n\n" + "=" * 70)
    print(" 📋 PHASE 2: CONSULTATION DU DEVIS")
    print("=" * 70)
    test_agent_with_workflow(
        "Montre-moi l'état actuel du devis avec tous les articles",
        thread_id=thread
    )
    
    # ========== PHASE 3: MODIFICATION DE 2 ARTICLES ==========
    print("\n\n" + "=" * 70)
    print(" ✏️ PHASE 3: MODIFICATION DE 2 ARTICLES")
    print("=" * 70)
    
    print("\n\n" + " TEST 3.1: Modifier le prix du carrelage ".center(70, "📌"))
    test_agent_with_workflow(
        "Modifie le prix du carrelage à 15000 FCFA/m²",
        thread_id=thread
    )
    
    print("\n\n" + " TEST 3.2: Modifier la quantité de peinture ".center(70, "📌"))
    test_agent_with_workflow(
        "Change la quantité de peinture à 6 pièces",
        thread_id=thread
    )
    
    # ========== PHASE 4: SUPPRESSION DE 2 ARTICLES ==========
    print("\n\n" + "=" * 70)
    print(" 🗑️ PHASE 4: SUPPRESSION DE 2 ARTICLES")
    print("=" * 70)
    
    print("\n\n" + " TEST 4.1: Supprimer la plomberie ".center(70, "📌"))
    test_agent_with_workflow(
        "Supprime les travaux de plomberie du devis",
        thread_id=thread
    )
    
    print("\n\n" + " TEST 4.2: Supprimer la main d'oeuvre ".center(70, "📌"))
    test_agent_with_workflow(
        "Retire la main d'oeuvre générale",
        thread_id=thread
    )
    
    # ========== PHASE 5: ÉTAT FINAL DU DEVIS ==========
    print("\n\n" + "=" * 70)
    print(" 📊 PHASE 5: ÉTAT FINAL DU DEVIS")
    print("=" * 70)
    test_agent_with_workflow(
        "Affiche le récapitulatif final du devis avec les totaux",
        thread_id=thread
    )
    
    # ========== RÉSUMÉ ==========
    print("\n\n" + " ✅ SCÉNARIO TERMINÉ ".center(70, "="))
    print("""
    Résumé des opérations:
    ----------------------
    ✅ 5 articles ajoutés (carrelage, électricité, peinture, plomberie, main d'oeuvre)
    ✅ 2 articles modifiés (carrelage: prix, peinture: quantité)
    ✅ 2 articles supprimés (plomberie, main d'oeuvre)
    ✅ 3 articles restants dans le devis final
    """)


if __name__ == "__main__":
    main()
