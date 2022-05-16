export function encode({ str, encoding }: { str: string; encoding: 'base64' }): string {
  return Buffer.from(str, 'binary').toString(encoding);
}
