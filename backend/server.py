from flask import Flask, request
import requests
import json
from flask_cors import CORS
from faster_whisper import WhisperModel
from handler import handle_command


app = Flask(__name__)
CORS(app)
#model = whisper.load_model('small').to(device)  # Initialize Whisper or any other speech recognition library
model = WhisperModel('small', compute_type="int8")

@app.route('/process', methods=['POST'])
def handle_request():
    audio_file = request.files['audio']
    audio_file.save('audio_received.wav')

    transcription = transcribe()
    response = message(transcription)

    handle_command(response)

    return "Success", 200, {"Access-Control-Allow-Origin": "*"}


def transcribe():
    # Get the audio file from the request
    print('Transcribing...\n')
    segments, info = model.transcribe('audio_received.wav', beam_size=5)
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


if __name__ == '__main__':
    app.run(port=5000)