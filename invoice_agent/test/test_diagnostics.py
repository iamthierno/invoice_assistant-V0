import httpx
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from config import BACKEND_API_URL
    print(f"DEBUG: BACKEND_API_URL is '{BACKEND_API_URL}'")
except ImportError:
    print("ERROR: Could not import config")
    sys.exit(1)

def get_backend_url(path: str) -> str:
    base = BACKEND_API_URL.rstrip('/')
    if not path.startswith('/'):
        path = '/' + path
    return f"{base}{path}"

def test_connection():
    url = get_backend_url("health") # Some endpoints exist?
    # Actually let's check the root or invoices
    url = get_backend_url("invoices")
    print(f"Testing connectivity to: {url}")
    try:
        response = httpx.get(url, timeout=5)
        print(f"Response Status: {response.status_code}")
        print(f"Response Data: {response.text[:200]}...")
    except Exception as e:
        print(f"Connection failed: {e}")

def test_add_item():
    # Find a valid invoice ID first
    url_list = get_backend_url("invoices?limit=1")
    try:
        res = httpx.get(url_list)
        data = res.json()
        if not data:
            print("No invoices found to test with.")
            return
        invoice_id = data[0]['id']
        print(f"Testing add_item on invoice {invoice_id}")
        
        post_url = get_backend_url(f"invoices/{invoice_id}/items")
        payload = {
            "description": "Diagnostic Ciment",
            "quantity": 1,
            "unitPrice": 1000,
            "tax": 0,
            "taxType": "percent",
            "discount": 0,
            "discountType": "percent"
        }
        print(f"POST to: {post_url}")
        print(f"Payload: {payload}")
        
        res = httpx.post(post_url, json=payload, timeout=10)
        print(f"Status: {res.status_code}")
        print(f"Response: {res.text}")
    except Exception as e:
        print(f"Add item failed: {e}")

if __name__ == "__main__":
    test_connection()
    test_add_item()
