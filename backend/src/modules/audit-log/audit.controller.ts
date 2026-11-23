import type { Request, Response } from 'express';
import { sendPaginated } from '../../utils/response';
import type { ListAuditLogsQuery } from './audit.schema';
import * as auditService from './audit.service';

export async function list(req: Request, res: Response): Promise<void> {
  const query = req.validated.query as ListAuditLogsQuery;
  const { data, meta } = await auditService.listAuditLogs(query);
  sendPaginated(
    res,
    data,
    meta,
    data.length === 0
      ? 'Tidak ada riwayat aktivitas yang ditemukan pada kriteria tersebut.'
      : 'Audit log berhasil dimuat',
  );
}
