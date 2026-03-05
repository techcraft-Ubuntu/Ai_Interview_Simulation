from flask import Blueprint, request, jsonify
from services.resume_parser import extract_text_from_pdf
from services.ai_engine import analyze_resume_with_ai

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/analyze", methods=["POST"])
def analyze():

    if "resume" not in request.files:
        return jsonify({"error": "Resume file missing"}), 400

    file = request.files["resume"]
    company = request.form.get("company")
    role = request.form.get("role")

    text = extract_text_from_pdf(file)

    ai_result = analyze_resume_with_ai(text, role, company)

    return jsonify(ai_result)