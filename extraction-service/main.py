from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
import uvicorn
import pdfplumber
import pytesseract
from PIL import Image
import io
import os
from gemini_utils import parse_with_gemini

app = FastAPI(title="CarbonOS Extraction Service")

EXTRACTION_API_KEY = os.getenv("EXTRACTION_API_KEY")

async def verify_api_key(x_api_key: str = Header(...)):
    if not EXTRACTION_API_KEY:
        raise HTTPException(status_code=500, detail="Server not configured with an API key")
    if x_api_key != EXTRACTION_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
    return text

def extract_text_from_image(file_bytes: bytes) -> str:
    try:
        image = Image.open(io.BytesIO(file_bytes))
        # Note: Tesseract must be installed on the system
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error extracting image text: {e}")
        return ""

@app.post("/extract")
async def extract_data(
    file: UploadFile = File(...),
    doc_type: str = Form(...),
    _: None = Depends(verify_api_key),
):
    """
    Extracts data from a document (PDF or Image) based on the doc_type.
    """
    if doc_type not in ["electricity_bill", "fuel_invoice", "logistics_bill"]:
        raise HTTPException(status_code=400, detail="Invalid doc_type")

    try:
        contents = await file.read()
        raw_text = ""

        # Determine extraction method based on content type
        if file.content_type == "application/pdf":
            raw_text = extract_text_from_pdf(contents)
            # Fallback for scanned PDFs could be added here (pdf2image + tesseract)
            if not raw_text.strip():
                 # Simple heuristic: if pdfplumber gets nothing, it might be a scanned PDF.
                 # For now, we return a warning or try to handle it if we add pdf2image dependency.
                 pass 

        elif file.content_type.startswith("image/"):
            raw_text = extract_text_from_image(contents)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF or Image.")

        if not raw_text.strip():
             raise HTTPException(status_code=400, detail="Could not extract text from file. It might be empty or a scanned PDF depending on installed tools.")

        # Pass to Gemini for Intelligence
        extracted_data = parse_with_gemini(raw_text, doc_type)
        
        return JSONResponse(content={"status": "success", "data": extracted_data})

    except Exception as e:
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
