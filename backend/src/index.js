import cors from 'cors';
import express from 'express';
import db, { persist, seedIfEmpty } from './db.js';

/**
 * @fileoverview 接口服务模块
 * @description Express RESTful API 服务，提供充电桩数据的查询与更新接口，监听 3000 端口
 */

/** 首次启动时检查并写入种子数据 */
seedIfEmpty();

const app = express();
const PORT = 3000;

/** 启用跨域与 JSON 解析中间件 */
app.use(cors());
app.use(express.json());

/**
 * 将 SQL.js 查询结果转换为对象数组
 * @param {Array} results SQL.js exec 方法返回的原始结果集
 * @returns {Array<Object>} 键值对形式的记录数组
 */
function rowsToObjects(results) {
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

/**
 * 将数据库行对象转换为前端使用的充电桩对象（蛇形命名转驼峰）
 * @param {Object} row 数据库原始行对象
 * @returns {Object} 驼峰命名的充电桩对象
 */
function toCharger(row) {
  return {
    id: row.id,
    city: row.city,
    location: row.location,
    chargerType: row.charger_type,
    powerNote: row.power_note,
    lastVerifiedDate: row.last_verified_date,
  };
}

/**
 * @api {get} /api/chargers 获取充电桩列表
 * @apiName GetChargers
 * @apiGroup Chargers
 * @apiSuccess {Object[]} - 充电桩列表数组，按 ID 升序排列
 */
app.get('/api/chargers', (_req, res) => {
  const rows = rowsToObjects(db.exec('SELECT * FROM chargers ORDER BY id'));
  res.json(rows.map(toCharger));
});

/**
 * @api {get} /api/chargers/:id 获取单个充电桩详情
 * @apiName GetCharger
 * @apiGroup Chargers
 * @apiParam {Number} id 充电桩唯一标识
 * @apiSuccess {Object} - 充电桩详情对象
 * @apiError {404} 充电桩不存在
 */
app.get('/api/chargers/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM chargers WHERE id = ?');
  stmt.bind([Number(req.params.id)]);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();

  if (!row || row.id == null) {
    res.status(404).json({ error: '充电桩不存在' });
    return;
  }
  res.json(toCharger(row));
});

/**
 * @api {put} /api/chargers/:id 更新充电桩信息
 * @apiName UpdateCharger
 * @apiGroup Chargers
 * @apiParam {Number} id 充电桩唯一标识
 * @apiBody {String} city 城市（必填）
 * @apiBody {String} location 具体位置（必填）
 * @apiBody {String} chargerType 桩类型（必填）
 * @apiBody {String} [powerNote] 功率说明
 * @apiBody {String} lastVerifiedDate 最后核实日期（必填）
 * @apiSuccess {Object} - 更新后的充电桩对象
 * @apiError {400} 必填项缺失
 * @apiError {404} 充电桩不存在
 */
app.put('/api/chargers/:id', (req, res) => {
  const { city, location, chargerType, powerNote, lastVerifiedDate } = req.body;

  if (!city || !location || !chargerType || !lastVerifiedDate) {
    res.status(400).json({ error: '城市、位置、桩类型、最后核实日期为必填项' });
    return;
  }

  db.run(
    `UPDATE chargers
     SET city = ?, location = ?, charger_type = ?, power_note = ?, last_verified_date = ?
     WHERE id = ?`,
    [city, location, chargerType, powerNote ?? '', lastVerifiedDate, Number(req.params.id)]
  );

  const changes = db.getRowsModified();
  if (changes === 0) {
    res.status(404).json({ error: '充电桩不存在' });
    return;
  }

  persist();

  const stmt = db.prepare('SELECT * FROM chargers WHERE id = ?');
  stmt.bind([Number(req.params.id)]);
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();

  res.json(toCharger(row));
});

/** 启动服务，监听 3000 端口 */
app.listen(PORT, () => {
  console.log(`充电桩图鉴 API 运行于 http://localhost:${PORT}`);
});
