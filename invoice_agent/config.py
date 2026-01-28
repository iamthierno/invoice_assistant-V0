"""
Configuration for the Invoice Agent.
Loads environment variables for LLM providers and settings.
"""
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv() # Fallback

# LLM Provider: "ollama" or "openrouter"
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "ollama")

# Common LLM settings
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "4096"))
TIMEOUT = int(os.getenv("TIMEOUT", "60"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))

# Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o")

# Backend API URL
BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://localhost:4000/api")

# Database Configuration
DB_USER = "postgres"
DB_PASSWORD = "Nistos123@"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "assistant_invoice"