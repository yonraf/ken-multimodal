from flask import Flask, request, jsonify
import requests
import json
import numpy as np
import whisper
from flask_cors import CORS

#4/3-24 : Virker. Eksempel på curl til 5000 
# curl -X POST http://localhost:5000/ask -H "Content-Type: application/json" -d "{\"prompt\": \"Wash a8?\"}"

app = Flask(__name__)

model = whisper.load_model('medium')  # Initialize Whisper or any other speech recognition library

@app.route("/ask", methods=["POST"])
def generate_response():
    #data = request.json
    prompt = request.json.get('prompt')     
    #prompt = data.get('prompt')
    url = "http://localhost:11434/api/generate"

    headers = {"Content-Type": "application/json"}
    data = {
        "model": "ken_llama",
        "prompt": str(prompt),
        "stream": False
    }

    response = requests.post(url, headers=headers, json=data)
    result = json.loads(response.text)["response"]
    
    return result

@app.route('/transcribe', methods=['POST'])
def transcribe():
    
    audio_data = request.files['audio'].read()

    audio_np=  np.frombuffer(audio_data, np.int16).flatten().astype(np.float32) / 32768.0 

#    audio_np = np.frombuffer(audio_data, dtype=np.float32)  # Convert bytes to NumPy array
    transcription = model.transcribe(audio_np)

    print("Trans:", transcription)

    # ollama llm
    url = "http://localhost:11434/api/generate"

    headers = {"Content-Type": "application/json"}
    data = {
        "model": "ken_llama",
        "prompt": transcription['text'],
        "stream": False
    }

    response = requests.post(url, headers=headers, json=data)
    result = json.loads(response.text)["response"]
    return result

if __name__ == '__main__':
    app.run(port=5000)