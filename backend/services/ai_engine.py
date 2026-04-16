import os
import json
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY not set")

client = Groq(api_key=api_key)
MODEL_NAME = "llama-3.1-8b-instant"


# -----------------------------
# JSON Extraction Helper
# -----------------------------
def extract_json_from_text(text):
    try:
        cleaned_text = text.replace("```json", "").replace("```", "").strip()
        match = re.search(r"\{[\s\S]*\}", cleaned_text)
        if match:
            return json.loads(match.group(0))

        raise ValueError("No JSON object found")
    except Exception as e:
        print("JSON extraction failed:", e)
        print("Raw output:", text)
        raise


def build_default_analysis(role, company):
    return {
        "selected_role": role,
        "detected_stack": {
            "primary_language": "",
            "frameworks": [],
            "databases": [],
            "tools": []
        },
        "overall_match_score": 0,
        "recommended_companies": [],
        "suggested_application_companies": [],
        "role_fit_breakdown": {
            "technical_skills": 0,
            "project_relevance": 0,
            "stack_alignment": 0,
            "experience_depth": 0
        },
        "resume_section_analysis": {
            "education_score": 0,
            "projects_score": 0,
            "skills_section_score": 0,
            "experience_score": 0,
            "certifications_score": 0,
            "resume_structure_score": 0,
            "keyword_optimization_score": 0,
            "project_impact_quality": ""
        },
        "strengths": [],
        "missing_skills": [],
        "resume_improvements": [],
        "interview_focus": [],
        "recommended_projects": []
    }


# -----------------------------
# Main AI Resume Analysis
# -----------------------------
def analyze_resume_with_ai(resume_text, role, company):
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text could not be extracted from the file.")

    # -------- Company Bias --------
    if company == "Google":
        company_bias = """
        Emphasize:
        - Data Structures & Algorithms
        - System Design
        - Scalability
        - Cloud Architecture
        """
    elif company == "Infosys":
        company_bias = """
        Emphasize:
        - Core CS fundamentals
        - Java/Spring ecosystem
        - SQL proficiency
        - Clean coding practices
        """
    elif company == "Startup":
        company_bias = """
        Emphasize:
        - Full stack versatility
        - Rapid development
        - Ownership mentality
        - Product thinking
        """
    else:
        company_bias = "General industry standards."

    # -------- AI Prompt --------
    prompt = f"""
You are an advanced ATS system.

STRICT RULES:
- Output ONLY valid JSON.
- No explanation.
- No markdown.
- No text before or after JSON.

User Selected Role: {role}

Tasks:

1. Use the selected role as final role.
2. Score the resume strictly against the selected role.
3. Recommend companies based on:
   - Selected role
   - Tech stack in resume
   - Skill maturity
4. Do NOT always suggest Google, Amazon, Microsoft.
5. Vary companies depending on role and stack.
6. Suggested companies must be realistic and role-specific.

Return JSON format EXACTLY:

{{
  "selected_role": "",

  "detected_stack": {{
      "primary_language": "",
      "frameworks": [],
      "databases": [],
      "tools": []
  }},

  "overall_match_score": 0,

  "recommended_companies": [],

  "suggested_application_companies": [
    {{
      "name": "",
      "reason": ""
    }}
  ],

  "role_fit_breakdown": {{
      "technical_skills": 0,
      "project_relevance": 0,
      "stack_alignment": 0,
      "experience_depth": 0
  }},

  "resume_section_analysis": {{
      "education_score": 0,
      "projects_score": 0,
      "skills_section_score": 0,
      "experience_score": 0,
      "certifications_score": 0,
      "resume_structure_score": 0,
      "keyword_optimization_score": 0,
      "project_impact_quality": ""
  }},

  "strengths": [],
  "missing_skills": [],
  "resume_improvements": [],
  "interview_focus": [],
  "recommended_projects": []
}}

Company Focus:
{company_bias}

Resume:
\"\"\"
{resume_text}
\"\"\"
"""

    # -------- API Call --------
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1500
        )
        content = response.choices[0].message.content.strip()
        return extract_json_from_text(content)
    except Exception as initial_error:
        print("AI resume analysis first pass failed:", initial_error)

    retry_prompt = prompt + "\n\nIMPORTANT: Return only the JSON object and nothing else."
    try:
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": retry_prompt}],
            temperature=0.2,
            max_tokens=1500
        )
        fallback_content = response.choices[0].message.content.strip()
        return extract_json_from_text(fallback_content)
    except Exception as retry_error:
        print("AI resume analysis retry failed:", retry_error)
        print("Fallback raw output:", fallback_content if 'fallback_content' in locals() else 'No fallback content')
        return build_default_analysis(role, company)