import sounddevice as sd
import soundfile as sf
import os

def record_audio(duration=3, samplerate=44100):
    print("Recording...")
    # Record audio
    recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
    sd.wait()  # Wait until recording is finished
    
    # Ask user for filename
    base_filename = input("What did the user say?: ")

    filename = "./audio files/" + base_filename + ".wav"

    # Create directory if it doesn't exist
    if not os.path.exists("./audio files/"):
        os.makedirs("./audio files/")
    
    # Check if the filename already exists
    counter = 1
    while os.path.exists(filename):
        filename = f"./audio files/{base_filename} {counter}.wav"
        counter += 1
            

    # Save recorded audio to WAV file
    sf.write(filename, recording, samplerate)
    print(f"Audio recorded and saved as {filename}")

if __name__ == "__main__":
    input(" Press Enter to start recording... ")
    record_audio()
