import json


f = open('mockup_ken.json')
data = json.load(f)

def get_rack_id(name):
    for rack in data["racks"]:
        for key, value in rack.items():
            if key == name:
                return value
    return 'rack error'

def get_position_id(name):
    for rack in data["positions"]:
        for key, value in rack.items():
            if key == name:
                return value
    return 'position error'

