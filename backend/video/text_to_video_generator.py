import os
from huggingface_hub import InferenceClient

from utils.EnvironmentKeys import EnvironmentKeys


#This modal is being used = https://huggingface.co/Lightricks/LTX-Video-0.9.7-distilled
def generate_video_by_text():
    client = InferenceClient(
        provider="fal-ai",
        api_key=os.getenv(EnvironmentKeys.HF_TOKEN.value),
    )

    video = client.text_to_video(
        "A young man walking on the street",
        model="Lightricks/LTX-Video-0.9.7-distilled",
    )
    return video