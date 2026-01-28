import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from config import PGUSER, PGPASSWORD, PGHOST, PGPORT, PGDATABASE

logger = logging.getLogger(__name__)

class DBManager:
    def __init__(self):
        self.conn_params = {
            "user": PGUSER,
            "password": PGPASSWORD,
            "host": PGHOST,
            "port": PGPORT,
            "database": PGDATABASE
        }

    def execute_query(self, query, params=None):
        """Execute a query and return results as a list of dicts."""
        conn = None
        try:
            conn = psycopg2.connect(**self.conn_params)
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(query, params)
                if query.strip().upper().startswith(("SELECT", "INSERT", "UPDATE", "DELETE", "CALL")):
                    try:
                        results = cur.fetchall()
                        conn.commit()
                        return results
                    except psycopg2.ProgrammingError:
                        # No results to fetch (e.g. DELETE/UPDATE without RETURNING)
                        conn.commit()
                        return []
                conn.commit()
                return []
        except Exception as e:
            logger.error(f"Database error: {e}")
            if conn:
                conn.rollback()
            raise e
        finally:
            if conn:
                conn.close()

    def call_procedure(self, proc_name, params=None):
        """Helper to call a stored procedure."""
        placeholder = ",".join(["%s"] * len(params)) if params else ""
        query = f"SELECT * FROM {proc_name}({placeholder});"
        return self.execute_query(query, params)

db_manager = DBManager()
