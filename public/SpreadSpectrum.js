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

function embed(audioArrayBuffer, message, key) {
    const audioSamples = new Int16Array(audioArrayBuffer);

    let audioBits = audioSamplesToBinaryString(audioSamples);

    const messageBits = messageToBinary(message);
    console.log('Binary Message:', messageBits);

    const seed = getSeedFromKey(key.slice(0, 32)); 
    const pnCode = generatePnCode(messageBits.length, seed);

    let audioBitsArray = audioBits.split('');
    for (let i = 0; i < messageBits.length; i++) {
        const position = pnCode[i];
        audioBitsArray[position] = messageBits[i];
    }

    for (let i = 0; i < audioSamples.length; i++) {
        audioSamples[i] = parseInt(audioBitsArray.slice(i * 16, (i + 1) * 16).join(''), 2);
    }

    return audioSamples.buffer;
}

function extract(audioArrayBuffer, key) {
    const audioSamples = new Int16Array(audioArrayBuffer);

    const audioBits = audioSamplesToBinaryString(audioSamples);

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

export default {
    embed,
    extract,
};
