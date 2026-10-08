"""
Database Initialization Script for Online Examination System.
Executes database/schema.sql to build tables and seed initial demo data.
"""

import os
import sqlite3

def init_database():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'exam_system.db')
    schema_path = os.path.join(base_dir, 'schema.sql')

    print(f"[*] Initializing SQLite database at: {db_path}")

    # Remove existing database if present for clean setup
    if os.path.exists(db_path):
        os.remove(db_path)
        print("[-] Removed old database file.")

    conn = sqlite3.connect(db_path)
    with open(schema_path, 'r', encoding='utf-8') as f:
        schema_sql = f.read()

    conn.executescript(schema_sql)

    # Ensure demo student password hash matches the installed Werkzeug version
    try:
        from werkzeug.security import generate_password_hash
        hashed_pw = generate_password_hash('123456')
        conn.execute("UPDATE students SET password_hash = ? WHERE email = ?", (hashed_pw, 'student@gmail.com'))
    except Exception as e:
        print(f"[!] Warning updating password hash: {e}")

    conn.commit()
    conn.close()

    print("[+] Database initialized successfully with tables and seed data!")
    print("[i] Demo Student Login:")
    print("    Email:    student@gmail.com")
    print("    Password: 123456")

if __name__ == '__main__':
    init_database()
