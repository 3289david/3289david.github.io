// Build-only image preparation. Source images remain unchanged in public/images.
import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PLAN = 'revamp.images.json';
const OUTPUT = 'public/images/responsive';
const GENERATED = 'lib/revamp-images.generated.json';
const CACHE = process.env.REVAMP_IMAGE_CACHE_DIR || path.join(ROOT, '.revamp/image-cache');
const VERSION = 'revamp-webp-v1-q86-effort3';
const MAX_INPUT_BYTES = 8 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const hash = (value) => createHash('sha256').update(value).digest('hex');
const missing = (error) => error?.code === 'ENOENT';
const report = { event: 'images.prepared', placements: 0, encoded: 0, reused: 0, sourceBytes: 0, outputBytes: 0 };

async function safePath(relative, allowMissing = false) {
  const absolute = path.resolve(ROOT, relative);
  if (!absolute.startsWith(ROOT + path.sep)) throw new Error('Image path escapes the project: ' + relative);
  let current = ROOT;
  for (const segment of path.relative(ROOT, absolute).split(path.sep)) {
    current = path.join(current, segment);
    try {
      if ((await fs.lstat(current)).isSymbolicLink()) throw new Error('Image path contains a symlink: ' + relative);
    } catch (error) {
      if (allowMissing && missing(error)) continue;
      throw error;
    }
  }
  return absolute;
}

async function atomicWrite(destination, contents) {
  await fs.mkdir(path.dirname(destination), { recursive: true });
  const temporary = destination + '.' + randomUUID() + '.tmp';
  try {
    await fs.writeFile(temporary, contents);
    await fs.rename(temporary, destination);
  } finally {
    await fs.rm(temporary, { force: true });
  }
}

function validate(name, image) {
  if (!/^[a-z][a-z0-9-]{0,79}$/.test(name) || !image || typeof image !== 'object') throw new Error('Invalid image placement: ' + name);
  if (typeof image.src !== 'string' || !/^\/(?:images\/(?!responsive\/)|uploads\/)(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|jpe?g|webp|avif|gif)$/i.test(image.src)) throw new Error('Use a local source image for ' + name);
  if (!Number.isInteger(image.max_width) || image.max_width < 16 || image.max_width > 2560) throw new Error('Invalid maximum displayed width for ' + name);
  if (typeof image.sizes !== 'string' || !image.sizes.trim() || image.sizes.length > 512) throw new Error('Missing responsive layout sizes for ' + name);
  if (!['lazy', 'eager'].includes(image.loading)) throw new Error('Invalid loading mode for ' + name);
  if (image.crop && (!Number.isInteger(image.crop.width) || !Number.isInteger(image.crop.height) || image.crop.width < 1 || image.crop.height < 1 || image.crop.width > 100 || image.crop.height > 100 || !['centre', 'north', 'south', 'east', 'west'].includes(image.crop.position))) throw new Error('Invalid crop for ' + name);
}

async function pruneGenerated(outputs, cacheKeys) {
  // Restrict cleanup to our content-addressed files, even when all placements are removed.
  const files = async directory => fs.readdir(directory).catch(error => {
    if (missing(error)) return [];
    throw error;
  });
  for (const file of await files(path.join(ROOT, OUTPUT))) {
    if (/^[a-f0-9]{64}\.(webp|avif|png|jpg|gif)$/.test(file) && !outputs.has(file)) await fs.unlink(path.join(ROOT, OUTPUT, file));
  }
  for (const file of await files(CACHE)) {
    const match = /^([a-f0-9]{64})\.(bin|json)$/.exec(file);
    if (match && !cacheKeys.has(match[1])) await fs.unlink(path.join(CACHE, file));
  }
}

