from flask import Flask, request
import requests
import json
from flask_cors import CORS
from faster_whisper import WhisperModel
import re


app = Flask(__name__)
CORS(app)
#model = whisper.load_model('small').to(device)  # Initialize Whisper or any other speech recognition library
model = WhisperModel('small', compute_type="int8")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    # Get the audio file from the request
    audio_file = request.files['audio']
    
    audio_file.save('audio_received.wav')
    print('Transcribing...\n')
    segments, info = model.transcribe('audio_received.wav', beam_size=5)
    seg = list(segments)
    transcription = seg[0].text
    print('Trans:\n', transcription)

    # ollama llm
    url = "http://localhost:11434/api/generate"
    headers = {"Content-Type": "application/json"}
    data = {
        "model": "ken_llama",
        "prompt": transcription,
        "stream": False
    }
    print('Sent to Ollama...\n')
    response = requests.post(url, headers=headers, json=data)
    result = json.loads(response.text)["response"]
    print('Response from Ollama:\n',result)
    handle_command(result)
    return result

# ----- COMMAND HANDLER -----

# Regular expression pattern to match command structures
pattern = r"\((\w+), (\w+)(?:, (\w+))?\)"

def handle_wash(command):
    print("Sending Rack", command[1]," to wash")
    #url = f"http://172.22.102.39:3000/createJob?rackId={rack_id}&jobType=1"    
    #response = request.post(url)

def handle_move(command):
    print("Moving rack ", command[1], " to location ", command[2])
    
    # need to convert both rack_id and position_id
    #url = f"http://172.22.102.39:3000/createJob?rackId={rack_id}&jobType=100&dropoffPositionId={position_id}"
    #response = request.post(url)

def handle_return(command):
    print("Returning rack ", command[1])
    # FETCH ID OF RACK
    #url = f"http://172.22.102.39:3000/createJob?rackId={rack_id}&jobType=7"    
    #response = request.post(url)

def handle_safe(command):
    print("Moving Robot ", command[1]," to safe position")

def handle_cancel(command):
    print("Aborting job with rack ", command[1])

def handle_none(command):
    print("It does not seem like you intend to perform a task")

# Dictionary mapping command types to handler functions
command_handlers = {
    "wash": handle_wash,
    "move": handle_move,
    "return": handle_return,
    "safe": handle_safe,
    "cancel": handle_cancel,
    "none": handle_none
}

def handle_command(command):
    # Find command in the input string
    match = re.search(pattern, command.lower())

    if match:
        command = match.groups()
        action = command[0]
        handler = command_handlers.get(action)
        if handler:
            handler(command)
        else:
            print("No handler found for command:", action)
    else:
        print("No valid command found in the input string.")
    
if __name__ == '__main__':
    app.run(port=5000)