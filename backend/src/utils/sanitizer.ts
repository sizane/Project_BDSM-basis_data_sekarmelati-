/**
 * Sanitasi teks bebas (nama pelanggan, rincian pesanan, keterangan) sebelum disimpan
 * sebagai lapisan XSS tambahan (TSD 6.2). React tetap meng-escape output di frontend.
 */
const CONTROL_CHARS_SINGLE_LINE = /[\u0000-\u001F\u007F]/g;
const CONTROL_CHARS_MULTI_LINE = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g;

export function sanitizeText(input: string, options: { multiline?: boolean } = {}): string {
  let text = input.normalize('NFC');
  text = text.replace(/<[^>]*>/g, ''); // buang tag HTML utuh
  text = text.replace(/[<>]/g, '');    // buang sisa tanda kurung sudut
  text = text.replace(options.multiline ? CONTROL_CHARS_MULTI_LINE : CONTROL_CHARS_SINGLE_LINE, ' ');
  text = text.replace(/[ \t]+/g, ' ');
  return text.trim();
}

/** Nomor kontak: buang spasi, tanda hubung, titik, dan tanda kurung. */
export function normalizePhone(input: string): string {
  return input.replace(/[\s\-().]/g, '');
}

/** Escape karakter spesial LIKE; pakai bersama klausa ESCAPE '!'. */
export function escapeLike(input: string): string {
  return input.replace(/[!%_[]/g, (c) => `!${c}`);
}
