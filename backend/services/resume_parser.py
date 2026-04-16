import io
import pdfplumber


def extract_text_from_pdf(file):
    file.stream.seek(0)
    file_bytes = file.read()

    if not file_bytes:
        raise ValueError("Uploaded resume is empty or invalid.")

    text = ""
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

    if not text.strip():
        raise ValueError("Unable to extract text from uploaded PDF. Please upload a valid resume.")

    return text.lower()