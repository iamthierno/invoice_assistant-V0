import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.main_agent import get_agent

agent = get_agent()
result = agent.invoke({
    "messages": [{"role": "user", "content": "Ajoute un service de consultation à 50000 FCFA"}]
}, config={"configurable": {"thread_id": "test-1"}})

print(result["messages"][-1].content)
