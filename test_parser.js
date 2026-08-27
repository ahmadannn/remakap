const ORDER_TYPES_LIST = [
  'ORDER PSB',
  'ORDER DO',
  'ORDER MO',
  'ORDER IHLD ON GOING',
  'Pengajuan JT PWT & Magelang',
  'ORDER DIGITAL',
  'ORDER OBL',
  'ORDER WMS DENGAN AP BARU',
  'ORDER AREA LAIN (MILIK AM INTERNAL)',
];

function sortSelectedOrderTypes(selected) {
  return selected; // mock
}

function matchOrderTypeHeader(line) {
  const clean = line.trim().replace(/^[\(\[\{=\-\*\#\s]+|[\)\]\}=\-\*\#\s]+$/g, '').trim().toUpperCase();

  for (const orderType of ORDER_TYPES_LIST) {
    if (clean === orderType.toUpperCase()) {
      return orderType;
    }
  }

  // Cek jika baris diawali kata kunci spesifik
  if (clean.includes('PENGAJUAN JT') || clean.includes('JT PWT')) {
    return 'Pengajuan JT PWT & Magelang';
  }
  if (clean.includes('IHLD')) {
    return 'ORDER IHLD ON GOING';
  }
  if (clean.includes('WMS') && (clean.includes('AP BARU') || clean.includes('AP'))) {
    return 'ORDER WMS DENGAN AP BARU';
  }
  if (clean.includes('AREA LAIN') || clean.includes('AM INTERNAL')) {
    return 'ORDER AREA LAIN (MILIK AM INTERNAL)';
  }
  if (clean === 'PSB' || clean.startsWith('ORDER PSB')) {
    return 'ORDER PSB';
  }
  if (clean === 'DO' || clean.startsWith('ORDER DO')) {
    return 'ORDER DO';
  }
  if (clean === 'MO' || clean.startsWith('ORDER MO')) {
    return 'ORDER MO';
  }
  if (clean === 'DIGITAL' || clean.startsWith('ORDER DIGITAL')) {
    return 'ORDER DIGITAL';
  }
  if (clean === 'OBL' || clean.startsWith('ORDER OBL')) {
    return 'ORDER OBL';
  }

  return null;
}

const lines = [
  "NOS Yayan LENTERA SAHABAT NUSANTARA 1002537374 HSI EBIS => COMPLETE COMPLETED  sejak 08/19/2026 UMUR 5 HARI",
  " PRN UD HARTAWAN SETJODININGRAT 1-73990795997 ASTINET => Review Order TSQ STARTWORK SDA CPO sejak 08/18/2026 UMUR 6 HARI",
  " WOS PT WIRELESSINDO SOLUSI TEKNOLOGI         1-74056253297 ASTINET => Approval E2E Testing  COMPLETE TIF PMDA sejak 08/19/2026 UMUR 5 HARI",
  "\" TEM PT WIRELESSINDO SOLUSI TEKNOLOGI	 1-74057406155 ASTINET => Approval E2E Testing  COMPLETE TIF PMDA sejak 08/19/2026 UMUR 5 HARI\"",
  " PRN PT WIRELESSINDO SOLUSI TEKNOLOGI 1-74057406585 ASTINET => Review Order TSQ STARTWORK SDA CPO sejak 08/19/2026 UMUR 5 HARI",
  " MUN PT WIRELESSINDO SOLUSI TEKNOLOGI 1-74057443925 ASTINET => Review Order TSQ STARTWORK SDA CPO sejak 08/19/2026 UMUR 5 HARI",
  "\" MTY PT MODAL VENTURA YCAB 1-73481972785 ASTINET => Approval E2E Testing  COMPLETE 	TIF PMDA sejak 08/14/2026 UMUR 10 HARI\"",
  " PWJ MTS AL IMAN 2 BULUS 1002536784 HSI EBIS => COMPLETE COMPLETED  sejak 08/05/2026 UMUR 19 HARI",
  "MAN KEMENTERIAN SOSIAL 1-72918782498 ASTINET => Pickup NTE from SCM CANCLWORK TIF NON FBB FFM DISTRICT PURWOKERTO sejak 08/06/2026 UMUR 18 HARI | BUTUH JT OGP PEMBANGUNAN",
  "MAN KEMENTERIAN SOSIAL 1-72925914928 ASTINET => Review LME  STARTWORK TIF ED REGIONAL JATENG DIY sejak 08/06/2026 UMUR 18 HARI | BUTUH JT OGP PEMBANGUNAN",
  "PWT HOTEL GRAND RUMAH INDAH 1002520202 HSI EBIS => COMPLETE COMPLETED  sejak 08/20/2026 UMUR 4 HARI",
  "PWT HOTEL GRAND RUMAH INDAH 1002520263 HSI EBIS => OSS PROVISIONING ISSUED Provisioning Issued  sejak 08/21/2026 UMUR 3 HARI",
  "PWT DAYAN TANAMAL 1002533050 WMS => Approval E2E Testing  COMPLETE TIF PMDA sejak 08/14/2026 UMUR 10 HARI",
  "KBM CV MALINDO SEAFOOD INDONESIA 1-74223846796 WMS => Pickup NTE from SCM Wifi STARTWORK TIF NON FBB FFM DISTRICT MAGELANG sejak 08/21/2026 UMUR 3 HARI",
  "KBM CV MALINDO SEAFOOD INDONESIA 1-74224470293 WMS => Pickup NTE from SCM Wifi STARTWORK TIF NON FBB FFM DISTRICT MAGELANG sejak 08/21/2026 UMUR 3 HARI",
  "KBM CV MALINDO SEAFOOD INDONESIA 1-74224470784 WMS => Pickup NTE from SCM Wifi STARTWORK TIF NON FBB FFM DISTRICT MAGELANG sejak 08/21/2026 UMUR 3 HARI"
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const matchedType = matchOrderTypeHeader(line);
  if (matchedType) {
    console.log("MATCHED HEADER:", matchedType, "FOR LINE:", line);
  }
}
