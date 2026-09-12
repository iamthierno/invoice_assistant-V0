FROM ghcr.io/astral-sh/uv:python3.12-alpine

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project files
COPY . .

# Install dependencies using uv
RUN uv sync --frozen --no-dev

# Expose port 8000
EXPOSE 8000

# Set the command to run the agent
CMD ["uv", "run", "main.py"]
