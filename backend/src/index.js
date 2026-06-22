import cors from 'cors';
import express from 'express';
import db, { persist, seedIfEmpty } from './db.js';

seedIfEmpty();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/**
 * 将查询结果行转为对象
 * @param {import('sql.js').QueryExecResult[]} results
 */
function rowsToObjects(results) {
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

/**
 * 将数据库行转为 API 响应格式
 * @param {Record<string, unknown>} row
 */
function toFountain(row) {
  return {
    id: row.id,
    city: row.city,
    location: row.location,
    type: row.type,
    waterQualityNote: row.water_quality_note,
    lastConfirmedDate: row.last_confirmed_date,
  };
}

app.get('/api/fountains', (_req, res) => {
  const rows = rowsToObjects(db.exec('SELECT * FROM fountains ORDER BY id'));
  res.json(rows.map(toFountain));
});

app.get('/api/fountains/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM fountains WHERE id = ?');
  stmt.bind([Number(req.params.id)]);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();

  if (!row || row.id == null) {
    res.status(404).json({ error: '饮水点不存在' });
    return;
  }
  res.json(toFountain(row));
});

app.put('/api/fountains/:id', (req, res) => {
  const { city, location, type, waterQualityNote, lastConfirmedDate } = req.body;

  if (!city || !location || !type || !lastConfirmedDate) {
    res.status(400).json({ error: '城市、位置、类型、最后确认日期为必填项' });
    return;
  }

  db.run(
    `UPDATE fountains
     SET city = ?, location = ?, type = ?, water_quality_note = ?, last_confirmed_date = ?
     WHERE id = ?`,
    [city, location, type, waterQualityNote ?? '', lastConfirmedDate, Number(req.params.id)]
  );

  const changes = db.getRowsModified();
  if (changes === 0) {
    res.status(404).json({ error: '饮水点不存在' });
    return;
  }

  persist();

  const stmt = db.prepare('SELECT * FROM fountains WHERE id = ?');
  stmt.bind([Number(req.params.id)]);
  stmt.step();
  const row = stmt.getAsObject();
  stmt.free();

  res.json(toFountain(row));
});

app.listen(PORT, () => {
  console.log(`饮水池图鉴 API 运行于 http://localhost:${PORT}`);
});
