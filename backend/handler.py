import re
import requests
import json
from util import get_rack_id, get_position_id

ADDRESS = "172.22.120.50"

# Regular expression pattern to match JSON objects
json_pattern = r"\{.*?\}"

def handle_wash(command):
    print("Sending Rack", command['rack_id'], " to wash")

    rack_id = get_rack_id(command['rack_id'])
    if rack_id  != 'rack error':
        url = f"http://{ADDRESS}:3000/createJob?rackId={rack_id}&jobType=1"
        response = requests.post(url)
        if response.status_code != 200:
            return 'Failure'
        return 'Success'
    return 'Failure'

def handle_relocate(command):
    print("Moving rack ", command['rack_id'], " to location ", command['position_id'])
    rack_id = get_rack_id(command['rack_id'])
    position_id = get_position_id(command['position_id'])
    if rack_id != 'rack error' and position_id != 'position error':
        url = f"http://{ADDRESS}:3000/createJob?rackId={rack_id}&jobType=100&dropoffPositionId={position_id}"
        response = requests.post(url)
        if response.status_code != 200:
            return 'Failure'
        return 'Success'
    print("Position id or rack id not found!")
    return 'Failure'

def handle_return(command):
    print("Returning rack ", command['rack_id'])
    rack_id = get_rack_id(command['rack_id'])
    if rack_id != 'rack error':
        url = f"http://{ADDRESS}:3000/createJob?rackId={rack_id}&jobType=7"
        response = requests.post(url)
        if response.status_code != 200:
            return 'Failure'
        return "Success"
    return 'Failure' 

def handle_safe(command):
    print("Moving Robot ", command['robot_id'], " to safe position")

def handle_cancel(command):
    rack_id = get_rack_id(command['rack_id'])
    if rack_id != 'rack error':
        print("Aborting job with rack ", command['rack_id'])
        return 'Succes'
    return 'Failure'

def handle_none(command):
    print("No task identified in input")

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
    match = re.search(json_pattern, command_str)
    if match:
        command_json = match.group(0).lower()
        command = json.loads(command_json)
        use_case = command.get('use_case')
        handler = command_handlers.get(use_case)
        if use_case == 'none':
            return 'error', command_json
        if handler:
            action = handler(command)
            if action == 'Failure':
                return 'error', command_json
            return 'Success', command_json
        else:
            print("No handler found for command:", use_case)
            return 'error', 'none'
    else:
        print("No valid JSON object found in LLM response")
        return 'error', 'none'
