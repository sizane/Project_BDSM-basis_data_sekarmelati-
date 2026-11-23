export declare function todayWIB(now?: Date): string;
export declare function currentPeriodWIB(now?: Date): {
    bulan: number;
    tahun: number;
};
export declare function isValidDateString(value: string): boolean;
/** 'YYYY-MM-DD' -> Date UTC tengah malam (driver mssql memakai UTC, jadi tanggalnya tidak bergeser). */
export declare function toSqlDate(value: string): Date;
export declare function formatSqlDate(value: Date | string | null | undefined): string | null;
/** Awal bulan (inklusif) dan awal bulan berikutnya (eksklusif), keduanya sebagai Date UTC. */
export declare function monthRange(bulan: number, tahun: number): {
    start: Date;
    end: Date;
};
/** Awal hari WIB untuk 'YYYY-MM-DD' sebagai instant UTC (untuk filter kolom DATETIME2 UTC). */
export declare function wibDayStart(value: string): Date;
export declare function wibNextDayStart(value: string): Date;
export declare function formatWibDateTime(date?: Date): string;
export declare const NAMA_BULAN: string[];
//# sourceMappingURL=date.d.ts.map