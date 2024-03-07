import requests
import os


def send_audio_to_server(audio_file_path):
    url = 'http://localhost:5000/transcribe'
    audio_file = open(audio_file_path, 'rb')
    
    files = {'audio': audio_file}
    response = requests.post(url, files=files)
    audio_file.close()
    return response.text

if __name__ == '__main__':
    audio_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "6.wav")    
    result = send_audio_to_server(audio_file_path)
    print('Command detected:', result)