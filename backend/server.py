from flask import Flask, request, render_template, send_from_directory
import requests
import json
from flask_cors import CORS, cross_origin
from faster_whisper import WhisperModel
from handler import handle_command
from flask_socketio import SocketIO
import os

app = Flask(__name__)
CORS(app)

app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

model = WhisperModel('large-v3', compute_type="float32")

@app.route('/')
def index():
    return render_template("index.html")

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

        if (len(transcription) < 5):
            socketio.emit('state','error')
            return "Internal Server Error", 500, {"Access-Control-Allow-Origin": "*"}

        socketio.emit('state', "processing")
        response = message(transcription)
        
        socketio.emit('state', "recognising")
        command, llm_output = handle_command(response)

        # Comment out to enable saving of audio files and log trancription and LLM-response
        #handle_test(transcription, llm_output)
        
        if command == 'error':
            socketio.emit('state','error')
            return "Internal Server Error", 500, {"Access-Control-Allow-Origin": "*"}
        
        socketio.emit('state', "completed")
        return "Success", 200, {"Access-Control-Allow-Origin": "*"}
    
    except:
        socketio.emit('state', "error")
        return "Internal Server Error", 500, {"Access-Control-Allow-Origin": "*"}



def transcribe():
    segments, info = model.transcribe('audio_received.wav', beam_size=5, language='en')
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
        "stream": False,
        "keep_alive": -1
    }
    response = requests.post(url, headers=headers, json=data)
    result = json.loads(response.text)["response"]
    print('Response from Ollama:\n',result)
    return result

'''
def handle_test(transcription, command):
    f = open("log/server_log.txt", "a")
    audio_id = len([filename for filename in os.listdir("log/audio") if filename.endswith(".wav")])
    #audio_id = str()
    copy_and_rename_file("audio_received.wav", f"log/audio/{audio_id}.wav")
    f.write(f"test - ID: {audio_id}\n")
    f.write(f"Trans : {transcription}\n")
    f.write(f"LLM : {command} \n")
    f.write("________ \n")
    f.close()
    
def copy_and_rename_file(src, dst):
    try:
        with open(src, 'rb') as fsrc:
            with open(dst, 'wb') as fdst:
                fdst.write(fsrc.read())
        print(f"File '{src}' copied and renamed to '{dst}' successfully.")
    except FileNotFoundError:
        print(f"Error: File '{src}' not found.")
    except PermissionError:
        print(f"Error: Permission denied to copy '{src}'.")
    except Exception as e:
        print(f"Error occurred: {e}")
'''

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

print(__name__)

if __name__ == '__main__':
    socketio.run(app,host='0.0.0.0', port=5000, debug=True)