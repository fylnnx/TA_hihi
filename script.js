document.getElementById("embed-button").addEventListener("click", function() {
    const audioFile = document.getElementById("audio-file").files[0];
    const message = document.getElementById("message").value;
    const key = document.getElementById("key").value;
    
    if (!audioFile || !message || !key) {
        alert("Please fill in all fields.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;

        embed(audioData, message, key, "output_audio.wav"); // This will depend on your backend setup
        alert("Message embedded into audio!");
    };
    reader.readAsArrayBuffer(audioFile);
});

document.getElementById("extract-button").addEventListener("click", function() {
    const audioFile = document.getElementById("audio-file-extract").files[0];
    const key = document.getElementById("key-extract").value;
    
    if (!audioFile || !key) {
        alert("Please fill in all fields.");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;

        // Call the extract function (assuming you are using node.js with the 'extract' method)
        const extractedMessage = extract(audioData, key);
        document.getElementById("extracted-message").innerText = extractedMessage;
    };
    reader.readAsArrayBuffer(audioFile);
});
