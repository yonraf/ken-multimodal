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

# ----- JSON FUNCT -----
f = open('ids.json')
data = json.load(f)

def get_rack_id(name):
    for rack in data["racks"]:
        for key, value in rack.items():
            if key == name:
                return value
    return None

def get_position_id(name):
    for rack in data["positions"]:
        for key, value in rack.items():
            if key == name:
                return value
    return None


# ----- COMMAND HANDLER -----

# Regular expression pattern to match command structures
pattern = r"\((\w+), (\w+)(?:, (\w+))?\)"

def handle_wash(command):
    print("Sending Rack", command[1]," to wash")

    rack_id = get_rack_id(command[1])
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=1"    
    response = request.post(url)
    print(response)

def handle_move(command):
    print("Moving rack ", command[1], " to location ", command[2])
    
    rack_id = get_rack_id(command[1])
    position_id = get_position_id(command[2])
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=100&dropoffPositionId={position_id}"
    response = request.post(url)
    print(response)

def handle_return(command):
    print("Returning rack ", command[1])

    rack_id = get_rack_id(command[1])
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=7"    
    response = request.post(url)

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