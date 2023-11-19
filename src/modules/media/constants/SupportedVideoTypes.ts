export enum SupportedVideoTypes {
  wmv = 'wmv',
  avi = 'avi',
  avchd = 'avchd',
  flv = 'flv',
  f4v = 'f4v',
  swf = 'swf',
  mkv = 'mkv',
  webm = 'webm',
  mp4 = 'mp4',
  mov = 'mov',
  quicktime = 'quicktime',
}

export function getSupportedVideoTypes() {
  return Object.keys(SupportedVideoTypes).map((type) => `video/${type}`);
}
