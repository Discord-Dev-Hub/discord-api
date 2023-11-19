export enum SupportedImageTypes {
  peg = 'peg',
  png = 'png',
  webp = 'webp',
  tiff = 'tiff',
  gif = 'gif',
  svg = 'svg',
  jpeg = 'jpeg',
  avif = 'avif',
}

export function getSupportedImagesTypes() {
  return Object.values(SupportedImageTypes).map((type) => `image/${type}`);
}
