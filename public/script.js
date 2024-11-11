document.getElementById('embedForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const audioFile = document.getElementById('audioFile').files[0];
    const message = document.getElementById('message').value;
    const secretKey = document.getElementById('secretKey').value;

    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('message', message);
    formData.append('secretKey', secretKey);

    const response = await fetch('/api/embed', {
        method: 'POST',
        body: formData,
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stego_audio.wav';
    document.body.appendChild(link);
    link.click();
    link.remove();
});

document.getElementById('extractForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const audioFile = document.getElementById('audioFileExtract').files[0];
    const secretKey = document.getElementById('secretKeyExtract').value;

    const formData = new FormData();
    formData.append('audioFile', audioFile);
    formData.append('secretKey', secretKey);

    const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
    });

    const result = await response.json();
    document.getElementById('result').innerText = `Pesan yang diekstrak: ${result.message}`;
});
