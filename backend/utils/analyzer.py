import re
import spacy
import pandas as pd
from io import StringIO
from textblob import TextBlob
from transformers import pipeline

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

def extract_statistical_insights(text):
    lines = [line.strip() for line in text.strip().splitlines() if re.search(r"\d", line)]
    if len(lines) < 2:
        return []

    # Find the header line (assumed to be the one before first numeric line)
    header_line = None
    for i in range(len(lines)):
        if re.search(r"^\d{4}", lines[i]):
            header_line = lines[i - 1] if i > 0 else None
            lines = lines[i:]
            break

    if not header_line:
        return []

    header = re.split(r"\s{2,}", header_line)
    data_rows = []
    for line in lines:
        cols = re.split(r"\s{2,}", line)
        if len(cols) == len(header):
            data_rows.append(cols)

    if not data_rows:
        return []

    # Create DataFrame
    df = pd.DataFrame(data_rows, columns=header)

    insights = []
    time_col = df.columns[0]

    for col in df.columns[1:]:
        try:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            if df[col].isna().all():
                continue

            trend = df[col].diff()
            increase = trend.gt(0).sum()
            decrease = trend.lt(0).sum()
            constant = trend.eq(0).sum()

            if increase and not decrease:
                insights.append(f"{col} increased consistently.")
            elif decrease and not increase:
                insights.append(f"{col} decreased consistently.")
            elif increase and decrease:
                insights.append(f"{col} fluctuated with {increase} increases and {decrease} decreases.")
            elif constant:
                insights.append(f"{col} remained constant.")

            max_val = df[col].max()
            max_year = df.loc[df[col].idxmax(), time_col]
            min_val = df[col].min()
            min_year = df.loc[df[col].idxmin(), time_col]
            insights.append(f"{col} was highest in {max_year} ({max_val}) and lowest in {min_year} ({min_val}).")
        except Exception:
            continue

    return insights


def analyze_document(text: str):
    if len(text.strip()) == 0:
        return {
            "summary": "", 
            "persons": [], 
            "organizations": [], 
            "contact_info": {}, 
            "sentiment": {}, 
            "statistical_insights": [],
            "financial_status": ""
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

    # Statistical Insights
    stats = extract_statistical_insights(text)

    return {
        "summary": summary,
        "persons": persons,
        "organizations": orgs,
        "contact_info": contact_info,
        "sentiment": {
            "polarity": sentiment.polarity,
            "subjectivity": sentiment.subjectivity
        },
        "financial_status": fin_status,
        "statistical_insights": stats
    }