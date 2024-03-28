import os
import requests
import json
from flask import Flask
import requests
import json
from flask_cors import CORS
from faster_whisper import WhisperModel

app = Flask(__name__)
CORS(app)

model = WhisperModel('small', compute_type="int8")

def transcribe(filename):
    # Get the audio file from the request
    print('Transcribing...\n')
    segments, info = model.transcribe("C:/Users/Yonus/Documents/Dev Projects/ken-multimodal/test/audio files/"+filename, beam_size=5)
    seg = list(segments)
    transcription = seg[0].text
    print('Trans:\n', transcription)
    return transcription

def message(text):
    # ollama llm
    url = "http://localhost:11434/api/generate"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "ken_llama",
        "prompt": text,
        "stream": False
    }
    print('Sent to Ollama...\n')
    response = requests.post(url, headers=headers, json=data)
    result = json.loads(response.text)["response"]
    print('Response from Ollama:\n',result)
    return result

def process_audio_files(folder_path, output_file):
    with open(output_file, 'w') as f_out:
        for filename in os.listdir(folder_path):
            if filename.endswith('.wav'):
                audio_name = os.path.splitext(filename)[0]
                print(f"Test - {audio_name}:\n", file=f_out)
                
                # Transcribe the audio
                transcription = transcribe(filename)
                print('Trans:', transcription, file=f_out)
                
                # Process with LLM
                result = message(transcription)
                print('LLM:', result, file=f_out)
                
                print("___________\n", file=f_out)  # Add newline for next test
                
    print("Test results written to", output_file)

if __name__ == '__main__':
    folder_path = "./audio files"
    output_file = "test_results.txt"
    process_audio_files(folder_path, output_file)
