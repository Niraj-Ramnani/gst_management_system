import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ml.invoice_parser.ocr_pipeline import extract_text_mock
from app.ml.invoice_parser.parser import _extract_fields_from_text
from app.ml.invoice_parser.extractor import extract_fields_from_text as ext_fields

def main():
    mock_text = extract_text_mock("dummy_invoice.pdf")
    
    p_fields = _extract_fields_from_text(mock_text)
    e_fields = ext_fields(mock_text)
    
    res = {
        "text": mock_text,
        "parser_py": p_fields,
        "extractor_py": e_fields
    }
    with open("test_out.json", "w", encoding="utf-8") as f:
        json.dump(res, f, indent=2)

if __name__ == "__main__":
    main()
