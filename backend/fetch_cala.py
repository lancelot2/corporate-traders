import requests
import os
import json
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

url = "https://api.cala.ai/v1/knowledge/query"
headers = {
    "X-API-KEY": os.getenv("CALA_API_KEY"),
    "Content-Type": "application/json"
}

organizations = supabase.table("organizations").select("name").execute().data

for org in organizations:
    name = org["name"]
    query = f"{name}.form4_filings.order_by=date DESC.limit=100.return(insider, title, date, transaction_type, shares, price_per_share, total_value)"
    payload = { "input": query }

    response = requests.post(url, json=payload, headers=headers)
    print(f"=== {name} ===")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
