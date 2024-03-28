import sounddevice as sd
import soundfile as sf

def record_audio(duration=3, samplerate=44100):
    print("Recording...")
    # Record audio
    recording = sd.rec(int(duration * samplerate), samplerate=samplerate, channels=1, dtype='int16')
    sd.wait()  # Wait until recording is finished
    
    # Ask user for filename
    filename = "./audio files/"+input("Enter filename to save the recording: ")+".wav"

    # Save recorded audio to WAV file
    sf.write(filename, recording, samplerate)
    print(f"Audio recorded and saved as {filename}")

if __name__ == "__main__":
    input(" Press Enter to start recording... ")
    record_audio()
