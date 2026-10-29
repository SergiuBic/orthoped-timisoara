import sharp from "sharp";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];

/** EXIF-rotate, resize to max 1600px, convert to webp, strip metadata (sharp strips by default). */
export async function processImage(input: Buffer) {
  const { data, info } = await sharp(input, { limitInputPixels: 64_000_000 })
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}
