import sys
import subprocess
from app import db
from app.models import Users
from run import create_app

app = create_app()

def run_upgrade():
    print("[init_db.py] Ejecutando upgrade...")
    subprocess.run([sys.executable, '-m', 'flask', 'db', 'upgrade'], check=True)
    print("[init_db.py] Upgrade completado.")

def ensure_admin():
    with app.app_context():
        admin = db.session.execute(db.select(Users).where(Users.role == 'admin')).scalar()
        if admin:
            print(f"[init_db.py] Admin ya existe: {admin.email}")
            return
        print("[init_db.py] Creando usuario admin por defecto...")
        user = Users(
            email="admin@example.com",
            name="Admin",
            last_name="User",
            phone="0000000000",
            role="admin",
            is_active=True,
        )
        user.set_password("admin123")
        db.session.add(user)
        db.session.commit()
        print("[init_db.py] Usuario admin creado.")

if __name__ == "__main__":
    print("[init_db.py] Inicio de inicialización...")
    run_upgrade()
    ensure_admin()
    print("[init_db.py] Inicialización finalizada.")