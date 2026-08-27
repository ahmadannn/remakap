import { parseExcelOutput } from './src/logic/parser.js';
import { classifyOrdersByRegion } from './src/logic/classifier.js';
import { generateSplitReports } from './src/logic/reportGenerator.js';
import { fetchStoMapping, MAGELANG_REGIONS } from './src/config/stoMapping.js';

async function test() {
  await fetchStoMapping();
  console.log("KEBUMEN in MAGELANG_REGIONS?", MAGELANG_REGIONS.has("KEBUMEN"));

  const rawText = `
1. PWT PT TESTING - 10001
2. KBM PT TESTING - 10002
3. KBM UD TESTING - 10003
4. KBM CV TESTING - 10004
`;
  
  const parsed = parseExcelOutput(rawText, ['ORDER PSB']);
  const classification = classifyOrdersByRegion(parsed);
  
  console.log("Grouped keys:", Object.keys(classification.groupedByRegion));
  console.log("KBM count:", classification.groupedByRegion["KEBUMEN"]?.count);

  const report = generateSplitReports({
    timestamp: new Date(),
    modeInfo: { id: 'pagi', label: 'Pagi', badgeColor: 'bg-blue-500' },
    selectedOrderTypes: ['ORDER PSB'],
    groupedByRegion: classification.groupedByRegion,
    unmappedRows: classification.unmappedRows,
    unmappedStos: classification.unmappedStos,
    totalOrders: classification.totalOrders
  });

  console.log("countMagelang:", report.countMagelang);
  console.log("Magelang Text:", report.magelang);
}

test();
