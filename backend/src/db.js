import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'fountain.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const SQL = await initSqlJs();

/** @type {import('sql.js').Database} */
let db;

if (fs.existsSync(dbPath)) {
  db = new SQL.Database(fs.readFileSync(dbPath));
} else {
  db = new SQL.Database();
}

/**
 * 将内存数据库持久化到磁盘
 */
export function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

db.run(`
  CREATE TABLE IF NOT EXISTS fountains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    water_quality_note TEXT DEFAULT '',
    last_confirmed_date TEXT NOT NULL
  )
`);

/** @type {Array<{ city: string; location: string; type: string; water_quality_note: string; last_confirmed_date: string }>} */
const SEED_DATA = [
  {
    city: '北京',
    location: '故宫博物院午门东侧',
    type: '直饮机',
    water_quality_note: 'TDS 约 120，口感清冽',
    last_confirmed_date: '2025-11-08',
  },
  {
    city: '上海',
    location: '人民广场地铁站 2 号口',
    type: '按压式龙头',
    water_quality_note: '有轻微氯味，建议静置片刻',
    last_confirmed_date: '2025-10-22',
  },
  {
    city: '杭州',
    location: '西湖苏堤北口休息亭',
    type: '景观喷泉式',
    water_quality_note: '水质稳定，夏季流量较大',
    last_confirmed_date: '2025-12-01',
  },
  {
    city: '成都',
    location: '宽窄巷子南门游客中心',
    type: '直饮机',
    water_quality_note: '带冷热双温，冬季常开保温',
    last_confirmed_date: '2025-09-15',
  },
  {
    city: '广州',
    location: '珠江新城花城广场北',
    type: '不锈钢立式',
    water_quality_note: '定期消毒，周末人流大需排队',
    last_confirmed_date: '2025-11-30',
  },
];

/**
 * 若数据库为空则写入种子数据
 */
export function seedIfEmpty() {
  const count = db.exec('SELECT COUNT(*) AS count FROM fountains')[0]?.values[0]?.[0] ?? 0;
  if (count > 0) return;

  const stmt = db.prepare(`
    INSERT INTO fountains (city, location, type, water_quality_note, last_confirmed_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const row of SEED_DATA) {
    stmt.run([row.city, row.location, row.type, row.water_quality_note, row.last_confirmed_date]);
  }
  stmt.free();
  persist();
}

export default db;
