import cors from 'cors';
import express from 'express';
import db, { persist, seedIfEmpty } from './db.js';

seedIfEmpty();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function rowsToObjects(results) {
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map((row) =>
    Object.fromEntries(columns.map((col, i) => [col, row[i]]))
  );
}

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

app.get('/api/chargers', (_req, res) => {
  const rows = rowsToObjects(db.exec('SELECT * FROM chargers ORDER BY id'));
  res.json(rows.map(toCharger));
});

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

app.listen(PORT, () => {
  console.log(`充电桩图鉴 API 运行于 http://localhost:${PORT}`);
});
