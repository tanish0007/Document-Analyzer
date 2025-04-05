import io
import pdfplumber
from docx import Document

def extract_text_from_file(filename: str, content: bytes) -> str:
    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "\n".join([page.extract_text() or "" for page in pdf.pages])
    elif filename.endswith(".docx"):
        doc = Document(io.BytesIO(content))
        return "\n".join([para.text for para in doc.paragraphs])
    elif filename.endswith(".txt"):
        return content.decode("utf-8")
    else:
        return "Unsupported file format"