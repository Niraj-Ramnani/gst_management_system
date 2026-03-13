import re

tests = [
    "CGST @ 6%: 0.00",
    "CGST @ 18% : 1,200.50",
    "CGST : 1,200.50",
    "CGST Rs. 1200.50",
    "CGST 18% 1200.50",
    "SGST @ 6%:    0.00",
    "IGST 12% Rs 4,500.00"
]

pattern = re.compile(r"(?:cgst|sgst|igst)(?:[^₹\d\n]*\d+(?:\.\d+)?\s*%)?[^₹\d]*([\d,]+\.?\d*)", re.IGNORECASE)

for t in tests:
    m = pattern.search(t)
    if m:
        print(f"'{t}' -> {m.group(1)}")
    else:
        print(f"'{t}' -> NO MATCH")
