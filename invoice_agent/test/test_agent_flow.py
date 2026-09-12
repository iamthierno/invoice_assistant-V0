import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1/agent/command"

def send_command(command, invoice_id=None):
    print(f"\n--- Sending Command: {command} ---")
    payload = {"command": command}
    if invoice_id:
        payload["invoice_id"] = invoice_id
        
    try:
        with requests.post(BASE_URL, json=payload, stream=True) as r:
            r.raise_for_status()
            extracted_id = None
            for line in r.iter_lines():
                if line:
                    decoded_line = line.decode('utf-8')
                    print(f"Received: {decoded_line}")
                    try:
                        data = json.loads(decoded_line)
                        if data.get("type") == "invoiceCreated":
                            extracted_id = data.get("invoiceId")
                            print(f">>> CAPTURED INVOICE ID: {extracted_id}")
                    except json.JSONDecodeError:
                        pass
            return extracted_id
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    # 1. Create Invoice
    print("1. TEST: Create Invoice")
    invoice_id = send_command("Creer un devis pour Mr Dupont avec 20 sacs de ciment a 20000 et 5 pelles a 5000")
    
    if not invoice_id:
        print("❌ Failed to capture Invoice ID. Stopping.")
        return

    # 2. Add Item
    print("\n2. TEST: Add Item (Context Retention)")
    # Note: We pass invoice_id to simulate frontend behavior, but we also want to see if agent asks for it if we DIDN'T pass it. 
    # The user's issue was agent asking for ID even when it should know it. 
    # But the API is stateless, so the Frontend MUST pass the ID. 
    # The fix I implemented in sub_agent.py was to ensure the agent returns the ID so the frontend CAN capture it.
    # So passing it here is correct behavior for the frontend.
    send_command("Ajoute 10 brouettes a 15000", invoice_id)

    # 3. Modify Item
    print("\n3. TEST: Modify Item")
    send_command("Change le prix du ciment a 22000", invoice_id)

    # 4. Delete Item
    print("\n4. TEST: Delete Item")
    send_command("Supprime les pelles", invoice_id)

if __name__ == "__main__":
    main()
