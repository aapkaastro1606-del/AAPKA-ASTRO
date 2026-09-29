import sharp from "sharp";
import fs from "fs";

const srcPath = "C:/Users/anmol/.gemini/antigravity/brain/38dce4e4-16b3-4431-82d2-da75d512f77a/.user_uploaded/media_1790685976176.png";

async function generateAllIcons() {
  const emblemWidth = 590;
  const emblemHeight = 670;
  const emblemLeft = 218;
  const emblemTop = 85;

  console.log("Emblem crop:", { emblemLeft, emblemTop, emblemWidth, emblemHeight });

  const emblemBuffer = await sharp(srcPath)
    .extract({ left: emblemLeft, top: emblemTop, width: emblemWidth, height: emblemHeight })
    .toBuffer();

  const squircleSvg = Buffer.from(
    `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" rx="56" ry="56" fill="#FFFFFF"/>
    </svg>`
  );

  const resizedEmblem = await sharp(emblemBuffer)
    .resize(420, 420, { fit: "inside", background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .toBuffer();

  const icon512 = await sharp(squircleSvg)
    .composite([{ input: resizedEmblem, gravity: "center" }])
    .png()
    .toBuffer();

  fs.writeFileSync("src/app/icon.png", icon512);
  fs.writeFileSync("public/icon.png", icon512);
  fs.writeFileSync("public/images/logo-icon.png", icon512);
  console.log("Saved 512x512 icon.png & logo-icon.png");

  const apple180 = await sharp(icon512).resize(180, 180).png().toBuffer();
  fs.writeFileSync("src/app/apple-icon.png", apple180);
  fs.writeFileSync("public/apple-icon.png", apple180);
  console.log("Saved apple-icon.png");

  const p16 = await sharp(icon512).resize(16, 16).png().toBuffer();
  const p32 = await sharp(icon512).resize(32, 32).png().toBuffer();
  const p48 = await sharp(icon512).resize(48, 48).png().toBuffer();

  function createIco(pngBuffers) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngBuffers.length, 4);

    let offset = 6 + 16 * pngBuffers.length;
    const directoryEntries = [];
    for (const b of pngBuffers) {
      const entry = Buffer.alloc(16);
      const width = b === p16 ? 16 : b === p32 ? 32 : 48;
      const height = width;
      entry.writeUInt8(width === 256 ? 0 : width, 0);
      entry.writeUInt8(height === 256 ? 0 : height, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(b.length, 8);
      entry.writeUInt32LE(offset, 12);
      offset += b.length;
      directoryEntries.push(entry);
    }
    return Buffer.concat([header, ...directoryEntries, ...pngBuffers]);
  }

  const icoBuf = createIco([p16, p32, p48]);
  fs.writeFileSync("src/app/favicon.ico", icoBuf);
  fs.writeFileSync("public/favicon.ico", icoBuf);
  console.log("Saved favicon.ico (multi-resolution 16/32/48)");
}

generateAllIcons().catch(console.error);
