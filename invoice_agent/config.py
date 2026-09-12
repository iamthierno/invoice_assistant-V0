"""
Configuration for the Invoice Agent.
Loads environment variables for LLM providers and settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv() 

# LLM Provider: "ollama" or "openrouter"
LLM_PROVIDER = os.getenv("LLM_PROVIDER")

# Common LLM settings
TEMPERATURE = float(os.getenv("TEMPERATURE"))
MAX_TOKENS = int(os.getenv("MAX_TOKENS"))
TIMEOUT = int(os.getenv("TIMEOUT"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES"))

# Ollama Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL")

# OpenRouter Configuration
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL")

# Backend API URL
BACKEND_API_URL = os.getenv("BACKEND_API_URL")

# Database Configuration
PGUSER = os.getenv("PGUSER")
PGPASSWORD = os.getenv("PGPASSWORD")
PGHOST = os.getenv("PGHOST")
PGPORT = os.getenv("PGPORT")
PGDATABASE = os.getenv("PGDATABASE")