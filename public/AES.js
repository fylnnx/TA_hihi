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

// Ekspor default
export default {
    encryptAES128,
    decryptAES128
};
