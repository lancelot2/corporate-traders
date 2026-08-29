import requests
import os
import json
from dotenv import load_dotenv

load_dotenv()

url = "https://api.cala.ai/v1/knowledge/query"

query = "MSFT.form4_filings.order_by=date DESC.limit=100.return(insider, title, date, transaction_type, shares, price_per_share, total_value)"
payload = { "input": query }
headers = {
    "X-API-KEY": os.getenv("CALA_API_KEY"),
    "Content-Type": "application/json"
}

response = requests.post(url, json=payload, headers=headers)
print(json.dumps(response.json(), indent=2, ensure_ascii=False))
