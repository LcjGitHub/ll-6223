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

/** 创建核实记录表结构，不存在时自动创建，与充电桩通过外键关联 */
db.run(`
  CREATE TABLE IF NOT EXISTS verification_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    charger_id INTEGER NOT NULL,
    verification_date TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE CASCADE
  )
`);

/** 为核实记录表创建索引，提升按充电桩查询的性能 */
db.run(`
  CREATE INDEX IF NOT EXISTS idx_verification_records_charger_id
  ON verification_records(charger_id)
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
 * 核实记录种子数据
 * @description 与充电桩种子数据对应的示例核实记录，按顺序一一对应
 */
const VERIFICATION_SEED_DATA = [
  {
    verification_date: '2025-11-08',
    note: '设备运行正常，充电速度稳定，约30分钟充至80%，现场有3个空闲桩位。',
  },
  {
    verification_date: '2025-10-22',
    note: '慢充桩工作正常，适合长时间停放充电，夜间收费有优惠。',
  },
  {
    verification_date: '2025-12-01',
    note: '液冷超充体验极佳，即插即用无需扫码，充电功率稳定在170kW以上。',
  },
  {
    verification_date: '2025-09-15',
    note: '交直流切换功能正常，直流模式约45分钟充满，交流模式约6小时充满。',
  },
  {
    verification_date: '2025-11-30',
    note: '超级充电桩速度很快，休息室环境不错，配有自动售卖机和卫生间。',
  },
];

/**
 * 当数据库为空时写入种子数据
 * @description 检查表中记录数，为 0 时批量插入充电桩和核实记录种子数据并持久化到磁盘
 */
export function seedIfEmpty() {
  const count = db.exec('SELECT COUNT(*) AS count FROM chargers')[0]?.values[0]?.[0] ?? 0;
  if (count > 0) return;

  const chargerStmt = db.prepare(`
    INSERT INTO chargers (city, location, charger_type, power_note, last_verified_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const verificationStmt = db.prepare(`
    INSERT INTO verification_records (charger_id, verification_date, note)
    VALUES (?, ?, ?)
  `);

  for (let i = 0; i < SEED_DATA.length; i++) {
    const row = SEED_DATA[i];
    chargerStmt.run([row.city, row.location, row.charger_type, row.power_note, row.last_verified_date]);
    const chargerId = db.exec('SELECT last_insert_rowid() AS id')[0].values[0][0];
    const verification = VERIFICATION_SEED_DATA[i];
    verificationStmt.run([chargerId, verification.verification_date, verification.note]);
  }

  chargerStmt.free();
  verificationStmt.free();
  persist();
}

export default db;
