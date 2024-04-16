import re
import requests
import json
from util import get_rack_id, get_position_id

# Regular expression pattern to match JSON objects
json_pattern = r"\{.*?\}"

def handle_wash(command):
    print("Sending Rack", command['rack_id'], " to wash")

    rack_id = get_rack_id(command['rack_id'])
    
    print("rack_id: ",rack_id)
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=1"
    response = requests.post(url)
    print(response)
    return "Success"
    

def handle_relocate(command):
    print("Moving rack ", command['rack_id'], " to location ", command['position_id'])
    
    rack_id = get_rack_id(command['rack_id'])
    position_id = get_position_id(command['position_id'])
        
    print("rack_id: ",rack_id)
    print("pos_id ", position_id)
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=100&dropoffPositionId={position_id}"
    response = requests.post(url)
    print(response)
    return "Success"

def handle_return(command):
    print("Returning rack ", command['rack_id'])
    rack_id = get_rack_id(command['rack_id'])
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=7"
    response = requests.post(url)
    print(response)
    return "Success"

def handle_safe(command):
    print("Moving Robot ", command['robot_id'], " to safe position")

def handle_cancel(command):
    print("Aborting job with rack ", command['rack_id'])

def handle_none(command):
    print("It does not seem like you intend to perform a task")

# Dictionary mapping command types to handler functions
command_handlers = {
    "wash": handle_wash,
    "relocate": handle_relocate,
    "return": handle_return,
    "safe": handle_safe,
    "cancel": handle_cancel,
    "none": handle_none
}

def handle_command(command_str):
    # Find JSON object in the input string
    match = re.search(json_pattern, command_str)
    if match:
        command_json = match.group(0)
        command = json.loads(command_json.lower())
        use_case = command.get('use_case')
        handler = command_handlers.get(use_case)
        if use_case == 'none':
            return 'error'
        if handler:
            handler(command)
            return 'Success'
        else:
            print("No handler found for command:", use_case)
            return 'error'
    else:
        print("No valid JSON object found in the input string.")
        return 'error'
