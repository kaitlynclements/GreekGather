"""
 * Name: app.py
 * Description: Primary entry point for the GreekGather backend.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github commits.
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
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from database import db
from models import User, Event, EventMonitor
from routes.auth_routes import auth_routes
from routes.event_routes import event_routes
from routes.chapter_routes import chapter_routes

app = Flask(__name__)

# ✅ Apply CORS to the entire app
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# ✅ Database Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///greekgather.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-key"

# ✅ Initialize database and JWT
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# ✅ Register Blueprints (Removed URL prefix for auth_routes)
app.register_blueprint(auth_routes)  # 🚀 Now /get_profile works without /auth prefix
app.register_blueprint(event_routes)
app.register_blueprint(chapter_routes)

@app.route("/")
def home():
    return jsonify({"message": "GreekGather API is running!"})

if __name__ == "__main__":
    app.run(debug=True)  # ✅ Removed db.create_all()
