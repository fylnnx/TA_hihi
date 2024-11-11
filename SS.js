const { log } = require('console');
const fs = require('fs');

//get seed from XOR every key
function getSeedFromKey(key) {
    let seed = key.charCodeAt(0);
    for (let i = 1; i < key.length; i++) {
        seed ^= key.charCodeAt(i);
    }
    return seed;
}

//LCG function to fine PN (embed index)
function generatePnCode(length, seed) {
    const modulus = 70000;
    const multiplier = 2;
    const increment = 5;
    const pnCode = [];

    let k = 0;
    while (k < length) {
        seed = (multiplier * seed + increment) % modulus;
        if (seed % 16 != 1 && seed > 352) { // ignore MSB position ,, prevent index to be header (44 byte -> (bit 0, 352))
            pnCode.push(seed);
            k++;
        }
    }
    console.log ('Bit Index:', pnCode);
    return pnCode;
}

//convert message to binary representation
function messageToBinary(message) {
    //add padding if message length < 16
    if (message.length < 16) {
        message = message.padEnd(16, '0');
    }

    //convert each chara to binary
    return message.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

//convert audio sample to binary
function audioSamplesToBinaryString(audioSamples) {
    return Array.from(audioSamples).map(sample => {
        // Convert to 16-bit signed binary representation
        let binary = (sample & 0xFFFF).toString(2); //mask to keep only 16 bits
        return binary.padStart(16, '0'); // Pad to 16 bits if needed
    }).join('');
}

//convert binary to string
function binaryToString(binaryStr) {
    let text = '';
    for (let i = 0; i < binaryStr.length; i += 8) {
        const byte = binaryStr.slice(i, i + 8);
        text += String.fromCharCode(parseInt(byte, 2));
    }
    return text;
}

//embed message into audio
function embed(AudioFileName, message, key, OutputFileName) {
    //open file
    const audioBuffer = fs.readFileSync(AudioFileName);

    //initiation audio sample value
    const audioSamples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, (audioBuffer.length) / Int16Array.BYTES_PER_ELEMENT);
    
    //convert audio sample to binary
    let audioBits = audioSamplesToBinaryString(audioSamples);
    fs.writeFileSync(`${AudioFileName}.txt`, audioBits, 'utf-8');

    //convert message to binary
    message = message.slice(0, 16).padEnd(16, '0');
    const messageBits = messageToBinary(message);
    console.log ('Binary Message:', messageBits);

    //generate PN for embed index
    const seed = getSeedFromKey(key);
    // console.log("Embed Seed:", seed);
    const pnCode = generatePnCode(messageBits.length, seed);
    // console.log("PN code:", pnCode);

    //embed message bit to generated index
    let audioBitsArray = audioBits.split('');
    for (let i = 0; i < messageBits.length; i++) {
        const position = pnCode[i];
        audioBitsArray[position] = messageBits[i]; // Replace bit at position
        //console.log(`Bit -${i} (${position}): ${audioBitsArray[position]}`);
    }
    fs.writeFileSync(`${AudioFileName}_AfterEmbed.txt`, audioBitsArray.join(''), 'utf-8');

    audioBits = audioBitsArray.join('');

    //convert audiobits to audio sample
    for (let i = 0; i < audioSamples.length; i++) {
        audioSamples[i] = parseInt(audioBits.slice(i * 16, (i + 1) * 16), 2);
    }

    //save stego audio to new file
    const outputBuffer = Buffer.from(audioSamples.buffer);
    fs.writeFileSync(OutputFileName, outputBuffer);
    console.log("Embed Stego Audio:", OutputFileName);
}

// Extract message
function extract(AudioFileName, key) {
    const audioBuffer = fs.readFileSync(AudioFileName);
    const audioSamples = new Int16Array(audioBuffer.buffer, audioBuffer.byteOffset, (audioBuffer.length) / Int16Array.BYTES_PER_ELEMENT);

    const audioBits = audioSamplesToBinaryString(audioSamples);
    fs.writeFileSync(`${AudioFileName}.txt`, audioBits, 'utf-8');

    const seed = getSeedFromKey(key);
    // console.log("Seed saat ekstraksi:", seed);

    const pnCode = generatePnCode(128, seed); // Assuming the message fits in the audio
    // console.log("PN code saat ekstraksi:", pnCode);

    let messageBits = '';
    for (let i = 0; i < pnCode.length; i++) {
        const position = pnCode[i];
        messageBits += audioBits[position];
        //console.log(`Bit -${i} (${position}): ${audioBits[position]}`);
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

// //test

// embed('sample.wav', 'Ayu Mutiara', '1234567890123456', 'output3.wav');
// extract('output3.wav', '1234567890123456');

// module.exports = {
//     embed,
//     extract,
// };
