async function createModel() {
    const URL = "http://localhost:5000/files/";
    const checkpointURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    const recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        checkpointURL,
        metadataURL);

    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    try {
        const recognizer = await createModel();
        const classLabels = recognizer.wordLabels();
        const labelContainer = document.getElementById("label-container");

        let isRecording = false;
        let chunks = [];

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                recognizer.listen(result => {
                    if (!isRecording) {
                        const scores = result.scores;
                        let maxIndex = 0;
                        let maxScore = scores[0];

                        for (let i = 1; i < scores.length; i++) {
                            if (scores[i] > maxScore) {
                                maxScore = scores[i];
                                maxIndex = i;
                            }
                        }

                        labelContainer.innerHTML = classLabels[maxIndex] + ": " + maxScore.toFixed(2);

                        const recognizedWord = classLabels[maxIndex].toLowerCase();
                        if ((recognizedWord === "okay" || recognizedWord === "hey")) {
                            isRecording = true;
                            document.body.style.backgroundColor = "#2ecc71";
                            const mime = ['audio/wav', 'audio/mpeg', 'audio/webm', 'audio/ogg'].filter(MediaRecorder.isTypeSupported)[0];
                            var options = {
                                audioBitsPerSecond: 128000,
                                mimeType: mime
                            }

                            const mediaRecorder = new MediaRecorder(stream, options);

                            mediaRecorder.ondataavailable = event => {
                                console.log("Data available:", event.data);
                                chunks.push(event.data);
                            };

                            mediaRecorder.onstop = () => {
                                const audio = document.getElementById("recordedAudio");
                                audio.controls = true;
                                const blob = new Blob(chunks, { 'type': 'audio/wav; codecs=0' });
                                SendAudioToEndpoint(blob);
                                const audioURL = window.URL.createObjectURL(blob);
                                audio.src = audioURL;
                                console.log("URL :\n", audioURL)
                                
                                // reset sound
                                chunks = [];
                            };

                            mediaRecorder.start();
                            document.body.classList.add('recording'); // Add 'recording' class to body
                            setTimeout(() => {
                                mediaRecorder.stop();
                                isRecording = false;
                                document.body.style.backgroundColor = "#1a5276";
                                document.body.classList.remove('recording'); // Remove 'recording' class from body
                            }, 5000); // Record for 3 seconds
                        }
                    }
                }, {
                    includeSpectrogram: true,
                    probabilityThreshold: 0.85,
                    invokeCallbackOnNoiseAndUnknown: true,
                    overlapFactor: 0.50
                });
            })
            .catch(error => {
                console.error("Error accessing microphone:", error);
            });
    } catch (error) {
        console.error("Error initializing recognition:", error);
    }
}

function SendAudioToEndpoint(blob) {
    const formData = new FormData();
    formData.append('audio', blob);

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
}