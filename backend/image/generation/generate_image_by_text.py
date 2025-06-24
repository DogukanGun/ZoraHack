import os
import base64
from openai import OpenAI

from utils.EnvironmentKeys import EnvironmentKeys


def generate_image_by_text(text: str) -> bytes | None:
    client = OpenAI(
        api_key=os.getenv(EnvironmentKeys.OPENAI_KEY.value),
    )

    try:
        response = client.responses.create(
            model="gpt-4.1-mini",
            input=text,
            tools=[{"type": "image_generation"}],
        )

        image_data = [
            output.result
            for output in response.output
            if output.type == "image_generation_call"
        ]

        if image_data and isinstance(image_data[0], str):
            # image_data[0] is expected to be base64-encoded
            return base64.b64decode(image_data[0])
        else:
            print("No image data returned or wrong type")
            return None

    except Exception as e:
        print(f"Error in OpenAI image generation: {e}")
        import traceback
        traceback.print_exc()
        return None