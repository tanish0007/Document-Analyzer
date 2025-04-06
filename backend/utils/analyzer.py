import re
import spacy
from transformers import pipeline
from textblob import TextBlob

nlp = spacy.load("en_core_web_sm")
summarizer = pipeline("summarization")

def extract_contact_info(text):
    emails = re.findall(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.\w+\b", text)
    phones = re.findall(
        r"\b(?:\+?\(?\d{1,3}\)?[\s.-]?)?(?:\d{10}|\d{5}[\s.-]?\d{5})\b", text
    )

    return {
        "emails": list(set(emails)),
        "phones": list(set(phones))
    }

def detect_profit_or_loss(text):
    profit_keywords = ["profit", "net income", "gain", "surplus", "positive earnings"]
    loss_keywords = ["loss", "deficit", "negative earnings", "expenditure exceeded"]

    profit = any(word in text.lower() for word in profit_keywords)
    loss = any(word in text.lower() for word in loss_keywords)

    if profit and not loss:
        return "profit"
    elif loss and not profit:
        return "loss"
    elif profit and loss:
        return "both"
    else:
        return "unknown"

def analyze_document(text: str):
    if len(text.strip()) == 0:
        return {
            "summary": "", 
            "persons": [], 
            "organizations": [], 
            "contact_info": {}, 
            "sentiment": {}, 
            "financial_status": "unknown"
        }

    # Summarization
    summary = summarizer(text[:1000])[0]["summary_text"] if len(text) > 100 else text

    # Entity Recognition
    doc = nlp(text)
    persons = list(set(ent.text for ent in doc.ents if ent.label_ == "PERSON"))
    orgs = list(set(ent.text for ent in doc.ents if ent.label_ == "ORG"))

    # Sentiment
    sentiment = TextBlob(text).sentiment

    # Profit or Loss
    fin_status = detect_profit_or_loss(text)

    # Contact Info
    contact_info = extract_contact_info(text)

    return {
        "summary": summary,
        "persons": persons,
        "organizations": orgs,
        "contact_info": contact_info,
        "sentiment": {
            "polarity": sentiment.polarity,
            "subjectivity": sentiment.subjectivity
        },
        "financial_status": fin_status
    }