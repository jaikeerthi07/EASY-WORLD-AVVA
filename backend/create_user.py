from app import create_app, db
from app.models.login import login
import uuid

app = create_app()
with app.app_context():
    # Insert jaikeerthi156@gmail.com
    existing = login.query.filter_by(email="jaikeerthi156@gmail.com").first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
    
    new_user = login(
        email="jaikeerthi156@gmail.com",
        username="jaikeerthi",
        password="jaikeerthi01"
    )
    db.session.add(new_user)
    db.session.commit()
    print("NEW USER CREATED:")
    print("Email: jaikeerthi156@gmail.com")
    print("Password: jaikeerthi01")
