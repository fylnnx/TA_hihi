const CryptoJS = require("crypto-js");

function ensureMaxLength(input, length = 16) {
    if (input.length > length) {
        return input.substring(0, length); 
    }
    return input.padEnd(length, ' '); 
}

function encryptAES128(text, secretKey) {
    const key = ensureMaxLength(secretKey);
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
        keySize: 128 / 8, 
        iv: CryptoJS.enc.Utf8.parse(key), 
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
}

function decryptAES128(encryptedText, secretKey) {
    const key = ensureMaxLength(secretKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedText, CryptoJS.enc.Utf8.parse(key), {
        keySize: 128 / 8,
        iv: CryptoJS.enc.Utf8.parse(key), 
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}

// // Contoh penggunaan
// const secretKey = "1234567890abcdef"; // Key rahasia 16 karakter (128 bit)
// const encryptedText ='fmNHpioKl2Nz55sb1YY2PQ=='
// const textToEncrypt = "Hello, World!"; // Teks untuk dienkripsi

// // Enkripsi
// const encryptedText = encryptAES128(textToEncrypt, secretKey);
// console.log("Encrypted:", encryptedText);

// Dekripsi
// const decryptedText = decryptAES128(encryptedText, secretKey);
// console.log("Decrypted:", decryptedText);

module.exports = {
    encryptAES128,
    decryptAES128,
};