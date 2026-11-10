export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API Sistem Pencatatan Keuangan CV Sekar Melati',
    version: '1.0.0',
    description: 'Dokumentasi REST API berdasarkan TSD Kelompok 5 (BDSM)',
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login pengguna (Pemilik / Admin)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string', example: 'emy' },
                  password: { type: 'string', example: 'password123' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login berhasil, mengembalikan JWT token' },
          401: { description: 'Username atau password tidak valid (ERR-AUTH-02)' },
          403: { description: 'Akun terkunci 15 menit setelah 3x gagal (ERR-LOCK-01)' },
        },
      },
    },
    '/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout & revoke JWT token',
        responses: {
          200: { description: 'Logout berhasil' },
          401: { description: 'Unauthorized (ERR-AUTH-01)' },
        },
      },
    },
    '/pesanan': {
      get: {
        tags: ['Pesanan'],
        summary: 'Ambil daftar pesanan dengan filter & pagination',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari nama pelanggan atau nomor pesanan' },
          { name: 'status_pesanan', in: 'query', schema: { type: 'string', enum: ['Belum Lunas', 'Lunas'] } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'per_page', in: 'query', schema: { type: 'integer', default: 15 } },
        ],
        responses: {
          200: { description: 'Daftar pesanan berhasil dimuat' },
        },
      },
      post: {
        tags: ['Pesanan'],
        summary: 'Catat pesanan baru beserta rincian item & DP awal',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama_customer', 'no_kontak', 'items', 'tenggat'],
                properties: {
                  nama_customer: { type: 'string', example: 'Budi Santoso' },
                  no_kontak: { type: 'string', example: '081234567890' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['rincian_pesanan', 'kuantitas', 'harga_per_item'],
                      properties: {
                        rincian_pesanan: { type: 'string', example: 'Seragam Batik Sekolah' },
                        kuantitas: { type: 'integer', example: 20 },
                        harga_per_item: { type: 'number', example: 85000 },
                      },
                    },
                  },
                  dp: { type: 'number', example: 500000 },
                  tenggat: { type: 'string', format: 'date', example: '2026-12-01' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Pesanan berhasil dibuat' },
          422: { description: 'Validasi gagal (ERR-VAL-01 / ERR-VAL-02)' },
        },
      },
    },
    '/pesanan/{id}': {
      get: {
        tags: ['Pesanan'],
        summary: 'Ambil detail & nota pesanan berdasarkan ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Detail pesanan berhasil dimuat' },
          404: { description: 'Data pesanan tidak ditemukan (ERR-NOTFOUND-01)' },
        },
      },
    },
    '/pesanan/{id}/pembayaran': {
      post: {
        tags: ['Pesanan'],
        summary: 'Catat pembayaran cicilan atau pelunasan pesanan',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['tanggal_bayar', 'jumlah', 'jenis_pembayaran'],
                properties: {
                  tanggal_bayar: { type: 'string', format: 'date', example: '2026-11-10' },
                  jumlah: { type: 'number', example: 1200000 },
                  jenis_pembayaran: { type: 'string', enum: ['DP', 'Cicilan', 'Pelunasan'], example: 'Pelunasan' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Pembayaran berhasil dicatat' },
          422: { description: 'Melebihi sisa piutang (ERR-VAL-03) atau nominal <= 0 (ERR-VAL-04)' },
        },
      },
    },
  },
};