"""
 * Name: app.py
 * Description: Primary entry point for the GreekGather backend.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: [Creation Date]
 * Revised: [Revision Date]
 * Revisions: Refer to Github commits.
 * Preconditions: Flask and dependencies must be installed.
 * Acceptable Inputs: HTTP requests to intended endpoints.
 * Unacceptable Inputs: Incorrect requests.
 * Postconditions: Routes are registered and server starts.
 * Return Values: N/A
 * Errors & Exceptions: Raises errors if database is not connected.
 * Side Effects: Flask app initialized
 * Invariants: Server must remain available.
 * Known Faults: N/A
"""


# Create an API endpoint to check if the backend is working

from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate  # ✅ Ensure Flask-Migrate is imported
from flask_jwt_extended import JWTManager 
from database import db
from models import User, Event, EventMonitor  # ✅ Import all models
from routes.auth_routes import auth_routes  # Add this import
from routes.event_routes import event_routes

app = Flask(__name__)

# Configure CORS
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

# ✅ Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///greekgather.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "your-secret-key"

db.init_app(app)

# ✅ Initialize Flask-Migrate
migrate = Migrate(app, db)

#initialize JWT
jwt = JWTManager(app)

# Register the blueprint
app.register_blueprint(auth_routes, url_prefix='/auth')
app.register_blueprint(event_routes)

@app.route("/")
def home():
    return jsonify({"message": "GreekGather API is running!"})


if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # ✅ Ensure database tables are created
    app.run(debug=True)
