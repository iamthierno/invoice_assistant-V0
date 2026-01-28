from langchain_core.tools import tool
from ..db_manager import db_manager
import json

@tool
def manage_invoice_db(query: str, params: list = None) -> str:
    """
    Execute a SQL query or stored procedure to manage invoices and items.
    
    Use this for:
    - Creating an invoice: SELECT * FROM create_invoice('Client Name', 'Client Phone', 0, 0);
    - Adding an item: SELECT * FROM add_invoice_item('invoice_id', 'description', quantity, unit_price, tax, 'percent', discount, 'percent');
    - Updating an item: SELECT * FROM update_invoice_item('item_id', 'description', quantity, unit_price, tax, 'percent', discount, 'percent');
    - Deleting an item: SELECT * FROM delete_invoice_item('item_id');
    - Listing invoices: SELECT * FROM list_invoices(limit, offset);
    - Getting details: SELECT * FROM get_invoice_with_items('invoice_id');
    
    Args:
        query: The SQL query to execute.
        params: Optional list of parameters for the query.
    """
    try:
        results = db_manager.execute_query(query, params)
        # Convert to string for the agent
        if not results:
            return "✅ Action effectuée avec succès (aucune donnée retournée)."
        
        # Serialize UUIDs and Decimals if needed (RealDictCursor usually handles this well enough for strings)
        return json.dumps(results, default=str, indent=2)
    except Exception as e:
        return f"❌ Erreur BDD: {str(e)}"
