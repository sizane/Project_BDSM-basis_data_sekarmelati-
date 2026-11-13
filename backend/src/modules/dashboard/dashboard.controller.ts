import type { Request, Response } from 'express';
import { sendSuccess } from '../../utils/response';
import * as dashboardService from './dashboard.service';

export async function summary(_req: Request, res: Response): Promise<void> {
  sendSuccess(res, await dashboardService.getSummary(), 'Data dashboard berhasil dimuat');
}
