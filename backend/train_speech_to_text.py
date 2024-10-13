import librosa 
import openvino as ov
from transformers import AutoProcessor, AutoModelForSpeechSeq2Seq, Trainer, TrainingArguments


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
    return y, sr
    print(y)
    print(sr)
    
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


sample = "audio_files/audio sample.wav"
audio_array, sampling_rate = convert_wav_to_array(sample)

print("DONE CONVERTING")
input_features = extract_input_features(audio_array, sampling_rate=sampling_rate) 

predicted_ids = pt_model.generate(input_features)
transcription = processor.batch_decode(predicted_ids, skip_special_tokens=True)

print(f"Result: {transcription[0]}")
