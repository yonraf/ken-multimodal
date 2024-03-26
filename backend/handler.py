import requests
from util import get_rack_id, get_position_id
import re

# Regular expression pattern to match command structures
pattern = r"\((\w+), (\w+)(?:, (\w+))?\)"

def handle_wash(command):
    print("Sending Rack", command[1]," to wash")

    rack_id = get_rack_id(command[1])
    if rack_id != None:
        url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=1"    
        response = requests.post(url)
        print(response)
        return "Success"
    return "Failure"
    

def handle_move(command):
    print("Moving rack ", command[1], " to location ", command[2])
    if rack_id is not None or position_id is not None:
        rack_id = get_rack_id(command[1])
        position_id = get_position_id(command[2])
        url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=100&dropoffPositionId={position_id}"
        response = requests.post(url)
        return "Success"

def handle_return(command):
    print("Returning rack ", command[1])

    rack_id = get_rack_id(command[1])
    url = f"http://172.22.120.50:3000/createJob?rackId={rack_id}&jobType=7"    
    response = requests.post(url)

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