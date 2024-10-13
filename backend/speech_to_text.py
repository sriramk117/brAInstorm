import librosa 
import openvino as ov
import scipy
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq
import numpy as np
import base64

model_ids = {
    "Distil-Whisper": [
        "distil-whisper/distil-large-v2",
        "distil-whisper/distil-large-v3",
        "distil-whisper/distil-medium.en",
        "distil-whisper/distil-small.en",
    ],
    "Whisper": [
        "openai/whisper-large-v3-turbo" "openai/whisper-large-v3",
        "openai/whisper-large-v2",
        "openai/whisper-large",
        "openai/whisper-medium",
        "openai/whisper-small",
        "openai/whisper-base",
        "openai/whisper-tiny",
        "openai/whisper-medium.en",
        "openai/whisper-small.en",
        "openai/whisper-base.en",
        "openai/whisper-tiny.en",
    ],  
}


def convert_wav_to_array(wav_path):
    y, sr = librosa.load(wav_path, sr=16000)
    return y
    
def extract_input_features(audio_array, sampling_rate):
    input_features = processor(
        audio_array,
        sampling_rate=sampling_rate,
        return_tensors="pt",
    ).input_features
    return input_features    

model_id = "distil-whisper/distil-small.en"
processor = AutoProcessor.from_pretrained(model_id)
pt_model = AutoModelForSpeechSeq2Seq.from_pretrained(model_id)

#use the ov model instead
core = ov.Core()
# ov_model = core.read_model("openvino_encoder_model.xml")


file_path = 'audio.txt'

# Read the base64-encoded audio from the text file
with open(file_path, 'r') as file:
    audio = file.read()
print(len(audio))
length = len(audio.strip())
new_length = length - (length % 4)
shortened_audio = audio[:new_length]
audio = shortened_audio
print(len(audio))
# Decode the base64 audio
b2_audio = base64.b64decode(audio.strip(), ' /')  # Use .strip() to remove any extra whitespace/newline

# Write the decoded audio to a .wav file
with open('out.wav', 'wb') as f:
    f.write(b2_audio)
audio = convert_wav_to_array(audio)


# print("DONE CONVERTING")
input_features = extract_input_features(audio, sampling_rate=16000) 

predicted_ids = pt_model.generate(input_features)
transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

print(f"Result: {transcription[0]}")

