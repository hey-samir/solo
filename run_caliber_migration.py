
from migrations.versions.add_caliber_column import upgrade
from app import app

with app.app_context():
    upgrade()
    print("Caliber column migration completed!")
