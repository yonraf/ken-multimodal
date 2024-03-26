import json

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