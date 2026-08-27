-- 1. Buat Database
CREATE DATABASE IF NOT EXISTS remakap_db;
USE remakap_db;

-- 2. Buat Tabel STO Mapping
CREATE TABLE IF NOT EXISTS sto_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_sto VARCHAR(10) NOT NULL UNIQUE,
    nama_wilayah VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Masukkan Data Awal (Seed Data dari file stoMapping.ts lama)
-- Witel Purwokerto & Sekitarnya
INSERT IGNORE INTO sto_mapping (kode_sto, nama_wilayah) VALUES 
('PWT', 'PURWOKERTO'),
('BYM', 'PURWOKERTO'),
('CLO', 'PURWOKERTO'),
('KRY', 'PURWOKERTO'),
('SDJ', 'PURWOKERTO'),
('SUK', 'SOKARAJA'),
('AJB', 'AJIBARANG'),
('BBL', 'BUMIAYU'),
('BJR', 'BANJARNEGARA'),
('BNA', 'BANJARNEGARA'),
('PBG', 'PURBALINGGA'),
('BBT', 'PURBALINGGA'),
('CIL', 'CILACAP'),
('CLC', 'CILACAP'),
('MAN', 'CILACAP'),
('MAO', 'CILACAP'),
('KJA', 'KROYA'),
('MJN', 'MAJENANG'),
('SDA', 'SIDAREJA'),
('WOS', 'WONOSOBO'),
('WNS', 'WONOSOBO');

-- Witel Magelang & Sekitarnya
INSERT IGNORE INTO sto_mapping (kode_sto, nama_wilayah) VALUES 
('MAG', 'MAGELANG'),
('PRN', 'MAGELANG'),
('KTW', 'MAGELANG'),
('SWT', 'MAGELANG'),
('GOM', 'MAGELANG'),
('MTY', 'MAGELANG'),
('TEM', 'MAGELANG'),
('TMG', 'TEMANGGUNG'),
('MUN', 'MAGELANG'),
('MTP', 'MUNTILAN'),
('KTA', 'MAGELANG'),
('PWJ', 'PURWOREJO'),
('PWR', 'PURWOREJO'),
('KEB', 'KEBUMEN');

-- Wilayah Jawa Tengah & Lainnya
INSERT IGNORE INTO sto_mapping (kode_sto, nama_wilayah) VALUES 
('PKL', 'PEKALONGAN'),
('BTG', 'BATANG'),
('TGL', 'TEGAL'),
('SLW', 'SLAWI'),
('BRB', 'BREBES'),
('BBS', 'BREBES'),
('KTG', 'KETANGGUNGAN'),
('PML', 'PEMALANG'),
('SMG', 'SEMARANG'),
('SLO', 'SOLO'),
('KLT', 'KLATEN'),
('BYL', 'BOYOLALI'),
('SKH', 'SUKOHARJO'),
('WNG', 'WONOGIRI'),
('KRN', 'KARANGANYAR'),
('SRG', 'SRAGEN'),
('KDS', 'KUDUS'),
('PTI', 'PATI'),
('JPR', 'JEPARA'),
('RBG', 'REMBANG'),
('BLA', 'BLORA'),
('CPT', 'CEPU'),
('SLT', 'SALATIGA'),
('UNG', 'UNGARAN'),
('AMB', 'AMBARAWA'),
('KDL', 'KENDAL'),
('WLR', 'WELERI'),
('PWD', 'PURWODADI');

-- Kota Besar Lainnya
INSERT IGNORE INTO sto_mapping (kode_sto, nama_wilayah) VALUES 
('JKT', 'JAKARTA'),
('BDG', 'BANDUNG'),
('SBY', 'SURABAYA'),
('YGY', 'YOGYAKARTA');
