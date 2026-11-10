CREATE DATABASE sekar_melati_db;
GO
USE sekar_melati_db;
GO

-- 1. Tabel admins (TSD 4.3a & TSD 5.1 sp_catat_percobaan_login)
CREATE TABLE admins (
    admin_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_admins PRIMARY KEY DEFAULT NEWID(),
    username VARCHAR(50) NOT NULL CONSTRAINT UQ_admins_username UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CONSTRAINT CK_admins_role CHECK (role IN ('Pemilik', 'Admin')),
    is_active BIT NOT NULL CONSTRAINT DF_admins_is_active DEFAULT 1,
    failed_login_count INT NOT NULL CONSTRAINT DF_admins_failed_count DEFAULT 0,
    locked_until DATETIME2 NULL,
    last_login_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_admins_created_at DEFAULT SYSUTCDATETIME()
);

-- 2. Tabel revoked_tokens (TSD 3.3b & TSD 6.2)
CREATE TABLE revoked_tokens (
    jti VARCHAR(100) NOT NULL CONSTRAINT PK_revoked_tokens PRIMARY KEY,
    expires_at DATETIME2 NOT NULL,
    revoked_at DATETIME2 NOT NULL CONSTRAINT DF_revoked_tokens_revoked_at DEFAULT SYSUTCDATETIME()
);

-- 3. Tabel customers (TSD 4.3b)
CREATE TABLE customers (
    customer_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_customers PRIMARY KEY DEFAULT NEWID(),
    nama_customer VARCHAR(100) NOT NULL,
    no_kontak VARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_customers_created_at DEFAULT SYSUTCDATETIME()
);

-- 4. Tabel pesanan (TSD 4.3c & TSD 5.4 trg_update_status_pesanan)
CREATE TABLE pesanan (
    pesanan_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_pesanan PRIMARY KEY DEFAULT NEWID(),
    no_pesanan VARCHAR(20) NOT NULL CONSTRAINT UQ_pesanan_no_pesanan UNIQUE,
    customer_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_pesanan_customer FOREIGN KEY REFERENCES customers(customer_id),
    admin_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_pesanan_admin FOREIGN KEY REFERENCES admins(admin_id),
    tanggal_masuk DATE NOT NULL CONSTRAINT DF_pesanan_tanggal_masuk DEFAULT CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE),
    tenggat DATE NOT NULL,
    harga_total DECIMAL(12, 2) NOT NULL CONSTRAINT CK_pesanan_harga_total CHECK (harga_total > 0),
    status_pesanan VARCHAR(20) NOT NULL CONSTRAINT DF_pesanan_status DEFAULT 'Belum Lunas'
        CONSTRAINT CK_pesanan_status CHECK (status_pesanan IN ('Belum Lunas', 'Lunas')),
    tanggal_lunas DATE NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_pesanan_created_at DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_pesanan_tenggat CHECK (tenggat >= tanggal_masuk)
);

-- 5. Tabel item_pesanan (TSD 4.3d)
CREATE TABLE item_pesanan (
    item_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_item_pesanan PRIMARY KEY DEFAULT NEWID(),
    pesanan_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_item_pesanan_pesanan FOREIGN KEY REFERENCES pesanan(pesanan_id) ON DELETE CASCADE,
    rincian_pesanan VARCHAR(200) NOT NULL,
    jumlah INT NOT NULL CONSTRAINT CK_item_pesanan_jumlah CHECK (jumlah > 0),
    harga_per_item DECIMAL(12, 2) NOT NULL CONSTRAINT CK_item_pesanan_harga CHECK (harga_per_item > 0)
);

-- 6. Tabel pembayaran (TSD 4.3e)
CREATE TABLE pembayaran (
    pembayaran_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_pembayaran PRIMARY KEY DEFAULT NEWID(),
    pesanan_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_pembayaran_pesanan FOREIGN KEY REFERENCES pesanan(pesanan_id),
    admin_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_pembayaran_admin FOREIGN KEY REFERENCES admins(admin_id),
    tanggal_bayar DATE NOT NULL CONSTRAINT DF_pembayaran_tanggal_bayar DEFAULT CAST(DATEADD(HOUR, 7, SYSUTCDATETIME()) AS DATE),
    jumlah DECIMAL(12, 2) NOT NULL CONSTRAINT CK_pembayaran_jumlah CHECK (jumlah > 0),
    jenis_pembayaran VARCHAR(20) NOT NULL CONSTRAINT CK_pembayaran_jenis CHECK (jenis_pembayaran IN ('DP', 'Cicilan', 'Pelunasan')),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_pembayaran_created_at DEFAULT SYSUTCDATETIME()
);

-- 7. Tabel pengeluaran (TSD 4.3f)
CREATE TABLE pengeluaran (
    pengeluaran_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_pengeluaran PRIMARY KEY DEFAULT NEWID(),
    admin_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_pengeluaran_admin FOREIGN KEY REFERENCES admins(admin_id),
    tanggal_pengeluaran DATE NOT NULL,
    kategori_pengeluaran VARCHAR(20) NOT NULL
        CONSTRAINT CK_pengeluaran_kategori CHECK (kategori_pengeluaran IN ('Bahan Baku', 'Upah Jahit', 'Listrik', 'Lain-lain')),
    jumlah DECIMAL(12, 2) NOT NULL CONSTRAINT CK_pengeluaran_jumlah CHECK (jumlah > 0),
    keterangan VARCHAR(255) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_pengeluaran_created_at DEFAULT SYSUTCDATETIME()
);

-- 8. Tabel level_utang (TSD 4.3g)
CREATE TABLE level_utang (
    level_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_level_utang PRIMARY KEY DEFAULT NEWID(),
    nama_level VARCHAR(20) NOT NULL CONSTRAINT UQ_level_utang_nama UNIQUE
        CONSTRAINT CK_level_utang_nama CHECK (nama_level IN ('Rendah', 'Sedang', 'Tinggi', 'Kritis')),
    batas_min_piutang DECIMAL(12, 2) NOT NULL,
    batas_max_piutang DECIMAL(12, 2) NULL
);

-- 9. Tabel audit_logs (TSD 6.3 - Append-Only)
CREATE TABLE audit_logs (
    log_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_audit_logs PRIMARY KEY DEFAULT NEWID(),
    admin_id UNIQUEIDENTIFIER NULL CONSTRAINT FK_audit_logs_admin FOREIGN KEY REFERENCES admins(admin_id) ON DELETE SET NULL,
    admin_username VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NULL,
    resource_id UNIQUEIDENTIFIER NULL,
    old_values NVARCHAR(MAX) NULL CONSTRAINT CK_audit_logs_old_json CHECK (old_values IS NULL OR ISJSON(old_values) = 1),
    new_values NVARCHAR(MAX) NULL CONSTRAINT CK_audit_logs_new_json CHECK (new_values IS NULL OR ISJSON(new_values) = 1),
    ip_address VARCHAR(45) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_audit_logs_created_at DEFAULT SYSUTCDATETIME()
);

-- Indexing Strategy (TSD 4.3)
CREATE INDEX IX_pesanan_customer_id ON pesanan(customer_id);
CREATE INDEX IX_pesanan_status_pesanan ON pesanan(status_pesanan);
CREATE INDEX IX_pembayaran_pesanan_id ON pembayaran(pesanan_id);
CREATE INDEX IX_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IX_audit_logs_created_at ON audit_logs(created_at DESC);
GO