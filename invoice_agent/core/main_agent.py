"""
Invoice Deep Agent - Main Orchestrator.

Uses LangChain Deep Agents for:
- File system tools (ls, read_file, write_file, edit_file)
- Todo list tracking (write_todos)
- Subagent delegation (task)
- Context management and large result eviction
"""
from deepagents import create_deep_agent
from langgraph.checkpoint.memory import MemorySaver

from .agent_kit.llm import get_llm
from .agent_kit.sub_agent import SUBAGENTS
from .agent_kit.prompt import ORCHESTRATOR_SYSTEM_PROMPT
from .agent_kit.memory import get_brain_backend, get_memory_store


def create_invoice_agent():
    """
    Create the main Invoice Deep Agent.
    
    Features:
    - Deep Agent architecture with built-in planning and context management
    - Subagent delegation for specialized tasks (invoice-manager, invoice-sender)
    - Persistent memory via /memories/ path (cross-thread)
    - Ephemeral workspace at / for temporary files
    - Thread-based session memory via MemorySaver
    
    Returns:
        CompiledGraph: The compiled deep agent ready for invocation
    """
    # Get LLM based on provider config
    llm = get_llm()
    
    # Get memory store for persistent cross-thread storage
    store = get_memory_store()
    
    # Get composite backend (ephemeral + persistent)
    backend = get_brain_backend()
    
    # Session checkpointer for conversation history
    checkpointer = MemorySaver()
    
    # Create the deep agent
    agent = create_deep_agent(
        model=llm,
        system_prompt=ORCHESTRATOR_SYSTEM_PROMPT,
        subagents=SUBAGENTS,
        backend=backend,
        store=store,
        checkpointer=checkpointer,
    )
    
    return agent


def get_invoice_agent():
    """
    Get or create the invoice agent instance.
    
    This is a factory function that creates the agent on first call.
    For production, consider using dependency injection.
    
    Returns:
        CompiledGraph: The invoice deep agent
    """
    return create_invoice_agent()


# Lazy initialization - agent is created when first imported
_agent_instance = None

def get_agent():
    """Get the singleton agent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = create_invoice_agent()
    return _agent_instance
