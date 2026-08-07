// הופך רקע לבן לשקוף בעזרת flood-fill מהשוליים.
// אותיות לבנות פנימיות (LAND) עטופות בקו מתאר כהה — לא נמחקות.
import sharp from 'sharp';

async function makeTransparent(inFile, outFile) {
  const { data, info } = await sharp(inFile)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels } = info;
  const isWhite = (i) => data[i] > 236 && data[i + 1] > 236 && data[i + 2] > 236;
  const visited = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const p = y * W + x;
    if (visited[p]) return;
    visited[p] = 1;
    if (isWhite(p * channels)) stack.push(p);
  };
  // מתחילים מכל השוליים
  for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
  for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
  while (stack.length) {
    const p = stack.pop();
    const x = p % W, y = (p / W) | 0;
    data[p * channels + 3] = 0; // שקוף
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }
  await sharp(data, { raw: { width: W, height: H, channels } })
    .png({ compressionLevel: 9 })
    .toFile(outFile);
  console.log('transparent:', outFile);
}

await makeTransparent('public/logo.png', 'public/logo.png');
await makeTransparent('public/logo-compact.png', 'public/logo-compact.png');
