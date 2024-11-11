const { log } = require('console');
const fs = require('fs');


function getSeedFromKey(key) {
    let seed = key.charCodeAt(0);
    for (let i = 1; i < key.length; i++) {
        seed ^= key.charCodeAt(i);
    }
    return seed;
}


function generatePnCode(length, seed) {
    const modulus = 70000;
    const multiplier = 2;
    const increment = 5;
    const pnCode = [];

    let k = 0;
    while (k < length) {
        seed = (multiplier * seed + increment) % modulus;
        if (seed % 16 != 1 && seed > 352) { // Hindari posisi MSB dan header
            pnCode.push(seed);
            k++;
        }
    }
    console.log('Bit Index:', pnCode);
    return pnCode;
}

function messageToBinary(message) {
    message = message.slice(0, 32).padEnd(32, '0');
    return message.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function audioSamplesToBinaryString(audioSamples) {
    return Array.from(audioSamples).map(sample => {
        let binary = (sample & 0xFFFF).toString(2);
        return binary.padStart(16, '0');
    }).join('');
}

function embed(AudioFileName, message, key, OutputFileName) {
    const audioBuffer = fs.readFileSync(AudioFileName);
    const audioSamples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / Int16Array.BYTES_PER_ELEMENT);

    let audioBits = audioSamplesToBinaryString(audioSamples);
    fs.writeFileSync(`${AudioFileName}.txt`, audioBits, 'utf-8');

    const messageBits = messageToBinary(message);
    console.log('Binary Message:', messageBits);

    const seed = getSeedFromKey(key.slice(0, 32)); 
    const pnCode = generatePnCode(messageBits.length, seed);

    let audioBitsArray = audioBits.split('');
    for (let i = 0; i < messageBits.length; i++) {
        const position = pnCode[i];
        audioBitsArray[position] = messageBits[i];
    }
    fs.writeFileSync(`${AudioFileName}_AfterEmbed.txt`, audioBitsArray.join(''), 'utf-8');

    for (let i = 0; i < audioSamples.length; i++) {
        audioSamples[i] = parseInt(audioBitsArray.slice(i * 16, (i + 1) * 16).join(''), 2);
    }
    const outputBuffer = Buffer.from(audioSamples.buffer);
    fs.writeFileSync(OutputFileName, outputBuffer);
    console.log("Embed Stego Audio:", OutputFileName);
}

function extract(AudioFileName, key) {
    const audioBuffer = fs.readFileSync(AudioFileName);
    const audioSamples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, audioBuffer.length / Int16Array.BYTES_PER_ELEMENT);

    const audioBits = audioSamplesToBinaryString(audioSamples);
    fs.writeFileSync(`${AudioFileName}.txt`, audioBits, 'utf-8');

    const seed = getSeedFromKey(key.slice(0, 32)); 
    const pnCode = generatePnCode(256, seed); // 32 karakter * 8 bit = 256 bit

    let messageBits = '';
    for (let i = 0; i < pnCode.length; i++) {
        const position = pnCode[i];
        messageBits += audioBits[position];
    }

    console.log("Extraction Bits:", messageBits);

    let message = '';
    for (let i = 0; i < messageBits.length; i += 8) {
        const byte = messageBits.slice(i, i + 8);
        message += String.fromCharCode(parseInt(byte, 2));
    }
    message = message.replace(/0+$/, '');
    console.log("Extracted message:", message);
    return message;
}

// // Contoh penggunaan
// embed('sample.wav', 'Pesan ini maksimal 32 karakter panjangnya', '12345678901234567890123456789012', 'output3.wav');
// extract('output3.wav', '12345678901234567890123456789012');

module.exports = {
    embed,
    extract,
};
