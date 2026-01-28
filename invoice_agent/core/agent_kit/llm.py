"""
LLM Configuration for Invoice Deep Agent.
Supports Ollama (local) and OpenRouter (cloud) providers.
"""
from langchain_ollama import ChatOllama
from langchain_openai import ChatOpenAI
from config import (LLM_PROVIDER, OLLAMA_BASE_URL, OLLAMA_MODEL, 
                    OPENROUTER_API_KEY, OPENROUTER_BASE_URL, OPENROUTER_MODEL,
                    TEMPERATURE, MAX_TOKENS, TIMEOUT, MAX_RETRIES)  
                    


def get_llm():
    """
    Get the configured LLM based on LLM_PROVIDER environment variable.
    
    Returns:
        ChatModel: Configured LangChain chat model (Ollama or OpenRouter)
    
    Raises:
        ValueError: If LLM_PROVIDER is not 'ollama' or 'openrouter'
    """
    if LLM_PROVIDER == "ollama":
        return ChatOllama(
            model=OLLAMA_MODEL,
            base_url=OLLAMA_BASE_URL,
            temperature=TEMPERATURE,
            num_predict=MAX_TOKENS,  # Ollama uses num_predict instead of max_tokens
            timeout=TIMEOUT,
        )
    
    elif LLM_PROVIDER == "openrouter":
        if not OPENROUTER_API_KEY:
            raise ValueError("OPENROUTER_API_KEY is required for OpenRouter provider")
        
        return ChatOpenAI(
            model=OPENROUTER_MODEL,
            openai_api_key=OPENROUTER_API_KEY,
            openai_api_base=OPENROUTER_BASE_URL,
            temperature=TEMPERATURE,
            max_tokens=MAX_TOKENS,
            request_timeout=TIMEOUT,
            max_retries=MAX_RETRIES,
        )
    
    else:
        raise ValueError(
            f"Unknown LLM_PROVIDER: '{LLM_PROVIDER}'. "
            "Supported values: 'ollama', 'openrouter'"
        )
