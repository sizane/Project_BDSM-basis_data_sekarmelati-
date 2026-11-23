-- Seed akun awal (HANYA UNTUK DEVELOPMENT / DEMO).
-- Password awal kedua akun: SekarMelati#2026  (bcrypt cost 12). GANTI sebelum production.
-- Pemilik = Sukamto, Admin = Emy (FSD 1.1).
IF NOT EXISTS (SELECT 1 FROM dbo.admins WHERE username = 'sukamto')
    INSERT INTO dbo.admins (username, password_hash, full_name, role)
    VALUES ('sukamto', '$2b$12$s1BQEHcYrG5MtpzLFRfXreTY7n3n3SvTNMbdWw3EVjV2a7muyLa/2', 'Sukamto', 'Pemilik');

IF NOT EXISTS (SELECT 1 FROM dbo.admins WHERE username = 'emy')
    INSERT INTO dbo.admins (username, password_hash, full_name, role)
    VALUES ('emy', '$2b$12$grqvW1Xx9/CVXAyQ7VBsdeOEQYXVebRESrVvUQEIL87.ji5kj0nE.', 'Emy', 'Admin');
GO
