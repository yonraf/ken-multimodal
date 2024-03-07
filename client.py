import requests

def send_audio_to_server(audio_file_path):
    url = 'http://localhost:5000/transcribe'
    audio_file = open(audio_file_path, 'rb')
    
    files = {'audio': audio_file}
    response = requests.post(url, files=files)
    audio_file.close()
    return response.text

if __name__ == '__main__':
    audio_file_path = './6.wav'  # Replace with your audio file path
    result = send_audio_to_server(audio_file_path)
    print('Command detected:', result)