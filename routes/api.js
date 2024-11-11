// functions/api.js
const AES = require('../AES3');
const SpreadSpectrum = require('../SpreadSpectrumFIX');

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod === "POST") {
            const { audioFileName, message, secretKey, outputFileName } = JSON.parse(event.body);

            // Encrypt message
            const encryptedText = AES.encryptAES128(message, secretKey);
            console.log("Encrypted Text:", encryptedText);

            // Embed encrypted message into audio
            await SpreadSpectrum.embed(audioFileName, encryptedText, secretKey, outputFileName);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Pesan berhasil di-embed ke dalam audio", outputFileName })
            };
        } else if (event.httpMethod === "GET") {
            const { audioFileName, secretKey } = event.queryStringParameters;

            const encryptedText = await SpreadSpectrum.extract(audioFileName, secretKey);
            console.log("Encrypted Text Extracted:", encryptedText);

            const decryptedMessage = AES.decryptAES128(encryptedText, secretKey);
            console.log("Decrypted Message:", decryptedMessage);

            return {
                statusCode: 200,
                body: JSON.stringify({ decryptedMessage })
            };
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: "Method Not Allowed" })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
