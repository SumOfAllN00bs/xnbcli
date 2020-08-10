const BaseReader = require('./BaseReader');
const BufferReader = require('../../BufferReader');

/**
 * SoundEffect Reader
 * @class
 * @extends BaseReader
 */
class SoundEffectReader extends BaseReader {
    /**
     * Reads SoundEffect from buffer.
     * @param {BufferReader} buffer
     * @returns {object}
     */
    read(buffer) {
        buffer.seek(4); // skip header size count
        let wavType = buffer.readInt16();
        if (wavType == 1) { // PCM
            // http://www.topherlee.com/software/pcm-tut-wavformat.html
            // http://soundfile.sapp.org/doc/WaveFormat/
            var channels = buffer.readInt16();
            var sampleRate = buffer.readInt32();
            buffer.seek(6); // skipping, byterate and blockalign
            var bitDepth = buffer.readInt16();
            buffer.seek(2); // "data" !! actually I don't know
        }

        let size = buffer.readInt32();
        let tmpData = []
        let datasectionOffset = buffer.bytePosition;
        let bytesPerSample = bitDepth/8;
        let samplesCount = (size/bytesPerSample)/channels;
        switch (bitDepth) {
            case 8:
                tmpData = new Int8Array(samplesCount*channels);
                for (let n = 0; n < (samplesCount*channels); n = n + channels) {
                    for(let ch = 0; ch < channels; ch++)
                        tmpData[n+ch] = buffer.readInt8();
                }
                break;
            case 16:
                tmpData = new Int16Array(samplesCount*channels);
                for (let n = 0; n < (samplesCount*channels); n = n + channels) {
                    for(let ch = 0; ch < channels; ch++)
                        tmpData[n+ch] = buffer.readInt16();
                }
                break;
            case 32:
                tmpData = new Int32Array(samplesCount*channels);
                for (let n = 0; n < (samplesCount*channels); n = n + channels) {
                    for(let ch = 0; ch < channels; ch++)
                        tmpData[n+ch] = buffer.readInt32();
                }
                break;
            default:
                break;
        }
        buffer.seek(size, datasectionOffset);

        return {
            export: { 
                type: this.type, 
                data: tmpData,
                sampleRate,
                bitDepth,
                channels,
            }
        };
    }

    write(buffer, content, resolver) {
    }
}

module.exports = SoundEffectReader;