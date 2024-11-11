const express = require('express');
const AES = require('../AES3');
const SpreadSpectrum = require('../SpreadSpectrumFIX');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.post('/embed', upload.single('audioFile'), (req, res) => {
    const { message, secretKey } = req.body;
    const audioFilePath = req.file.path;
    const outputFilePath = `uploads/output_${Date.now()}.wav`;

    const encryptedText = AES.encryptAES128(message, secretKey);
    SpreadSpectrum.embed(audioFilePath, encryptedText, secretKey, outputFilePath);

    res.download(outputFilePath, 'stego_audio.wav', () => {
        fs.unlinkSync(audioFilePath);
        fs.unlinkSync(outputFilePath);
    });
});

router.post('/extract', upload.single('audioFile'), (req, res) => {
    const { secretKey } = req.body;
    const audioFilePath = req.file.path;

    const encryptedText = SpreadSpectrum.extract(audioFilePath, secretKey);
    const decryptedMessage = AES.decryptAES128(encryptedText, secretKey);

    fs.unlinkSync(audioFilePath);
    res.json({ message: decryptedMessage });
});

module.exports = router;
