export declare function sanitizeText(input: string, options?: {
    multiline?: boolean;
}): string;
/** Nomor kontak: buang spasi, tanda hubung, titik, dan tanda kurung. */
export declare function normalizePhone(input: string): string;
/** Escape karakter spesial LIKE; pakai bersama klausa ESCAPE '!'. */
export declare function escapeLike(input: string): string;
//# sourceMappingURL=sanitizer.d.ts.map