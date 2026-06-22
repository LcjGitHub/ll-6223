import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'charging.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const SQL = await initSqlJs();

let db;

if (fs.existsSync(dbPath)) {
  db = new SQL.Database(fs.readFileSync(dbPath));
} else {
  db = new SQL.Database();
}

export function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

db.run(`
  CREATE TABLE IF NOT EXISTS chargers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    city TEXT NOT NULL,
    location TEXT NOT NULL,
    charger_type TEXT NOT NULL,
    power_note TEXT DEFAULT '',
    last_verified_date TEXT NOT NULL
  )
`);

const SEED_DATA = [
  {
    city: '北京',
    location: '朝阳区望京SOHO地下停车场',
    charger_type: '直流快充',
    power_note: '120kW 超充桩，约30分钟充至80%',
    last_verified_date: '2025-11-08',
  },
  {
    city: '上海',
    location: '浦东新区陆家嘴中心绿地停车场',
    charger_type: '交流慢充',
    power_note: '7kW 普通充电，适合夜间慢充',
    last_verified_date: '2025-10-22',
  },
  {
    city: '杭州',
    location: '西湖区阿里巴巴西溪园区B区',
    charger_type: '直流快充',
    power_note: '180kW 液冷超充，支持即插即充',
    last_verified_date: '2025-12-01',
  },
  {
    city: '成都',
    location: '高新区天府软件园D区地面停车场',
    charger_type: '交直流一体',
    power_note: '60kW直流/7kW交流双模切换',
    last_verified_date: '2025-09-15',
  },
  {
    city: '广州',
    location: '天河区珠江新城花城汇停车场',
    charger_type: '直流快充',
    power_note: '240kW 超级快充桩，配有休息室',
    last_verified_date: '2025-11-30',
  },
];

export function seedIfEmpty() {
  const count = db.exec('SELECT COUNT(*) AS count FROM chargers')[0]?.values[0]?.[0] ?? 0;
  if (count > 0) return;

  const stmt = db.prepare(`
    INSERT INTO chargers (city, location, charger_type, power_note, last_verified_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const row of SEED_DATA) {
    stmt.run([row.city, row.location, row.charger_type, row.power_note, row.last_verified_date]);
  }
  stmt.free();
  persist();
}

export default db;
