import AES from './AES.js';
import SpreadSpectrum from './SpreadSpectrum.js';

document.getElementById('embedForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const audioFile = document.getElementById('audioFile').files[0];
        const message = document.getElementById('message').value;
        const secretKey = document.getElementById('secretKey').value;

        if (!audioFile || !message || !secretKey) {
            alert("Silakan isi semua input.");
            return;
        }

        // Baca file audio sebagai ArrayBuffer
        const audioArrayBuffer = await audioFile.arrayBuffer();

        // Enkripsi pesan
        const encryptedText = AES.encryptAES128(message, secretKey);
        console.log("Encrypted Text:", encryptedText);

        // Embedding pesan ke dalam file audio
        const outputAudioBuffer = SpreadSpectrum.embed(audioArrayBuffer, encryptedText, secretKey);

        // Buat file audio output dan unduh
        const outputBlob = new Blob([outputAudioBuffer], { type: 'audio/wav' });
        const url = URL.createObjectURL(outputBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'stego_audio.wav';
        document.body.appendChild(link);
        link.click();
        link.remove();

        alert("Pesan berhasil di-embed dan file telah diunduh.");
    } catch (error) {
        console.error("Error saat embedding:", error);
        alert("Terjadi kesalahan saat embedding.");
    }
});

// Extract Form Handler
document.getElementById('extractForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const audioFile = document.getElementById('audioFileExtract').files[0];
        const secretKey = document.getElementById('secretKeyExtract').value;

        if (!audioFile || !secretKey) {
            alert("Silakan isi semua input.");
            return;
        }

        // Baca file audio sebagai ArrayBuffer
        const audioArrayBuffer = await audioFile.arrayBuffer();

        // Ekstraksi pesan terenkripsi dari file audio
        const encryptedText = SpreadSpectrum.extract(audioArrayBuffer, secretKey);
        console.log("Encrypted Text Extracted:", encryptedText);

        // Dekripsi pesan
        const decryptedMessage = AES.decryptAES128(encryptedText, secretKey);
        console.log("Decrypted Message:", decryptedMessage);

        showPopup(`Pesan yang diekstrak: ${decryptedMessage}`);
    } catch (error) {
        console.error("Error saat ekstraksi:", error);
        alert("Terjadi kesalahan saat ekstraksi.");
    }
});

// Fungsi untuk menampilkan pop-up modal
function showPopup(message) {
    const modal = document.getElementById("popupModal");
    const messageElement = document.getElementById("extractedMessage");

    messageElement.textContent = message;
    modal.style.display = "flex";

    // Menutup modal saat tombol 'x' diklik
    document.getElementById("closeModal").onclick = () => {
        modal.style.display = "none";
    };

    // Menutup modal saat klik di luar konten
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };
}
