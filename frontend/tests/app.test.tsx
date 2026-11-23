import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { calls, fail, loginAs, mockApi, ok, page, renderAt } from './helpers';

const summary = { bulan: 11, tahun: 2026, total_pesanan_bulan_ini: 7, total_piutang_aktif: 2500000, total_laba_rugi_bulan_ini: -150000 };
const detail = (over = {}) => ({
  pesanan_id: 'p1', no_pesanan: 'SM-261101-001', nama_customer: 'Bu Sari', tanggal_masuk: '2026-11-01', tenggat: '2026-12-01', tanggal_lunas: null,
  harga_total: 1000000, total_dibayar: 400000, sisa_piutang: 600000, status_pesanan: 'Belum Lunas', dicatat_oleh: 'Emy',
  customer: { customer_id: 'c1', nama_customer: 'Bu Sari', no_kontak: '08123456789' },
  items: [{ item_id: 'i1', rincian_pesanan: 'Seragam', kuantitas: 10, harga_per_item: 100000, subtotal: 1000000 }],
  riwayat_pembayaran: [{ pembayaran_id: 'b1', tanggal_bayar: '2026-11-02', jenis_pembayaran: 'DP', jumlah: 400000 }], ...over,
});

describe('login', () => {
  it('memetakan respons admin ke user, lalu membuka dashboard dengan ringkasan', async () => {
    mockApi({
      'POST /auth/login': ok({ token: 'jwt', expires_in: 86400, admin: { id: 'a9', full_name: 'Sukamto', username: 'sukamto', role: 'Pemilik' } }),
      'GET /dashboard/summary': ok(summary),
    });
    renderAt('/login');
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Username'), ' sukamto ');
    await u.type(screen.getByLabelText('Password'), 'rahasia123');
    await u.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Ringkasan bulan November 2026')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('user')!)).toMatchObject({ admin_id: 'a9', role: 'Pemilik' });
    expect(calls.find((c) => c.key === 'POST /auth/login')?.body).toEqual({ username: 'sukamto', password: 'rahasia123' });
    expect(screen.getByText('Rugi bersih bulan ini')).toBeInTheDocument();
    expect(screen.getByText('Rp -150.000'.replace('Rp -', '-Rp '))).toBeInTheDocument();
  });
  it('menampilkan pesan dari server saat login gagal', async () => {
    mockApi({ 'POST /auth/login': fail(401, 'Username atau password tidak valid') });
    renderAt('/login');
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Username'), 'x');
    await u.type(screen.getByLabelText('Password'), 'y');
    await u.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Username atau password tidak valid');
  });
});

describe('daftar pesanan', () => {
  it('menampilkan baris dan mengirim filter', async () => {
    loginAs('Admin');
    mockApi({ 'GET /pesanan': ok([{ pesanan_id: 'p1', no_pesanan: 'SM-1', nama_customer: 'Bu Sari', tanggal_masuk: '2026-11-01', tenggat: '2026-12-01', harga_total: 1000000, total_dibayar: 400000, sisa_piutang: 600000, status_pesanan: 'Belum Lunas' }], page()) });
    renderAt('/pesanan');
    expect(await screen.findByText('Bu Sari')).toBeInTheDocument();
    expect(screen.getByText('Rp 600.000')).toBeInTheDocument();
    const u = userEvent.setup();
    await u.selectOptions(screen.getByLabelText('Filter status'), 'Lunas');
    await waitFor(() => expect(calls.at(-1)?.params).toMatchObject({ status_pesanan: 'Lunas', page: 1 }));
  });
  it('menampilkan keadaan kosong', async () => {
    loginAs('Admin');
    mockApi({ 'GET /pesanan': ok([], page(0)) });
    renderAt('/pesanan');
    expect(await screen.findByText('Belum ada data pesanan.')).toBeInTheDocument();
  });
});

