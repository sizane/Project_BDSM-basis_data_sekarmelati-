/** Spesifikasi OpenAPI 3.0 untuk Swagger UI di /api-docs. */

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: ref('ErrorResponse') } },
});
const ok = (description: string, data: object = {}) => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [ref('SuccessEnvelope'), { type: 'object', properties: { data } }],
      },
    },
  },
});
const okList = (description: string, item: object) => ({
  description,
  content: {
    'application/json': {
      schema: {
        allOf: [
          ref('SuccessEnvelope'),
          { type: 'object', properties: { data: { type: 'array', items: item }, meta: ref('PaginationMeta') } },
        ],
      },
    },
  },
});

const idParam = (name = 'id') => ({ name, in: 'path', required: true, schema: { type: 'string', format: 'uuid' } });
const q = (name: string, schema: object, description?: string) => ({ name, in: 'query', required: false, schema, description });
const qReq = (name: string, schema: object, description?: string) => ({ name, in: 'query', required: true, schema, description });
const pagination = [
  q('page', { type: 'integer', minimum: 1, default: 1 }),
  q('per_page', { type: 'integer', minimum: 1, maximum: 100, default: 15 }),
];
const secured = [{ bearerAuth: [] }];
const e401 = errorResponse('ERR-AUTH-01: belum login / token tidak valid');
const e403 = errorResponse('ERR-AUTH-03: role tidak berhak (tercatat di audit log)');
const e422 = errorResponse('ERR-VAL-xx: validasi gagal');
const e503 = errorResponse('ERR-SYS-01: kegagalan database / sistem');

