const AES = require('./AES3');
const SpreadSpectrum = require('./SpreadSpectrumFIX');

function embedMessage(audioFileName, message, secretKey, outputFileName) {
    // Encrypt message
    const encryptedText = AES.encryptAES128(message, secretKey);
    console.log("Encrypted Text:", encryptedText);

    // Embed encrypted message into audio
    SpreadSpectrum.embed(audioFileName, encryptedText, secretKey, outputFileName);
    console.log("Pesan berhasil di-embed ke dalam audio:", outputFileName);
}

function extractMessage(audioFileName, secretKey) {

    const encryptedText = SpreadSpectrum.extract(audioFileName, secretKey);
    console.log("Encrypted Text Extracted:", encryptedText);


    const decryptedMessage = AES.decryptAES128(encryptedText, secretKey);
    console.log("Decrypted Message:", decryptedMessage);
    return decryptedMessage;
}

const secretKey = "1234567890abcdef"; // harus 16
const message = "Ayu Mutiara"; // max 16
const inputAudio = 'sample.wav';
const outputAudio = 'output3.wav';


embedMessage(inputAudio, message, secretKey, outputAudio);


extractMessage(outputAudio, secretKey);
