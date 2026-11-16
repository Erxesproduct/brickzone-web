import sharp from "sharp";
const out = process.argv[2];
// default: an arrow made like a red plastic brick, with a stud on it
const arrow = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M4 2.5v22.5l6-5.6 4.2 9 4.4-2-4.1-8.8h8.3Z" fill="#e2283a" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M5.6 6.3v15l4.6-4.3" fill="none" stroke="#ff6b78" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M14.4 16.6l4 8.6M10.4 19.6l-4.6 4.2" fill="none" stroke="#a8172a" stroke-width="1.3" stroke-linecap="round"/>
  <circle cx="9.6" cy="13.2" r="2.6" fill="#f0475a" stroke="#a8172a" stroke-width="1"/>
  <circle cx="9" cy="12.6" r="0.9" fill="#ff9aa4"/>
</svg>`;
// links and buttons: a yellow minifigure C-hand, open towards the top-left (the hotspot)
const hand = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <path d="M18 18l8.5 8.5" stroke="#3b2c06" stroke-width="9.5" stroke-linecap="round"/>
  <path d="M18 18l8.5 8.5" stroke="#f8c51c" stroke-width="6.5" stroke-linecap="round"/>
  <path d="M11.4 4.4A8 8 0 1 1 4.4 11.4" fill="none" stroke="#3b2c06" stroke-width="8.2" stroke-linecap="round"/>
  <path d="M11.4 4.4A8 8 0 1 1 4.4 11.4" fill="none" stroke="#f8c51c" stroke-width="5.2" stroke-linecap="round"/>
  <path d="M15.5 6.8a6 6 0 0 1 3.6 4.4" fill="none" stroke="#fff3b8" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M20 21.5l5 5" stroke="#d9a400" stroke-width="1.6" stroke-linecap="round"/>
</svg>`;
for (const [name, svg] of [["brick", arrow], ["hand", hand]]) {
  await sharp(Buffer.from(svg), { density: 72 }).png().toFile(`${out}/${name}.png`);
  await sharp(Buffer.from(svg), { density: 144 }).png().toFile(`${out}/${name}@2x.png`);
}
