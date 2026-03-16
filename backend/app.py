from flask import Flask
from flask_cors import CORS
from routes.resume_routes import resume_bp
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend Running Successfully"

# Register routes with URL prefix
app.register_blueprint(resume_bp, url_prefix='/api/resume')

if __name__ == "__main__":
    app.run(debug=True)