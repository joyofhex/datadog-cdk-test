import json

def handler(event, _context):
    print(json.dumps(event))
