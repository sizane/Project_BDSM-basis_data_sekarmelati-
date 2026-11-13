import PDFDocument from 'pdfkit';
import { formatWibDateTime, NAMA_BULAN } from '../../utils/date';
import type { LabaRugi, LevelUtangItem } from './laporan.service';

/** Nominal Rupiah dengan pemisah titik ribuan, contoh: Rp 150.000 (BR-25). */
export function formatRupiah(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const grouped = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${value < 0 ? '-' : ''}Rp ${grouped}`;
}

const COMPANY_NAME = 'CV SEKAR MELATI';
const MARGIN = 50;

function render(title: string, build: (doc: PDFKit.PDFDocument) => void): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      info: { Title: title, Author: COMPANY_NAME, Producer: COMPANY_NAME },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try {
      build(doc);
      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/** Header resmi CV Sekar Melati (BR-25). */
function drawHeader(doc: PDFKit.PDFDocument, subtitle: string, periode?: string): void {
  doc.font('Helvetica-Bold').fontSize(18).text(COMPANY_NAME, { align: 'center' });
  doc.moveDown(0.2);
  doc.font('Helvetica-Bold').fontSize(13).text(subtitle, { align: 'center' });
  if (periode) {
    doc.font('Helvetica').fontSize(11).text(periode, { align: 'center' });
  }
  doc.moveDown(0.6);
  const y = doc.y;
  doc.moveTo(MARGIN, y).lineTo(doc.page.width - MARGIN, y).lineWidth(1.5).stroke();
  doc.moveDown(1);
}

function drawFooter(doc: PDFKit.PDFDocument, printedBy: string): void {
  doc.font('Helvetica').fontSize(8).fillColor('#555555');
  doc.text(`Dicetak ${formatWibDateTime()} oleh ${printedBy}`, MARGIN, doc.page.height - MARGIN + 10, {
    align: 'left',
    lineBreak: false,
  });
  doc.fillColor('#000000');
}

export function generateLabaRugiPdf(data: LabaRugi, printedBy: string): Promise<Buffer> {
  const periode = `Periode: ${NAMA_BULAN[data.bulan - 1]} ${data.tahun}`;
  return render(`Laporan Laba/Rugi ${periode}`, (doc) => {
    drawHeader(doc, 'LAPORAN LABA / RUGI', periode);

    const left = MARGIN;
    const right = doc.page.width - MARGIN;
    const rows: Array<[string, string, boolean]> = [
      ['Total Pemasukan (pembayaran diterima)', formatRupiah(data.total_pemasukan), false],
      ['Total Pengeluaran Operasional', formatRupiah(data.total_pengeluaran), false],
      [data.laba_rugi_bersih < 0 ? 'Rugi Bersih' : 'Laba Bersih', formatRupiah(data.laba_rugi_bersih), true],
    ];

    for (const [label, amount, bold] of rows) {
      const y = doc.y;
      if (bold) {
        doc.moveTo(left, y).lineTo(right, y).lineWidth(0.8).stroke();
        doc.moveDown(0.4);
      }
      const textY = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(12);
      doc.text(label, left, textY, { width: 300, lineBreak: false });
      doc.text(amount, left + 300, textY, { width: right - left - 300, align: 'right', lineBreak: false });
      doc.moveDown(1.2);
    }

    if (!data.ada_transaksi) {
      doc.moveDown(0.5);
      doc.font('Helvetica-Oblique').fontSize(10).text('Belum ada transaksi tercatat pada bulan ini.', left);
    }
    drawFooter(doc, printedBy);
  });
}

export function generateLevelUtangPdf(rows: LevelUtangItem[], printedBy: string, filterLevel?: string): Promise<Buffer> {
  return render('Laporan Level Utang', (doc) => {
    drawHeader(doc, 'LAPORAN LEVEL UTANG PELANGGAN', filterLevel ? `Filter level: ${filterLevel}` : undefined);

    const columns = [
      { title: 'Pelanggan', width: 150, align: 'left' as const },
      { title: 'Total Piutang', width: 95, align: 'right' as const },
      { title: 'Frekuensi', width: 85, align: 'left' as const },
      { title: 'Telat (hari)', width: 70, align: 'right' as const },
      { title: 'Level', width: 95, align: 'left' as const },
    ];
    const bottomLimit = doc.page.height - MARGIN - 30;

    const drawRow = (cells: string[], bold: boolean): void => {
      let x = MARGIN;
      const y = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
      columns.forEach((col, i) => {
        doc.text(cells[i], x + 2, y, { width: col.width - 6, align: col.align, lineBreak: false, ellipsis: true });
        x += col.width;
      });
      doc.y = y + 16;
      if (bold) {
        doc.moveTo(MARGIN, doc.y - 3).lineTo(MARGIN + 495, doc.y - 3).lineWidth(0.8).stroke();
      }
    };

    if (rows.length === 0) {
      doc.font('Helvetica-Oblique').fontSize(11).text('Belum ada data piutang pelanggan untuk dianalisis.', MARGIN);
    } else {
      drawRow(columns.map((c) => c.title), true);
      for (const r of rows) {
        if (doc.y > bottomLimit) {
          doc.addPage();
          drawRow(columns.map((c) => c.title), true);
        }
        drawRow(
          [
            r.nama_customer,
            formatRupiah(r.total_piutang),
            r.frekuensi_utang_kategori,
            String(r.hari_keterlambatan),
            r.level_utang,
          ],
          false,
        );
      }
    }
    drawFooter(doc, printedBy);
  });
}
