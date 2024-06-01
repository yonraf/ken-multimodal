const IP = "10.68.48.113:5000"
var recognizer;

var socket = io.connect("10.68.48.113:5000");

var recording;

var chunks = []

var inProgress = false

async function init(){
    recognizer = speechCommands.create(
        "BROWSER_FFT",
        undefined,
        "http://" + IP + "/files/model.json",
        "http://" + IP + "/files/metadata.json"
    );

    await recognizer.ensureModelLoaded();
}


async function startRecognition() {
    document.getElementById("top_microphone").style.backgroundColor = "";
    document.getElementById("task-progress").style.display = "none";
        
    const classLabels = recognizer.wordLabels();
    

    recognizer.listen(result => {
        const classLabels = recognizer.wordLabels();
        const maxIndex = result.scores.indexOf(Math.max(...result.scores));
        const recognizedWord = classLabels[maxIndex].toLowerCase();

        if (recognizedWord === "okay") {
            recordAudio();
        }
    }, {
        includeSpectrogram: true,
        probabilityThreshold: 0.85,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50
    });
    recording = true;
}

function stopRecognition() {
    if (recording) {
        recognizer.stopListening();
    }
   recording = false;
}

async function recordAudio() {
    if (!inProgress) {    
        inProgress = true;
        stopRecognition();
        
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
        }
        

        mediaRecorder.onstart = () => {
            document.getElementById("top_microphone").style.backgroundColor = "#2ecc71";
        }

        // Start recording for 5 seconds
        mediaRecorder.start();
        await new Promise(resolve => setTimeout(resolve, 5000));
        mediaRecorder.stop();
    };
}

function sendAudioToEndpoint(blob) {
    const formData = new FormData();
    formData.append('audio', blob);
    document.getElementById("top_microphone").style.backgroundColor = "#F7C566";
    document.getElementById("task-progress").style.display = "block"


    fetch('http://' + IP + '/process', {
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

document.addEventListener("DOMContentLoaded", function() {
    init();
    startRecognition();
});



socket.on('client', function (data) {
    console.log('Socket connected');
})

socket.on('state', function (data) {
    console.log("DATA:",data)
    updateProgressBar(data);
    showProgressBar(data);
});

function updateProgressBar(state) {
    var progressBar = document.getElementById("progress-bar");
    var percent;
    var colorClass = "progress-bar-success"; // Green

    switch (state) {
        case "transcribing":
            percent = 15;
            break;
        case "processing":
            percent = 40;
            break;
        case "recognising":
            percent = 80;
            break;
        case "executing":
            percent = 90;
            break;
        case "completed":
            percent = 100;
            break;
        case "error":
            colorClass = "progress-bar-danger"; // RED
        default:
            // Handle unknown state
            break;
    }
    if (percent != null){
        progressBar.style.width = percent + "%";
        progressBar.setAttribute("aria-valuenow", percent);
        progressBar.textContent = percent + "%";    
    }
    progressBar.classList.remove("progress-bar-success", "progress-bar-warning", "progress-bar-danger");
    progressBar.classList.add(colorClass);
}


function showProgressBar(status){
    var progressBar = document.getElementById("progress-bar");
    

    if (status == "completed" || status == "error"){
        setTimeout(()=>{

            document.getElementById("task-progress").style.display = "none"
            document.getElementById("top_microphone").style.backgroundColor = "";
            
            var percent = 0;
            progressBar.style.width = percent + "%";
            progressBar.setAttribute("aria-valuenow", percent);
            progressBar.textContent = percent + "%";
            progressBar.classList.remove("progress-bar-success", "progress-bar-warning", "progress-bar-danger");
            progressBar.classList.add("progress-bar-success");
            progressBar.style.width = percent + "%";

            if(!recording){
                startRecognition();
                inProgress = false;
            }
        }, 3000)
        
    }
}
