import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const INK = [0x12, 0x22, 0x2a];
const BRASS = [0xc9, 0x90, 0x2b];

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function png(size, getPixel) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[(size * 3 + 1) * y] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = getPixel(x, y, size);
      const i = (size * 3 + 1) * y + 1 + x * 3;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function mark(x, y, size, maskable) {
  const nx = x / (size - 1);
  const ny = y / (size - 1);
  const inset = maskable ? 0.12 : 0.0;
  if (maskable && (nx < inset || nx > 1 - inset || ny < inset || ny > 1 - inset)) {
    return INK;
  }
  const line = 0.62;
  const thickness = maskable ? 0.018 : 0.014;
  if (Math.abs(ny - line) < thickness && nx > 0.12 && nx < 0.88) return BRASS;
  const cx = 0.78;
  const cy = line;
  const dx = nx - cx;
  const dy = ny - cy;
  if (dx * dx + dy * dy < (maskable ? 0.004 : 0.0032)) return BRASS;
  return INK;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "public", "icons");
mkdirSync(dir, { recursive: true });

writeFileSync(join(dir, "icon-192.png"), png(192, (x, y, s) => mark(x, y, s, false)));
writeFileSync(join(dir, "icon-512.png"), png(512, (x, y, s) => mark(x, y, s, false)));
writeFileSync(join(dir, "icon-512-maskable.png"), png(512, (x, y, s) => mark(x, y, s, true)));
console.log("wrote icons to", dir);
