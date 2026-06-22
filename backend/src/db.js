import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

/**
 * @fileoverview 数据库模块
 * @description 使用 SQL.js (SQLite) 实现本地数据持久化，包含表结构创建、种子数据写入与数据导出功能
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'charging.db');

/** 确保数据目录存在 */
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/** 初始化 SQL.js 运行时 */
const SQL = await initSqlJs();

/**
 * 数据库实例
 * @description 全局共享的 SQLite 数据库连接，首次启动时从文件加载或新建
 */
let db;

if (fs.existsSync(dbPath)) {
  db = new SQL.Database(fs.readFileSync(dbPath));
} else {
  db = new SQL.Database();
}

/**
 * 将内存数据库持久化到磁盘文件
 * @description 将当前数据库状态导出为二进制并写入 data/charging.db
 */
export function persist() {
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

/** 创建充电桩表结构，不存在时自动创建 */
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

/**
 * 种子数据
 * @description 首次启动时写入的 5 条示例充电桩数据，覆盖国内主要城市
 */
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

/**
 * 当数据库为空时写入种子数据
 * @description 检查表中记录数，为 0 时批量插入 SEED_DATA 并持久化到磁盘
 */
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
