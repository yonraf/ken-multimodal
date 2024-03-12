from faster_whisper import WhisperModel
import time
model_size = "small"

# Run on GPU with FP16
model = WhisperModel(model_size, device="auto", compute_type="int8")

# or run on GPU with INT8
# model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")
# or run on CPU with INT8
# model = WhisperModel(model_size, device="cpu", compute_type="int8")
start_time = time.time()

segments, info = model.transcribe("5.wav", beam_size=5)

print("Detected language '%s' with probability %f" % (info.language, info.language_probability))
seg = list(segments)

print(seg[0].text)
for segment in segments:
    print("[%.2fs -> %.2fs] %s" % (segment.start, segment.end, segment.text))
print("--- %s seconds ---" % (time.time() - start_time))
