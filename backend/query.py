from app import create_app, db
from app.models.login import login
app = create_app()
with app.app_context():
    users = login.query.all()
    for u in users:
        print(f"Email: {repr(u.email)}, Password: {repr(u.password)}")
