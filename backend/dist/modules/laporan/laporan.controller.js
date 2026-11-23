import { AppError, ERRORS } from '../../constants/error-codes';
import { logger } from '../../utils/logger';
import { sendPaginated, sendSuccess } from '../../utils/response';
import * as laporanService from './laporan.service';
import { generateLabaRugiPdf, generateLevelUtangPdf } from './pdf-generator.service';
/**
 * LaporanController: Controller berbasis OOP untuk modul Laporan dan Ekspor PDF.
 */
export class LaporanController {
    labaRugi = async (req, res) => {
        const { bulan, tahun } = req.validated.query;
        const { ada_transaksi, ...data } = await laporanService.getLabaRugi(bulan, tahun);
        sendSuccess(res, data, ada_transaksi ? 'Laporan laba/rugi berhasil dimuat' : 'Belum ada transaksi tercatat pada bulan ini');
    };
    levelUtang = async (req, res) => {
        const { level, page, per_page } = req.validated.query;
        const { data, meta } = await laporanService.listLevelUtang(level, page, per_page);
        sendPaginated(res, data, meta, data.length === 0 && !level
            ? 'Belum ada data piutang pelanggan untuk dianalisis'
            : 'Laporan level utang berhasil dimuat');
    };
    exportPdf = async (req, res) => {
        if (!req.user)
            throw new AppError(ERRORS.AUTH_REQUIRED);
        const { jenis } = req.validated.params;
        const query = req.validated.query;
        let buffer;
        let filename;
        if (jenis === 'laba-rugi') {
            if (query.bulan === undefined)
                throw new AppError(ERRORS.VAL_REQUIRED, 'Pilih bulan laporan yang valid');
            if (query.tahun === undefined)
                throw new AppError(ERRORS.VAL_REQUIRED, 'Pilih tahun laporan yang valid');
            const data = await laporanService.getLabaRugi(query.bulan, query.tahun);
            try {
                buffer = await generateLabaRugiPdf(data, req.user.fullName);
            }
            catch (err) {
                logger.error('Gagal membuat PDF laba/rugi', err);
                throw new AppError(ERRORS.SYS_PDF, undefined, { cause: err });
            }
            filename = `laporan-laba-rugi-${query.tahun}-${String(query.bulan).padStart(2, '0')}.pdf`;
        }
        else {
            const rows = await laporanService.listAllLevelUtang(query.level);
            try {
                buffer = await generateLevelUtangPdf(rows, req.user.fullName, query.level);
            }
            catch (err) {
                logger.error('Gagal membuat PDF level utang', err);
                throw new AppError(ERRORS.SYS_PDF, undefined, { cause: err });
            }
            filename = 'laporan-level-utang.pdf';
        }
        res
            .status(200)
            .set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': String(buffer.length),
            'Cache-Control': 'no-store',
        })
            .end(buffer);
    };
}
export const laporanController = new LaporanController();
export const labaRugi = laporanController.labaRugi;
export const levelUtang = laporanController.levelUtang;
export const exportPdf = laporanController.exportPdf;
//# sourceMappingURL=laporan.controller.js.map