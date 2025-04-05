import spacy
from transformers import pipeline
from textblob import TextBlob

nlp = spacy.load("en_core_web_sm")
summarizer = pipeline("summarization")

def analyze_document(text: str):
    if len(text.strip()) == 0:
        return {"summary": "", "persons": [], "sentiment": {}}

    # Summarize only first 1000 tokens
    summary = summarizer(text[:1000])[0]["summary_text"] if len(text) > 100 else text

    # Extract people/entities
    doc = nlp(text)
    persons = list(set(ent.text for ent in doc.ents if ent.label_ == "PERSON"))

    # Sentiment
    sentiment = TextBlob(text).sentiment

    return {
        "summary": summary,
        "persons": persons,
        "sentiment": {
            "polarity": sentiment.polarity,
            "subjectivity": sentiment.subjectivity
        }
    }