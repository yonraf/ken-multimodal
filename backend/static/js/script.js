let recognizer;

async function startRecognition() {
    document.getElementById("top_microphone").style.backgroundColor = "";
    document.getElementById("task-progress").style.display = "none";
        
    recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        "http://localhost:5000/files/model.json",
        "http://localhost:5000/files/metadata.json"
    );

    await recognizer.ensureModelLoaded();

    // Print the possible outcomes (words the model has been trained on)
    const classLabels = recognizer.wordLabels();
    console.log("Possible outcomes:", classLabels);

    recognizer.listen(result => {
        const classLabels = recognizer.wordLabels();
        const maxIndex = result.scores.indexOf(Math.max(...result.scores));
        const recognizedWord = classLabels[maxIndex].toLowerCase();

        if (recognizedWord === "okay" || recognizedWord === "hey") {
            console.log("Recognized:", recognizedWord);
            stopRecognition()
            recordAudio();
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.85,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });
}

function stopRecognition() {
    if (recognizer) {
        recognizer.stopListening();
    }
}

async function recordAudio() {
    // Get user media stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Define MIME type for recording
    const mime = ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg'].filter(MediaRecorder.isTypeSupported)[0];
    const options = {
        audioBitsPerSecond: 128000,
        mimeType: mime
    };

    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream, options);
    const chunks = [];

    // Event handlers for MediaRecorder
    mediaRecorder.ondataavailable = event => {
        console.log("Data available:", event.data);
        chunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        document.getElementById("top_microphone").style.backgroundColor = "";
        
        // Convert chunks to Blob
        const blob = new Blob(chunks, { type: 'audio/wav; codecs=0' });

        // Send audio Blob to endpoint
        sendAudioToEndpoint(blob);

        // Reset chunks array
        chunks = [];
    };

    mediaRecorder.onstart = () => {
        document.getElementById("top_microphone").style.backgroundColor = "#2ecc71";
    }

    // Start recording for 5 seconds
    mediaRecorder.start();
    await new Promise(resolve => setTimeout(resolve, 5000));
    mediaRecorder.stop();
}

function sendAudioToEndpoint(blob) {
    const formData = new FormData();
    formData.append('audio', blob);
    document.getElementById("top_microphone").style.backgroundColor = "#F7C566";
    document.getElementById("task-progress").style.display = "block"


    fetch('http://localhost:5000/process', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Audio file sent successfully', data);
        })
        .catch(error => {
            console.error('Error sending audio file:', error);
        });
    
    // FAKE PROCESSING
    setTimeout(() => {
        console.log("Done processing");
        startRecognition();
    }, 5000)
}

document.addEventListener("DOMContentLoaded", function () {
    startRecognition();
});