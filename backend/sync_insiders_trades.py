import difflib
import os
import re
from datetime import datetime

import requests
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

CALA_URL = "https://api.cala.ai/v1/knowledge/query"
CALA_HEADERS = {
    "X-API-KEY": os.getenv("CALA_API_KEY"),
    "Content-Type": "application/json"
}

ENTITY_MATCH_CUTOFF = 0.72


def normalize_name(name):
    name = name.lower().strip()
    name = re.sub(r"[.,]", "", name)
    name = re.sub(r"\s+", " ", name)
    return name


def is_placeholder_name(name):
    return not name or name.strip().startswith("(")


def parse_numeric(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return value
    cleaned = re.sub(r"[^0-9.\-]", "", str(value))
    if not cleaned or cleaned in {"-", "."}:
        return None
    try:
        return float(cleaned)
    except ValueError:
        return None


def parse_trade_date(date_str):
    if not date_str:
        return None
    try:
        return datetime.strptime(date_str, "%b %d, %Y").date().isoformat()
    except ValueError:
        return None


def build_entity_lookup(entities):
    lookup = {}
    for entity in entities:
        keys = [entity.get("name", "")] + entity.get("mentions", [])
        for key in keys:
            normalized = normalize_name(key)
            if normalized:
                lookup.setdefault(normalized, entity["id"])
    return lookup


def resolve_cala_entity_id(insider_name, entity_lookup):
    normalized = normalize_name(insider_name)
    if normalized in entity_lookup:
        return entity_lookup[normalized]

    close = difflib.get_close_matches(
        normalized, entity_lookup.keys(), n=1, cutoff=ENTITY_MATCH_CUTOFF
    )
    if close:
        return entity_lookup[close[0]]
    return None


def get_or_create_insider(full_name, cala_entity_id, stats):
    if cala_entity_id:
        existing = (
            supabase.table("insiders")
            .select("id")
            .eq("cala_entity_id", cala_entity_id)
            .limit(1)
            .execute()
            .data
        )
        if existing:
            return existing[0]["id"]

    existing = (
        supabase.table("insiders")
        .select("id")
        .eq("full_name", full_name)
        .limit(1)
        .execute()
        .data
    )
    if existing:
        return existing[0]["id"]

    inserted = (
        supabase.table("insiders")
        .insert({"full_name": full_name, "cala_entity_id": cala_entity_id})
        .execute()
        .data
    )
    stats["insiders_created"] += 1
    return inserted[0]["id"]


def trade_exists(insider_id, organization_id, transaction_date, transaction_type, shares):
    existing = (
        supabase.table("trades")
        .select("id")
        .eq("insider_id", insider_id)
        .eq("organization_id", organization_id)
        .eq("transaction_date", transaction_date)
        .eq("transaction_type", transaction_type)
        .eq("shares", shares)
        .limit(1)
        .execute()
        .data
    )
    return bool(existing)


def sync_organization(org):
    org_id = org["id"]
    org_name = org["name"]
    org_ticker = org["ticker"]

    query = (
        f"{org_ticker}.form4_filings.order_by=date DESC.limit=100."
        "return(insider, title, date, transaction_type, shares, price_per_share, total_value)"
    )
    response = requests.post(CALA_URL, json={"input": query}, headers=CALA_HEADERS)
    data = response.json()

    results = data.get("results", [])
    entities = data.get("entities", [])
    entity_lookup = build_entity_lookup(entities)

    stats = {
        "insiders_created": 0,
        "trades_inserted": 0,
        "skipped_missing_fields": 0,
        "skipped_placeholder_insider": 0,
        "skipped_duplicate": 0,
    }

    for row in results:
        insider_name = row.get("insider")

        if is_placeholder_name(insider_name):
            stats["skipped_placeholder_insider"] += 1
            continue

        transaction_date = parse_trade_date(row.get("date"))
        shares = parse_numeric(row.get("shares"))
        if transaction_date is None or shares is None:
            stats["skipped_missing_fields"] += 1
            continue

        transaction_type = row.get("transaction_type")
        cala_entity_id = resolve_cala_entity_id(insider_name, entity_lookup)
        insider_id = get_or_create_insider(insider_name, cala_entity_id, stats)

        if trade_exists(insider_id, org_id, transaction_date, transaction_type, shares):
            stats["skipped_duplicate"] += 1
            continue

        supabase.table("trades").insert({
            "insider_id": insider_id,
            "organization_id": org_id,
            "transaction_date": transaction_date,
            "transaction_type": transaction_type,
            "shares": shares,
            "price_per_share": parse_numeric(row.get("price_per_share")),
            "total_value": parse_numeric(row.get("total_value")),
        }).execute()
        stats["trades_inserted"] += 1

    print(f"=== {org_name} ({org_ticker}) ===")
    print(
        f"insiders created: {stats['insiders_created']}, "
        f"trades inserted: {stats['trades_inserted']}, "
        f"skipped (missing date/shares): {stats['skipped_missing_fields']}, "
        f"skipped (placeholder insider): {stats['skipped_placeholder_insider']}, "
        f"skipped (already existed): {stats['skipped_duplicate']}"
    )


def main():
    organizations = supabase.table("organizations").select("id, name, ticker").execute().data
    for org in organizations:
        sync_organization(org)


if __name__ == "__main__":
    main()
