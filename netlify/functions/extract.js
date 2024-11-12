const AES = require('../AES3');
const SpreadSpectrum = require('../SpreadSpectrumFIX');
const fs = require('fs');

exports.handler = async (event) => {
    const { message, secretKey, audioFilePath } = JSON.parse(event.body);

    const outputFilePath = `/tmp/output_${Date.now()}.wav`;
    const encryptedText = AES.encryptAES128(message, secretKey);

    SpreadSpectrum.embed(audioFilePath, encryptedText, secretKey, outputFilePath);
    const fileBuffer = fs.readFileSync(outputFilePath);

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'audio/wav',
        },
        body: fileBuffer.toString('base64'),
        isBase64Encoded: true,
    };
};