export const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API Sistem Pencatatan Keuangan CV Sekar Melati',
    version: '1.0.0',
    description:
      'Semua respons memakai envelope { status, data, meta, message, errors }. ' +
      'Semua endpoint selain POST /auth/login wajib header Authorization: Bearer <token>.',
  },
  servers: [{ url: '/api/v1' }],
  tags: [
    { name: 'Auth' }, { name: 'Admin' }, { name: 'Dashboard' }, { name: 'Pesanan' }, { name: 'Piutang' },
    { name: 'Riwayat Transaksi' }, { name: 'Pengeluaran' }, { name: 'Laporan' }, { name: 'Audit Log' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      SuccessEnvelope: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success'] },
          data: {},
          message: { type: 'string' },
          errors: { nullable: true, type: 'object' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['error'] },
          data: { nullable: true },
          message: { type: 'string' },
          errors: {
            type: 'object',
            properties: { code: { type: 'string', example: 'ERR-VAL-01' }, details: { type: 'array', items: { type: 'object' } } },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          current_page: { type: 'integer' }, per_page: { type: 'integer' },
          total: { type: 'integer' }, last_page: { type: 'integer' },
        },
      },
      CreatePesanan: {
        type: 'object',
        required: ['nama_customer', 'no_kontak', 'items', 'tenggat'],
        properties: {
          nama_customer: { type: 'string', maxLength: 100 },
          no_kontak: { type: 'string', example: '081234567890' },
          items: {
            type: 'array', minItems: 1, maxItems: 1,
            description: 'Saat ini tepat satu item (sp_catat_pesanan_baru menerima satu item).',
            items: {
              type: 'object', required: ['rincian_pesanan', 'kuantitas', 'harga_per_item'],
              properties: {
                rincian_pesanan: { type: 'string', maxLength: 200 },
                kuantitas: { type: 'integer', minimum: 1 },
                harga_per_item: { type: 'integer', minimum: 1 },
              },
            },
          },
          dp: { type: 'integer', minimum: 0, default: 0 },
          tenggat: { type: 'string', format: 'date', description: '>= hari ini (WIB)' },
        },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Login (FSD-2.1)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: {
            type: 'object', required: ['username', 'password'],
            properties: { username: { type: 'string', maxLength: 50 }, password: { type: 'string', minLength: 8 } },
          } } },
        },
        responses: {
          200: ok('Login berhasil', {
            type: 'object',
            properties: {
              token: { type: 'string' }, expires_in: { type: 'integer', example: 86400 },
              admin: { type: 'object', properties: { id: { type: 'string' }, full_name: { type: 'string' }, username: { type: 'string' }, role: { type: 'string', enum: ['Pemilik', 'Admin'] } } },
            },
          }),
          401: errorResponse('ERR-AUTH-02: username atau password tidak valid'),
          403: errorResponse('ERR-LOCK-01: akun dikunci 15 menit'),
          422: e422,
        },
      },
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout (token dicabut)', security: secured, responses: { 200: ok('Logout berhasil'), 401: e401 } },
    },
    '/admins': {
      get: { tags: ['Admin'], summary: 'Daftar admin (Pemilik, Admin)', security: secured, parameters: pagination, responses: { 200: okList('OK', { type: 'object' }), 401: e401, 403: e403 } },
      post: {
        tags: ['Admin'], summary: 'Buat admin baru (Pemilik)', security: secured,
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['username', 'password', 'full_name', 'role'],
          properties: {
            username: { type: 'string', minLength: 3, maxLength: 50 }, password: { type: 'string', minLength: 8 },
            full_name: { type: 'string', maxLength: 100 }, role: { type: 'string', enum: ['Pemilik', 'Admin'] },
          },
        } } } },
        responses: { 201: ok('Admin dibuat'), 401: e401, 403: e403, 409: errorResponse('ERR-CONFLICT-01: username sudah dipakai'), 422: e422 },
      },
    },
    '/admins/{id}': {
      get: { tags: ['Admin'], summary: 'Detail admin (Pemilik: semua; Admin: dirinya sendiri)', security: secured, parameters: [idParam()], responses: { 200: ok('OK'), 401: e401, 403: e403, 404: errorResponse('ERR-NOTFOUND-03') } },
    },
    '/admins/{id}/role': {
      patch: {
        tags: ['Admin'], summary: 'Ubah role (Pemilik)', security: secured, parameters: [idParam()],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['Pemilik', 'Admin'] } } } } } },
        responses: { 200: ok('Role diubah'), 401: e401, 403: e403, 404: errorResponse('ERR-NOTFOUND-03'), 409: errorResponse('ERR-CONFLICT-02: Pemilik terakhir') },
      },
    },
    '/dashboard/summary': {
      get: { tags: ['Dashboard'], summary: 'Ringkasan dashboard (SCR-02)', security: secured, responses: { 200: ok('OK', { type: 'object', properties: { total_pesanan_bulan_ini: { type: 'integer' }, total_piutang_aktif: { type: 'number' }, total_laba_rugi_bulan_ini: { type: 'number' } } }), 401: e401, 503: e503 } },
    },
    '/pesanan': {
      get: {
        tags: ['Pesanan'], summary: 'Daftar pesanan (SCR-03)', security: secured,
        parameters: [q('search', { type: 'string' }, 'Nama pelanggan / no. pesanan'), q('status_pesanan', { type: 'string', enum: ['Belum Lunas', 'Lunas'] }), ...pagination],
        responses: { 200: okList('OK', { type: 'object' }), 401: e401, 503: e503 },
      },
      post: {
        tags: ['Pesanan'], summary: 'Catat pesanan baru (FSD-2.2)', security: secured,
        requestBody: { required: true, content: { 'application/json': { schema: ref('CreatePesanan') } } },
        responses: { 201: ok('Pesanan dibuat', { type: 'object', properties: { pesanan_id: { type: 'string' }, no_pesanan: { type: 'string' }, harga_total: { type: 'number' }, sisa_piutang: { type: 'number' }, status_pesanan: { type: 'string' } } }), 401: e401, 422: e422, 503: e503 },
      },
    },
    '/pesanan/{id}': {
      get: { tags: ['Pesanan'], summary: 'Detail / nota pesanan (SCR-05)', security: secured, parameters: [idParam()], responses: { 200: ok('OK'), 401: e401, 404: errorResponse('ERR-NOTFOUND-01'), 503: e503 } },
    },
    '/pesanan/{id}/pembayaran': {
      post: {
        tags: ['Pesanan'], summary: 'Catat pembayaran (FSD-2.3)', security: secured, parameters: [idParam()],
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['tanggal_bayar', 'jumlah', 'jenis_pembayaran'],
          properties: { tanggal_bayar: { type: 'string', format: 'date' }, jumlah: { type: 'integer', minimum: 1 }, jenis_pembayaran: { type: 'string', enum: ['DP', 'Cicilan', 'Pelunasan'] } },
        } } } },
        responses: { 200: ok('Pembayaran dicatat'), 401: e401, 404: errorResponse('ERR-NOTFOUND-01'), 422: errorResponse('ERR-VAL-03 (melebihi sisa piutang) / ERR-VAL-04 (nominal <= 0)'), 503: e503 },
      },
    },
    '/piutang': {
      get: {
        tags: ['Piutang'], summary: 'Daftar piutang aktif (SCR-07)', security: secured,
        parameters: [q('search', { type: 'string' }), q('sort', { type: 'string', enum: ['sisa_terbesar', 'tenggat_terdekat'], default: 'sisa_terbesar' }), ...pagination],
        responses: { 200: okList('OK', { type: 'object' }), 401: e401, 503: e503 },
      },
    },
    '/riwayat-transaksi': {
      get: {
        tags: ['Riwayat Transaksi'], summary: 'Cari riwayat transaksi (SCR-08)', security: secured,
        parameters: [q('keyword', { type: 'string' }, 'Nama pelanggan / no. pesanan'), q('tanggal_awal', { type: 'string', format: 'date' }), q('tanggal_akhir', { type: 'string', format: 'date' }), ...pagination],
        responses: { 200: okList('OK', { type: 'object' }), 401: e401, 422: e422, 503: e503 },
      },
    },
    '/pengeluaran': {
      get: { tags: ['Pengeluaran'], summary: 'Daftar pengeluaran (SCR-09)', security: secured, parameters: pagination, responses: { 200: okList('OK', { type: 'object' }), 401: e401, 503: e503 } },
      post: {
        tags: ['Pengeluaran'], summary: 'Catat pengeluaran (FSD-2.4)', security: secured,
        requestBody: { required: true, content: { 'application/json': { schema: {
          type: 'object', required: ['tanggal_pengeluaran', 'kategori_pengeluaran', 'jumlah'],
          properties: {
            tanggal_pengeluaran: { type: 'string', format: 'date' },
            kategori_pengeluaran: { type: 'string', enum: ['Bahan Baku', 'Upah Jahit', 'Listrik', 'Lain-lain'] },
            jumlah: { type: 'integer', minimum: 1 },
            keterangan: { type: 'string', maxLength: 255, description: "Wajib bila kategori 'Lain-lain'" },
          },
        } } } },
        responses: { 201: ok('Pengeluaran dicatat'), 401: e401, 422: e422, 503: e503 },
      },
    },
    '/laporan/laba-rugi': {
      get: { tags: ['Laporan'], summary: 'Laporan laba/rugi bulanan (FSD-2.7)', security: secured, parameters: [qReq('bulan', { type: 'integer', minimum: 1, maximum: 12 }), qReq('tahun', { type: 'integer' })], responses: { 200: ok('OK'), 401: e401, 422: e422, 503: e503 } },
    },
    '/laporan/level-utang': {
      get: { tags: ['Laporan'], summary: 'Laporan level utang (Pemilik)', security: secured, parameters: [q('level', { type: 'string', enum: ['Rendah', 'Sedang', 'Tinggi', 'Kritis'] }), ...pagination], responses: { 200: okList('OK', { type: 'object' }), 401: e401, 403: e403, 503: e503 } },
    },
    '/laporan/{jenis}/export': {
      get: {
        tags: ['Laporan'], summary: 'Ekspor PDF (laba-rugi: Pemilik & Admin; level-utang: Pemilik)', security: secured,
        parameters: [
          { name: 'jenis', in: 'path', required: true, schema: { type: 'string', enum: ['laba-rugi', 'level-utang'] } },
          q('bulan', { type: 'integer' }, 'Wajib untuk laba-rugi'), q('tahun', { type: 'integer' }, 'Wajib untuk laba-rugi'),
          q('level', { type: 'string', enum: ['Rendah', 'Sedang', 'Tinggi', 'Kritis'] }, 'Opsional untuk level-utang'),
        ],
        responses: { 200: { description: 'Berkas PDF', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } }, 401: e401, 403: e403, 422: e422, 500: errorResponse('ERR-SYS-01: gagal membuat PDF') },
      },
    },
    '/audit-logs': {
      get: {
        tags: ['Audit Log'], summary: 'Riwayat aktivitas (Pemilik). Alias: /admin/audit-logs', security: secured,
        parameters: [
          q('rentang_tanggal', { type: 'string', example: '2026-11-01,2026-11-09' }, 'Format "YYYY-MM-DD,YYYY-MM-DD"; salah satu sisi boleh kosong. Tanggal dalam WIB.'),
          q('nama_pengguna', { type: 'string' }),
          q('jenis_tindakan', { type: 'string', enum: ['Tambah', 'Edit', 'Hapus', 'Login', 'Logout', 'AksesDitolak'] }),
          ...pagination,
        ],
        responses: { 200: okList('OK', { type: 'object' }), 401: e401, 403: e403, 422: e422 },
      },
    },
  },
};
