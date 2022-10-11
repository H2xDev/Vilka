const fs = require('fs');
const TEXTURE_BYTE_SIZE = 64;

class MDLReader {
  readPosition = 0;
  bytes = new Int32Array([]);

  mdlData = {};

  /** @param { string } */
  constructor(filename) {
    if (!fs.existsSync(filename)) throw new Error(`Model "${filename}" doesn't exists`);

    const data = fs.readFileSync(filename);

    this.bytes = new Int32Array(data);

    this.readMDL();
  }

  readMDL() {
    this.mdlData.id = this.readString(4);
    this.mdlData.version = this.readInt();
    this.mdlData.checksum = this.readInt();
    this.mdlData.name = this.readString(64);
    this.mdlData.length = this.readInt();

    this.mdlData.vEyePosition = this.readVector();
    this.mdlData.vIllumPosition = this.readVector();
    this.mdlData.vHullMin = this.readVector();
    this.mdlData.vHullMax = this.readVector();
    this.mdlData.vViewBBmin = this.readVector();
    this.mdlData.vViewBBmax = this.readVector();

    this.mdlData.flags = this.readInt();

    this.mdlData.boneCount = this.readInt();
    this.mdlData.boneOffset = this.readInt();
    this.mdlData.boneControllerCount = this.readInt();
    this.mdlData.boneControllerOffset = this.readInt();

    this.mdlData.hitBoxCount = this.readInt();
    this.mdlData.hitBoxOffset = this.readInt();

    this.mdlData.localAnimCount = this.readInt();
    this.mdlData.localAnimOffset = this.readInt();

    this.mdlData.localSeqCount = this.readInt();
    this.mdlData.localSeqOffset = this.readInt();

    this.mdlData.activityListVersion = this.readInt();
    this.mdlData.eventsIndexed = this.readInt();

    this.mdlData.textureCount = this.readInt();
    this.mdlData.textureOffset = this.readInt();

    this.mdlData.textureDirCount = this.readInt();
    this.mdlData.textureDirOffset = this.readInt();

    this.mdlData.skinReferenceCount = this.readInt();
    this.mdlData.skinFamilyCount = this.readInt();
    this.mdlData.skinReferenceIndex = this.readInt();

    this.mdlData.bodyPartCount = this.readInt();
    this.mdlData.bodyPartOffset = this.readInt();

    this.mdlData.attachmentCount = this.readInt();
    this.mdlData.attachmentOffset = this.readInt();
  }

  get materialList() {
    this.readFrom(this.mdlData.textureDirOffset);

    const dirsOffsets = new Int32Array(this.mdlData.textureDirCount)
      .map(this.readInt.bind(this));

    const dirs = Array
      .from(dirsOffsets)
      .map((offset) => this.readFrom(offset)
          .readString()
          .replace(/\\/g, "/"));

    this.readFrom(this.mdlData.textureOffset);
    const textures = Array.from(new Int32Array(this.mdlData.textureCount))
      .map((_, i) => ({
          nameOffset: this.mdlData.textureOffset + TEXTURE_BYTE_SIZE * i + this.readInt(),
          flags: this.readInt(),
          used: this.readInt(),
          unused: this.readInt(),
          material: this.readInt(),
          clientMaterial: this.readInt(),
          unused2: new Int32Array(10).map(() => this.readInt()),
      }))
      .map(data => {
        return this.readFrom(data.nameOffset).readString();
      })

    // NOTE: Return all possible paths to materials
    return dirs
      .map(dir => {
        return textures.map(texture => dir + texture);
      })
      .flat();
  }

  readFrom(offset) {
    this.readPosition = offset;
    return this;
  }

  /** @param { number } */
  readString(count) {
    if (count) {
      const { readPosition } = this;
      const start = readPosition;
      const end = readPosition + count;

      const result = this.bytes
        .slice(start, end)
        .join(" ")
        .split(" ")
        .map((e) => String.fromCharCode(e))
        .join("");

      this.readPosition += count;

      return result;
    }

    let string = "";
    let currentByte = this.readByte();

    while (!!currentByte) {
      string += String.fromCharCode(currentByte);
      currentByte = this.readByte();
    }

    return string;
  }

  readInt() {
    const bytes = this.bytes.slice(this.readPosition, this.readPosition + 4);
    this.readPosition += 4;

    return bytes.reverse().reduce((sum, byte) => {
      return sum * 256 + byte;
    }, 0);
  }

  readFloat() {
    const bytes = this.bytes.slice(this.readPosition, this.readPosition + 4);
    const arrayBuffer = new ArrayBuffer(4);

    const f32 = new Float32Array(arrayBuffer);
    const ui8 = new Uint8Array(arrayBuffer);

    ui8[0] = bytes[0];
    ui8[1] = bytes[1];
    ui8[2] = bytes[2];
    ui8[3] = bytes[3];

    this.readPosition += 4;

    return f32[0];
  }

  readVector() {
    const x = this.readFloat();
    const y = this.readFloat();
    const z = this.readFloat();

    return { x, y, z };
  }

  readByte() {
    this.readPosition++;
    return this.bytes[this.readPosition - 1];
  }
}

module.exports = { MDLReader };