describe('tambah pesanan', () => {
  it('menolak form kosong dengan pesan per field dan tidak memanggil API', async () => {
    loginAs('Admin'); mockApi({});
    renderAt('/pesanan/tambah');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Simpan pesanan' }));
    expect(await screen.findByText('Nama pelanggan wajib diisi (maks. 100 karakter)')).toBeInTheDocument();
    expect(screen.getByText('Nomor kontak wajib diisi dengan benar')).toBeInTheDocument();
    expect(screen.getByText('Kuantitas harus lebih dari 0')).toBeInTheDocument();
    expect(screen.getByText('Harga per item harus lebih dari Rp 0')).toBeInTheDocument();
    expect(screen.getByText('Tenggat pesanan wajib diisi')).toBeInTheDocument();
    expect(calls).toHaveLength(0);
  });
  it('menghitung total/sisa, menolak DP berlebih, lalu mengirim payload yang benar', async () => {
    loginAs('Admin');
    mockApi({
      'POST /pesanan': ok({ pesanan_id: 'p9', no_pesanan: 'SM-9', harga_total: 500000, sisa_piutang: 300000, status_pesanan: 'Belum Lunas' }),
      'GET /pesanan/p9': ok(detail({ pesanan_id: 'p9', no_pesanan: 'SM-9' })),
    });
    renderAt('/pesanan/tambah');
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Nama pelanggan'), 'Pak Budi');
    await u.type(screen.getByLabelText('Nomor kontak'), '0812-3456-7890');
    await u.type(screen.getByLabelText('Rincian pesanan'), 'Kemeja batik');
    await u.type(screen.getByLabelText('Kuantitas'), '5');
    await u.type(screen.getByLabelText('Harga per item'), '100000');
    expect(screen.getAllByText('Rp 500.000', { selector: 'dd' })).toHaveLength(2); // total dan sisa (belum ada DP)
    await u.type(screen.getByLabelText('DP (opsional)'), '900000');
    const besok = new Date(Date.now() + 7 * 3600e3 + 86400e3).toISOString().slice(0, 10);
    await u.type(screen.getByLabelText('Tenggat pesanan'), besok);
    await u.click(screen.getByRole('button', { name: 'Simpan pesanan' }));
    expect(await screen.findByText('DP tidak boleh negatif atau melebihi total harga')).toBeInTheDocument();
    expect(calls.some((c) => c.key === 'POST /pesanan')).toBe(false);
    const dp = screen.getByLabelText('DP (opsional)');
    await u.clear(dp); await u.type(dp, '200000');
    await u.click(screen.getByRole('button', { name: 'Simpan pesanan' }));
    expect(await screen.findByText('Pesanan SM-9 berhasil disimpan.')).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /pesanan')?.body).toEqual({
      nama_customer: 'Pak Budi', no_kontak: '0812-3456-7890',
      items: [{ rincian_pesanan: 'Kemeja batik', kuantitas: 5, harga_per_item: 100000 }], dp: 200000, tenggat: besok,
    });
  });
  it('menampilkan galat server per field', async () => {
    loginAs('Admin');
    mockApi({ 'POST /pesanan': fail(422, 'Nominal melebihi batas yang diizinkan.', [{ field: 'items.0.harga_per_item', message: 'Nominal melebihi batas yang diizinkan.' }]) });
    renderAt('/pesanan/tambah');
    const u = userEvent.setup();
    await u.type(screen.getByLabelText('Nama pelanggan'), 'A');
    await u.type(screen.getByLabelText('Nomor kontak'), '081234567890');
    await u.type(screen.getByLabelText('Rincian pesanan'), 'B');
    await u.type(screen.getByLabelText('Kuantitas'), '1');
    await u.type(screen.getByLabelText('Harga per item'), '1000');
    await u.type(screen.getByLabelText('Tenggat pesanan'), '2099-01-01');
    await u.click(screen.getByRole('button', { name: 'Simpan pesanan' }));
    expect((await screen.findAllByText('Nominal melebihi batas yang diizinkan.')).length).toBe(2);
  });
});

