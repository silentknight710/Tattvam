import google.generativeai as genai
import os
from typing import Dict, Any, Type
from dotenv import load_dotenv
from pydantic import BaseModel
from models import ElectricityBill, FuelInvoice, LogisticsBill

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

def get_schema_for_type(doc_type: str) -> Type[BaseModel]:
    if doc_type == "electricity_bill":
        return ElectricityBill
    elif doc_type == "fuel_invoice":
        return FuelInvoice
    elif doc_type == "logistics_bill":
        return LogisticsBill
    else:
        raise ValueError(f"Unknown document type: {doc_type}")

def parse_with_gemini(raw_text: str, doc_type: str) -> Dict[str, Any]:
    """
    Parses raw OCR text using Gemini 1.5 Flash to extract structured data.
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")

    schema = get_schema_for_type(doc_type)

    model = genai.GenerativeModel('gemini-1.5-flash')

    prompt = f"""
    You are an expert Data Extractor for Indian Industrial Energy documents.
    I will give you raw OCR text from a {doc_type.replace('_', ' ')}.
    
    Your job is to extract the fields defined in the schema below.
    
    Context:
    - This is for an Indian industrial context.
    - Handle terms like 'Lakhs' if present (convert to standard numbers if needed, but schema asks for specific units).
    - Dates might be in DD/MM/YYYY format. Convert them to YYYY-MM-DD.
    - Fix common OCR errors (e.g., 'O' instead of '0', 'l' instead of '1') based on context.
    - If a field is missing or illegible, leave it as null (or default based on schema).
    
    Raw Text:
    {raw_text}
    """

    try:
        # Use generation_config to enforce JSON output adhering to the schema
        result = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=schema
            )
        )
        
        # Parse the JSON response
        import json
        return json.loads(result.text)

    except Exception as e:
        print(f"Error parsing with Gemini: {e}")
        raise e
