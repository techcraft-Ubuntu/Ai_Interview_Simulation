from flask import Blueprint, request, jsonify
from services.resume_parser import extract_text_from_pdf
from services.ai_engine import analyze_resume_with_ai

resume_bp = Blueprint("resume", __name__)


@resume_bp.route("/upload", methods=["POST"])
def upload():

    if "resume" not in request.files:
        return jsonify({"success": False, "error": "Resume file missing"}), 400

    try:
        file = request.files["resume"]
        company = request.form.get("company", "General")
        role = request.form.get("role", "General Professional")

        # Extract text from PDF
        text = extract_text_from_pdf(file)

        # Analyze with AI
        ai_result = analyze_resume_with_ai(text, role, company)

        # Wrap in success response with resume text
        response_data = {
            "success": True,
            "data": {
                "resume_text": text,
                **ai_result  # Spread the AI analysis result
            }
        }

        return jsonify(response_data), 200
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500