import sharp from 'sharp';

const SIZE = 512;
const source = 'public/brand/memoland-journey-logo-v3.png';

function backgroundSvg() {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
      <defs>
        <radialGradient id="glow" cx="50%" cy="42%" r="72%">
          <stop offset="0" stop-color="#1765a0"/>
          <stop offset="0.5" stop-color="#0b315e"/>
          <stop offset="1" stop-color="#05142f"/>
        </radialGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#52d8ff" stop-opacity="0.52"/>
          <stop offset="0.48" stop-color="#184e84" stop-opacity="0.14"/>
          <stop offset="1" stop-color="#f7c94f" stop-opacity="0.48"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#glow)"/>
      <circle cx="256" cy="250" r="206" fill="#123f70" fill-opacity="0.2" stroke="url(#rim)" stroke-width="7"/>
      <circle cx="256" cy="250" r="184" fill="none" stroke="#8bdfff" stroke-opacity="0.13" stroke-width="2"/>
      <g fill="#ffe279">
        <path d="M70 104l4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>
        <path d="M442 376l3 8 8 3-8 3-3 8-3-8-8-3 8-3z"/>
      </g>
      <g fill="#87e6ff">
        <circle cx="420" cy="112" r="4"/>
        <circle cx="91" cy="389" r="3"/>
      </g>
    </svg>
  `);
}

async function render(output, logoWidth) {
  const logo = await sharp(source)
    .resize({ width: logoWidth, withoutEnlargement: true })
    .png()
    .toBuffer();

  await sharp(backgroundSvg())
    .composite([{ input: logo, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toFile(output);
}

await render('public/brand/app-icon-logo-v1.png', 468);
await render('public/brand/app-icon-logo-maskable-v1.png', 398);
