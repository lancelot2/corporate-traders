import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

AVATARS_BUCKET = "avatars"


def generate_avatar_image(full_name):
    # TODO: call the chosen image-gen API with `full_name` as (part of) the prompt.
    # Must return raw image bytes (e.g. PNG) and the content type to store them as.
    # Example shape once an API is picked:
    #   response = requests.post(IMAGE_GEN_URL, json={"prompt": f"portrait of {full_name}"}, headers=IMAGE_GEN_HEADERS)
    #   return response.content, "image/png"
    raise NotImplementedError("TODO: wire up an image generation API")


def upload_avatar(insider_id, image_bytes, content_type):
    extension = content_type.split("/")[-1]
    path = f"{insider_id}.{extension}"

    supabase.storage.from_(AVATARS_BUCKET).upload(
        path,
        image_bytes,
        {"content-type": content_type, "upsert": "true"},
    )
    return supabase.storage.from_(AVATARS_BUCKET).get_public_url(path)


def main():
    insiders = (
        supabase.table("insiders")
        .select("id, full_name")
        .is_("avatar_url", "null")
        .execute()
        .data
    )

    generated = 0
    failed = 0

    for insider in insiders:
        insider_id = insider["id"]
        full_name = insider["full_name"]

        try:
            image_bytes, content_type = generate_avatar_image(full_name)
        except Exception as exc:
            print(f"skip {full_name}: image generation failed ({exc})")
            failed += 1
            continue

        avatar_url = upload_avatar(insider_id, image_bytes, content_type)

        supabase.table("insiders").update({"avatar_url": avatar_url}).eq(
            "id", insider_id
        ).execute()

        print(f"avatar set for {full_name}")
        generated += 1

    print(f"=== done: {generated} generated, {failed} failed, {len(insiders)} total pending ===")


if __name__ == "__main__":
    main()
