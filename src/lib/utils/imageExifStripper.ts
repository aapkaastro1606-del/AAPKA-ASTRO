/**
 * Pure TypeScript Image EXIF & Metadata Stripper
 * Zero native binary dependencies — runs seamlessly in Next.js Serverless, Node, and Edge runtimes.
 * Strips EXIF, XMP, IPTC, and comment segments from JPEG, PNG, and WebP buffers without quality degradation.
 */

/**
 * Strips EXIF metadata from a JPEG buffer.
 * Removes APP1 (Exif/XMP), APP13 (Photoshop/IPTC), and COM (Comment) segments.
 */
export function stripJpegExif(buffer: Buffer): Buffer {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer; // Not a valid JPEG
  }

  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      // Misaligned or scan data reached, slice the rest
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Skip consecutive 0xFF padding
    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset++;
    }

    if (offset >= buffer.length) break;

    const marker = buffer[offset];
    offset++;

    // Standalone markers with no payload
    if (marker === 0xd9) {
      // EOI (End of Image)
      chunks.push(Buffer.from([0xff, 0xd9]));
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      // TEM or RST0-RST7
      chunks.push(Buffer.from([0xff, marker]));
      continue;
    }

    if (offset + 2 > buffer.length) {
      chunks.push(buffer.subarray(offset - 2));
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset);
    const segmentEnd = offset + segmentLength;

    if (segmentEnd > buffer.length) {
      chunks.push(buffer.subarray(offset - 2));
      break;
    }

    // APP1 (Exif/XMP: 0xE1), APP13 (Photoshop IPTC: 0xED), COM (Comment: 0xFE)
    const isExifOrMetadata = marker === 0xe1 || marker === 0xed || marker === 0xfe;

    if (!isExifOrMetadata) {
      // Retain segment
      chunks.push(Buffer.from([0xff, marker]));
      chunks.push(buffer.subarray(offset, segmentEnd));
    }

    // If Start Of Scan (SOS: 0xDA), all remaining bytes until EOI are image data
    if (marker === 0xda) {
      chunks.push(buffer.subarray(segmentEnd));
      break;
    }

    offset = segmentEnd;
  }

  return Buffer.concat(chunks);
}

/**
 * Strips EXIF and metadata chunks from a PNG buffer.
 * Removes eXIf, tEXt, zTXt, and iTXt chunks.
 */
export function stripPngExif(buffer: Buffer): Buffer {
  const PNG_HEADER = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(PNG_HEADER)) {
    return buffer; // Not a valid PNG
  }

  const chunks: Buffer[] = [PNG_HEADER];
  let offset = 8;

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32BE(offset);
    const chunkType = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const totalChunkLength = 12 + chunkLength; // 4 (length) + 4 (type) + chunkLength + 4 (crc)

    if (offset + totalChunkLength > buffer.length) {
      // Trailing corrupted data; copy as-is
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Strip eXIf, tEXt, zTXt, iTXt
    const isMetadataChunk = ["eXIf", "tEXt", "zTXt", "iTXt"].includes(chunkType);

    if (!isMetadataChunk) {
      chunks.push(buffer.subarray(offset, offset + totalChunkLength));
    }

    offset += totalChunkLength;

    if (chunkType === "IEND") {
      break;
    }
  }

  return Buffer.concat(chunks);
}

/**
 * Strips EXIF and XMP chunks from a WebP buffer.
 */
export function stripWebpExif(buffer: Buffer): Buffer {
  if (
    buffer.length < 12 ||
    buffer.subarray(0, 4).toString("ascii") !== "RIFF" ||
    buffer.subarray(8, 12).toString("ascii") !== "WEBP"
  ) {
    return buffer; // Not a valid WebP
  }

  const chunks: Buffer[] = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const chunkHeader = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const paddedSize = chunkSize % 2 === 1 ? chunkSize + 1 : chunkSize;
    const totalChunkLength = 8 + paddedSize;

    if (offset + totalChunkLength > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Strip EXIF and XMP chunks
    if (chunkHeader !== "EXIF" && chunkHeader !== "XMP ") {
      chunks.push(buffer.subarray(offset, offset + totalChunkLength));
    }

    offset += totalChunkLength;
  }

  const payload = Buffer.concat(chunks);
  const newRiffSize = Buffer.alloc(4);
  newRiffSize.writeUInt32LE(payload.length + 4, 0); // 4 for 'WEBP'

  return Buffer.concat([
    Buffer.from("RIFF", "ascii"),
    newRiffSize,
    Buffer.from("WEBP", "ascii"),
    payload,
  ]);
}

/**
 * High-level sanitization function that detects image mime type and strips EXIF data.
 */
export function stripExifData(buffer: Buffer, mimeType?: string): Buffer {
  if (!buffer || buffer.length === 0) return buffer;

  const mime = (mimeType || "").toLowerCase();

  // Check magic numbers first
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return stripJpegExif(buffer);
  }

  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return stripPngExif(buffer);
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return stripWebpExif(buffer);
  }

  // Fallback by MIME type string
  if (mime.includes("jpeg") || mime.includes("jpg")) {
    return stripJpegExif(buffer);
  }
  if (mime.includes("png")) {
    return stripPngExif(buffer);
  }
  if (mime.includes("webp")) {
    return stripWebpExif(buffer);
  }

  return buffer;
}
