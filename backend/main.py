from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from utils.extract_text import extract_text_from_file
from utils.analyzer import analyze_document  # ✅ Make sure it's importing from the updated analyzer

app = FastAPI()

# Enable CORS for frontend dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze/")
async def analyze(file: UploadFile = File(...), type: str = Form("basic")):
    content = await file.read()
    text = extract_text_from_file(file.filename, content)

    # You can later handle type if you support different analysis modes
    result = analyze_document(text)
    return result