describe('detail & pembayaran', () => {
  it('detail: tombol catat pembayaran hanya untuk Belum Lunas', async () => {
    loginAs('Admin');
    mockApi({ 'GET /pesanan/p1': ok(detail()), 'GET /pesanan/p2': ok(detail({ pesanan_id: 'p2', status_pesanan: 'Lunas', sisa_piutang: 0, total_dibayar: 1000000, tanggal_lunas: '2026-11-05' })) });
    const { unmount } = renderAt('/pesanan/p1');
    expect(await screen.findByRole('link', { name: 'Catat pembayaran' })).toHaveAttribute('href', '/pesanan/p1/pembayaran');
    unmount();
    renderAt('/pesanan/p2');
    await screen.findByText('Nota Pesanan SM-261101-001');
    expect(screen.queryByRole('link', { name: 'Catat pembayaran' })).not.toBeInTheDocument();
  });
  it('pembayaran: menolak nominal > sisa; "Bayar sisa" memilih Pelunasan; payload benar', async () => {
    loginAs('Admin');
    mockApi({
      'GET /pesanan/p1': ok(detail()),
      'POST /pesanan/p1/pembayaran': ok({ pembayaran_id: 'b2', sisa_piutang_baru: 0, status_pesanan: 'Lunas' }),
    });
    renderAt('/pesanan/p1/pembayaran');
    const u = userEvent.setup();
    const jumlah = await screen.findByLabelText('Jumlah bayar');
    await u.type(jumlah, '700000');
    await u.click(screen.getByRole('button', { name: 'Simpan pembayaran' }));
    expect(await screen.findByText('Nominal pembayaran tidak boleh melebihi sisa piutang')).toBeInTheDocument();
    expect(calls.some((c) => c.key.startsWith('POST'))).toBe(false);
    await u.click(screen.getByRole('button', { name: 'Bayar sisa' }));
    expect(screen.getByLabelText('Jenis pembayaran')).toHaveValue('Pelunasan');
    await u.click(screen.getByRole('button', { name: 'Simpan pembayaran' }));
    await waitFor(() => expect(calls.find((c) => c.key === 'POST /pesanan/p1/pembayaran')?.body).toMatchObject({ jumlah: 600000, jenis_pembayaran: 'Pelunasan' }));
    expect(await screen.findByText(/Pesanan sekarang lunas/)).toBeInTheDocument();
  });
  it('pembayaran: pesanan lunas tidak menampilkan form', async () => {
    loginAs('Admin');
    mockApi({ 'GET /pesanan/p2': ok(detail({ status_pesanan: 'Lunas', sisa_piutang: 0 })) });
    renderAt('/pesanan/p2/pembayaran');
    expect(await screen.findByText(/sudah lunas/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Simpan pembayaran' })).not.toBeInTheDocument();
  });
});

describe('piutang & riwayat transaksi', () => {
  it('piutang: menandai lewat tenggat dan mengirim sort', async () => {
    loginAs('Admin');
    mockApi({ 'GET /piutang': ok([{ customer_id: 'c1', nama_customer: 'Bu Sari', pesanan_id: 'p1', no_pesanan: 'SM-1', total_tagihan: 1000000, sisa_piutang: 600000, total_piutang_pelanggan: 900000, tenggat: '2020-01-01', status_pesanan: 'Belum Lunas' }], page()) });
    renderAt('/piutang');
    expect(await screen.findByText('Lewat tenggat')).toBeInTheDocument();
    await userEvent.setup().selectOptions(screen.getByLabelText('Urutkan'), 'tenggat_terdekat');
    await waitFor(() => expect(calls.at(-1)?.params).toMatchObject({ sort: 'tenggat_terdekat' }));
  });
  it('piutang: pesan khusus saat gagal memuat', async () => {
    loginAs('Admin');
    mockApi({ 'GET /piutang': fail(503, 'Gagal memuat data piutang. Silakan coba beberapa saat lagi.') });
    renderAt('/piutang');
    expect(await screen.findByText(/Gagal memuat data piutang/)).toBeInTheDocument();
  });
  it('riwayat transaksi: validasi rentang tanggal dan param pencarian', async () => {
    loginAs('Admin');
    mockApi({ 'GET /riwayat-transaksi': ok([], page(0)) });
    renderAt('/riwayat-transaksi');
    const u = userEvent.setup();
    await screen.findByText('Data riwayat transaksi tidak ditemukan.');
    await u.type(screen.getByLabelText('Tanggal awal'), '2026-11-10');
    await u.type(screen.getByLabelText('Tanggal akhir'), '2026-11-01');
    await u.click(screen.getByRole('button', { name: 'Cari' }));
    expect(await screen.findByText('Tanggal awal tidak boleh melebihi tanggal akhir')).toBeInTheDocument();
    await u.clear(screen.getByLabelText('Tanggal akhir')); await u.type(screen.getByLabelText('Tanggal akhir'), '2026-11-30');
    await u.type(screen.getByLabelText('Kata kunci'), 'sari');
    await u.click(screen.getByRole('button', { name: 'Cari' }));
    await waitFor(() => expect(calls.at(-1)?.params).toMatchObject({ keyword: 'sari', tanggal_awal: '2026-11-10', tanggal_akhir: '2026-11-30' }));
  });
});

describe('pengeluaran', () => {
  it('Lain-lain wajib keterangan; payload benar; kembali ke daftar dengan notifikasi', async () => {
    loginAs('Admin');
    mockApi({ 'POST /pengeluaran': ok({ pengeluaran_id: 'x1' }), 'GET /pengeluaran': ok([{ pengeluaran_id: 'x1', tanggal_pengeluaran: '2026-11-20', kategori_pengeluaran: 'Lain-lain', jumlah: 50000, keterangan: 'Benang' }], page()) });
    renderAt('/pengeluaran/tambah');
    const u = userEvent.setup();
    await u.selectOptions(screen.getByLabelText('Kategori biaya'), 'Lain-lain');
    await u.type(screen.getByLabelText('Nominal'), '50000');
    await u.click(screen.getByRole('button', { name: 'Simpan pengeluaran' }));
    expect(await screen.findByText('Keterangan wajib diisi untuk kategori Lain-lain')).toBeInTheDocument();
    await u.type(screen.getByLabelText('Keterangan'), 'Benang');
    await u.click(screen.getByRole('button', { name: 'Simpan pengeluaran' }));
    expect(await screen.findByText(/berhasil disimpan/)).toBeInTheDocument();
    expect(calls.find((c) => c.key === 'POST /pengeluaran')?.body).toMatchObject({ kategori_pengeluaran: 'Lain-lain', jumlah: 50000, keterangan: 'Benang' });
    expect(within(await screen.findByRole('table')).getByText('Benang')).toBeInTheDocument();
  });
});

describe('laporan & akses', () => {
  it('laba/rugi: nilai negatif disebut rugi dan catatan bila kosong', async () => {
    loginAs('Admin');
    mockApi({ 'GET /laporan/laba-rugi': ok({ bulan: 11, tahun: 2026, total_pemasukan: 0, total_pengeluaran: 0, laba_rugi_bersih: 0 }) });
    renderAt('/laporan/laba-rugi');
    expect(await screen.findByText(/Belum ada transaksi tercatat pada November 2026/)).toBeInTheDocument();
  });
  it('level utang (Pemilik): menampilkan level dan filter', async () => {
    loginAs('Pemilik');
    mockApi({ 'GET /laporan/level-utang': ok([{ customer_id: 'c1', nama_customer: 'Bu Sari', total_piutang: 3000000, frekuensi_utang_kategori: 'Sering', total_keterlambatan: 2, hari_keterlambatan: 40, level_utang: 'Kritis', prioritas_penagihan: 'Prioritas 1 - tagih segera' }], page()) });
    renderAt('/laporan/level-utang');
    expect(await screen.findByText('Prioritas 1 - tagih segera')).toBeInTheDocument();
    expect(screen.getAllByText('Kritis').length).toBeGreaterThan(0);
    await userEvent.setup().selectOptions(screen.getByLabelText('Level'), 'Tinggi');
    await waitFor(() => expect(calls.at(-1)?.params).toMatchObject({ level: 'Tinggi' }));
  });
  it('Admin membuka halaman Pemilik: ditolak dan backend diberi tahu', async () => {
    loginAs('Admin');
    mockApi({ 'GET /audit-logs': fail(403, 'Anda tidak memiliki izin untuk mengakses halaman ini') });
    renderAt('/riwayat-aktivitas');
    expect(await screen.findByText('Anda tidak memiliki izin untuk mengakses halaman ini.')).toBeInTheDocument();
    await waitFor(() => expect(calls.some((c) => c.key === 'GET /audit-logs')).toBe(true));
    expect(screen.queryByRole('link', { name: 'Riwayat Aktivitas' })).not.toBeInTheDocument();
  });
  it('Pemilik: riwayat aktivitas dengan label, detail JSON, dan rentang tanggal', async () => {
    loginAs('Pemilik');
    mockApi({ 'GET /audit-logs': ok([{ log_id: 'l1', nama_pengguna: 'emy', action_type: 'PAYMENT_CREATED', resource_type: 'pembayaran', resource_id: 'b1', old_values: null, new_values: { jumlah: 100000 }, ip_address: '::1', created_at: '2026-11-20T03:00:00.000Z' }], page()) });
    renderAt('/riwayat-aktivitas');
    expect(await screen.findByText('Pembayaran dicatat')).toBeInTheDocument();
    expect(screen.getByText(/10\.00\.00|10:00:00/)).toBeInTheDocument();
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Detail' }));
    expect(screen.getByText(/"jumlah": 100000/)).toBeInTheDocument();
    await u.type(screen.getByLabelText('Tanggal awal'), '2026-11-01');
    await u.click(screen.getByRole('button', { name: 'Terapkan filter' }));
    await waitFor(() => expect(calls.at(-1)?.params).toMatchObject({ rentang_tanggal: '2026-11-01,' }));
  });
  it('tanpa login diarahkan ke /login', async () => {
    mockApi({});
    renderAt('/pesanan');
    expect(await screen.findByRole('button', { name: 'Masuk' })).toBeInTheDocument();
  });
});
