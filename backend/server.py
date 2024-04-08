from flask import Flask, request, render_template, send_from_directory
import requests
import json
from flask_cors import CORS
from faster_whisper import WhisperModel
from handler import handle_command
from flask_socketio import SocketIO 
import time

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

model = WhisperModel('small', compute_type="int8")

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/index2')
def index2():
    return render_template("index_2.html")

@app.route('/files/<path:filename>')
def serve_file(filename):
    directory = 'static/tm-my-audio-model/'

    return send_from_directory(directory, filename)

@app.route('/process', methods=['POST'])
def handle_request():
    try:
        audio_file = request.files['audio']
        audio_file.save('audio_received.wav')
        socketio.emit('state', "transcribing")
        transcription = transcribe()

        socketio.emit('state', "processing")
        response = message(transcription)
        
        socketio.emit('state', "recognising")
        command = handle_command(response)

        if command == 'error':
            socketio.emit('state','error')
            return "Internal Server Error", 500, {"Access-Control-Allow-Origin": "*"}
        
        socketio.emit('state', "completed")
        return "Success", 200, {"Access-Control-Allow-Origin": "*"}
    
    except:
        socketio.emit('state', "error")
        return "Internal Server Error", 500, {"Access-Control-Allow-Origin": "*"}



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
        "model": "ken_openchat",
        "prompt": text,
        "stream": False
    }
    print('Sent to Ollama...\n')
    response = requests.post(url, headers=headers, json=data)
    result = json.loads(response.text)["response"]
    print('Response from Ollama:\n',result)
    return result


@socketio.on('connect')
def handle_connect():
    #socketio.emit('client', 'connected')
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, port=5000)
