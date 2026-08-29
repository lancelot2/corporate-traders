import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { fal } from '@fal-ai/client';
import { imagePresets } from './image-presets.mjs';

const [, , ...args] = process.argv;
const outputDirectory = resolve(process.cwd(), 'public/generated');

try {
  process.loadEnvFile(resolve(process.cwd(), '.env.local'));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}

function option(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const presetName = option('--preset');
const preset = presetName ? imagePresets[presetName] : undefined;
const inputImage = option('--input');
const customModel = option('--model');
const positional = args.filter((value, index) => !['--preset', '--input', '--model', '--output'].includes(value) && !['--preset', '--input', '--model', '--output'].includes(args[index - 1]));
const requestedName = option('--output') ?? (!preset ? positional[1] : undefined);
const prompt = preset?.prompt ?? positional[0];

if (presetName && !preset) {
  console.error(`Unknown preset "${presetName}". Available presets: ${Object.keys(imagePresets).join(', ')}`);
  process.exit(1);
}

if (!prompt) {
  console.error('Usage: npm run generate:image -- "your image prompt" [file-name]');
  console.error('   or: npm run generate:image -- --preset simpson-headshot --input ./reference.jpg --output profile-name');
  process.exit(1);
}

function safeFileStem(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'generated-image';
}

function extensionFor(contentType) {
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  return 'jpg';
}

function mediaTypeFor(filePath) {
  const extension = extname(filePath).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  return 'image/jpeg';
}

async function referenceImage(filePath) {
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const bytes = await readFile(resolve(process.cwd(), filePath));
  return new File([bytes], basename(filePath), { type: mediaTypeFor(filePath) });
}

const model = customModel || preset?.model || process.env.FAL_IMAGE_MODEL || 'fal-ai/fast-sdxl';
if (preset && !inputImage) {
  console.error(`The ${presetName} preset needs a reference image. Add --input ./path/to/photo.jpg.`);
  process.exit(1);
}

if (!process.env.FAL_KEY) {
  console.error('FAL_KEY is missing. Export it in your shell or add it to frontend/.env.local.');
  process.exit(1);
}

fal.config({ credentials: process.env.FAL_KEY });

console.log(`Generating with ${model}…`);
const input = { prompt };
if (inputImage) input.image_urls = [await referenceImage(inputImage)];
if (preset?.imageSize) input.image_size = preset.imageSize;
const result = await fal.subscribe(model, { input });
const image = result.data?.images?.[0];

if (!image?.url) {
  throw new Error('fal did not return an image URL. Check the selected model and prompt.');
}

const response = await fetch(image.url);
if (!response.ok) throw new Error(`Could not download fal image (${response.status}).`);

const contentType = response.headers.get('content-type')?.split(';')[0] ?? image.content_type;
const fileName = `${safeFileStem(requestedName || prompt)}.${extensionFor(contentType)}`;
const outputPath = resolve(outputDirectory, fileName);

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, new Uint8Array(await response.arrayBuffer()));

console.log(`Saved ${outputPath}`);
console.log(`Use it in the app as /generated/${fileName}`);
