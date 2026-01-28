import psycopg2
import os
from config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME

def refresh_db():
    print(f"Refreshing DB {DB_NAME} at {DB_HOST}...")
    conn = None
    try:
        conn = psycopg2.connect(
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME
        )
        with conn.cursor() as cur:
            # Read init.sql from backend
            sql_path = os.path.join("..", "backend", "src", "models", "init.sql")
            with open(sql_path, "r", encoding="utf-8") as f:
                sql = f.read()
            
            cur.execute(sql)
            conn.commit()
            print("✅ Database refreshed successfully.")
    except Exception as e:
        print(f"❌ Error: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    refresh_db()
