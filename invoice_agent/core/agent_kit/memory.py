"""
Memory Backend Configuration for Invoice Deep Agent.
Implements LangChain Deep Agents best practices with:
- StateBackend for ephemeral per-thread storage
- StoreBackend for persistent cross-thread memory via /memories/ path
"""
from deepagents.backends import CompositeBackend, StateBackend, StoreBackend
from langgraph.store.memory import InMemoryStore


def get_memory_store():
    """
    Get the memory store for persistent storage.
    
    Returns:
        InMemoryStore: For development/testing
        
    Note:
        For production, replace with PostgresStore:
        ```python
        from langgraph.store.postgres import PostgresStore
        store_ctx = PostgresStore.from_conn_string(os.environ["DATABASE_URL"])
        store = store_ctx.__enter__()
        store.setup()
        return store
        ```
    """
    return InMemoryStore()


def get_brain_backend(runtime=None):
    """
    Create a composite backend following LangChain Deep Agents patterns.
    
    Path routing:
    - '/' (root): ephemeral StateBackend (reset each thread)
    - '/memories/': persistent StoreBackend (cross-thread via LangGraph store)
    
    Usage examples:
    - `/notes.txt` → temporary, lost after thread ends
    - `/memories/preferences/format.md` → persistent, available across all threads
    - `/memories/clients/frequent.json` → persistent client data
    
    Args:
        runtime: Optional ToolRuntime for direct instantiation
        
    Returns:
        CompositeBackend or factory function
    """
    if runtime is None:
        # Return a factory function for create_deep_agent's backend parameter
        return lambda rt: CompositeBackend(
            default=StateBackend(rt),
            routes={"/memories/": StoreBackend(rt)}
        )
    
    # Direct instantiation with runtime
    return CompositeBackend(
        default=StateBackend(runtime),
        routes={"/memories/": StoreBackend(runtime)}
    )