async function main() {
  let plan;
  try {
    const planPath = await safePath(PLAN);
    if ((await fs.stat(planPath)).size > 512 * 1024) throw new Error('Image plan is too large');
    plan = JSON.parse(await fs.readFile(planPath, 'utf8'));
  } catch (error) {
    if (missing(error)) return;
    throw error;
  }
  if (plan.version !== 1 || !plan.images || typeof plan.images !== 'object' || Array.isArray(plan.images)) throw new Error('Invalid image plan');
  const entries = Object.entries(plan.images);
  if (entries.length > 1024) throw new Error('Image plan has too many placements');
  for (const [name, image] of entries) validate(name, image);
  await safePath(OUTPUT, true);
  await safePath(GENERATED, true);
  // Empty plans don't load Sharp or create a persistent cache.
  if (entries.length === 0) {
    await atomicWrite(path.join(ROOT, GENERATED), '{}\n');
    await pruneGenerated(new Set(), new Set());
    console.error(JSON.stringify(report));
    return;
  }
  const { default: sharp } = await import('sharp');
  sharp.concurrency(1);
  const prepared = {};
  const outputs = new Set();
  const sourceHashes = new Set();
  const cacheKeys = new Set();
  const jobs = new Map();
  const outDir = path.join(ROOT, OUTPUT);
  await fs.mkdir(outDir, { recursive: true });
  await fs.mkdir(CACHE, { recursive: true });

  async function variant(bytes, sourceHash, image, width, height, metadata) {
    const preserve = (metadata.pages ?? 1) > 1;
    const key = hash(JSON.stringify([VERSION, sourceHash, preserve ? 'animated-original' : width, preserve ? null : height, preserve ? null : image.crop?.position ?? null]));
    if (jobs.has(key)) return jobs.get(key);
    const work = (async () => {
      cacheKeys.add(key);
      const dataPath = path.join(CACHE, key + '.bin');
      const metaPath = path.join(CACHE, key + '.json');
      let info;
      let data;
      try {
        const cachedMeta = await fs.lstat(metaPath);
        const cachedData = await fs.lstat(dataPath);
        if (cachedMeta.isSymbolicLink() || cachedData.isSymbolicLink() || cachedMeta.size > 4096 || cachedData.size > MAX_INPUT_BYTES) throw new Error('Invalid image cache entry');
        info = JSON.parse(await fs.readFile(metaPath, 'utf8'));
        data = await fs.readFile(dataPath);
        if (info.digest !== hash(data) || !['webp', 'avif', 'png', 'jpg', 'gif'].includes(info.extension) || !Number.isInteger(info.width) || !Number.isInteger(info.height) || info.width < 1 || info.height < 1) throw new Error('Invalid image cache entry');
        report.reused++;
      } catch (error) {
        if (!missing(error)) console.error(JSON.stringify({ event: 'images.cache_rebuilt', key, reason: error.message }));
        if (preserve) {
          data = bytes;
          info = { width: metadata.width, height: metadata.pageHeight || metadata.height, extension: metadata.format === 'jpeg' ? 'jpg' : metadata.format };
        } else {
          const transformed = await sharp(bytes, { limitInputPixels: MAX_PIXELS, failOn: 'error' })
            .autoOrient()
            .resize({ width, ...(height ? { height, fit: 'cover', position: image.crop.position } : {}), withoutEnlargement: true })
            .webp({ quality: 86, effort: 3 })
            .toBuffer({ resolveWithObject: true });
          data = transformed.data;
          info = { width: transformed.info.width, height: transformed.info.height, extension: 'webp' };
          // Already-small images must not become heavier merely by re-encoding.
          if (!image.crop && data.length >= bytes.length && width >= metadata.autoOrient.width && (!metadata.orientation || metadata.orientation === 1)) {
            data = bytes;
            info = { width: metadata.width, height: metadata.height, extension: metadata.format === 'jpeg' ? 'jpg' : metadata.format };
          }
          report.encoded++;
        }
        info.digest = hash(data);
        await atomicWrite(dataPath, data);
        await atomicWrite(metaPath, JSON.stringify(info));
      }
      const filename = info.digest + '.' + info.extension;
      if (!outputs.has(filename)) {
        await atomicWrite(path.join(outDir, filename), data);
        outputs.add(filename);
        report.outputBytes += data.length;
      }
      return { src: '/images/responsive/' + filename, width: info.width, height: info.height, bytes: data.length };
    })();
    jobs.set(key, work);
    return work;
  }

  // Bounded memory: decode only one source/variant at a time, never a whole gallery.
  for (const [name, image] of entries) {
    try {
      const source = await safePath('public' + image.src);
      const stat = await fs.stat(source);
      if (!stat.isFile() || stat.size === 0 || stat.size > MAX_INPUT_BYTES) throw new Error('Invalid or oversized image: ' + image.src);
      const bytes = await fs.readFile(source);
      const sourceHash = hash(bytes);
      if (!sourceHashes.has(sourceHash)) { report.sourceBytes += bytes.length; sourceHashes.add(sourceHash); }
      const metadata = await sharp(bytes, { limitInputPixels: MAX_PIXELS, failOn: 'error' }).metadata();
      if (!['jpeg', 'png', 'webp', 'avif', 'heif', 'gif'].includes(metadata.format)) throw new Error('Unsupported image format: ' + image.src);
      // Sharp reports AVIF containers as heif. Preserve it with its actual public extension.
      if (metadata.format === 'heif') metadata.format = 'avif';
      const original = metadata.autoOrient ?? { width: metadata.width, height: metadata.height };
      metadata.autoOrient = original;
      const ratio = image.crop ? image.crop.width / image.crop.height : original.width / original.height;
      const maxSourceWidth = Math.max(1, Math.floor(Math.min(original.width, image.crop ? original.height * ratio : original.width)));
      const widths = [...new Set([Math.ceil(image.max_width / 2), image.max_width, image.max_width * 2].map(w => Math.min(w, maxSourceWidth, 2560)))].sort((a, b) => a - b);
      const variants = [];
      for (const width of widths) {
        const result = await variant(bytes, sourceHash, image, width, image.crop ? Math.max(1, Math.round(width / ratio)) : null, metadata);
        if (!variants.some(v => v.width === result.width)) variants.push(result);
      }
      const fallback = variants.find(v => v.width >= Math.min(image.max_width, maxSourceWidth)) ?? variants.at(-1);
      prepared[name] = {
        src: fallback.src,
        width: fallback.width,
        height: fallback.height,
        ...(variants.length > 1 ? { srcSet: variants.map(v => v.src + ' ' + v.width + 'w').join(', ') } : {}),
      };
      report.placements++;
    } catch (cause) {
      const error = new Error(`Image preparation failed for "${name}" (public${image.src}): ${cause.message}. Repair or replace this source image; do not remove unrelated images or change the design to hide the failure.`, { cause });
      error.code = 'EIMAGE_PREPARATION';
      console.error(JSON.stringify({ event: 'images.failed', code: error.code, placement: name, path: 'public' + image.src, reason: cause.message }));
      throw error;
    }
  }
  await atomicWrite(path.join(ROOT, GENERATED), JSON.stringify(prepared, null, 2) + '\n');
  await pruneGenerated(outputs, cacheKeys);
  console.error(JSON.stringify(report));
}

await main();
