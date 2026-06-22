# 公共饮水池图鉴

React + Mantine 前端与 Express + SQLite 后端，记录城市公共饮水点信息。

## 技术栈

| 层级 | 技术 | 端口 |
|------|------|------|
| 前端 F6 | React + Mantine + axios | 3101 |
| 后端 B2 | Express + SQLite (`./data/fountain.db`) | 3000 |

## 字段说明

- **城市** — 所在城市
- **位置** — 具体地点描述
- **类型** — 饮水设施类型（直饮机、按压式龙头等）
- **水质备注** — 口感、TDS 等主观记录
- **最后确认日期** — 最近一次实地确认日期

## 启动

依赖均在各自目录内安装，无需全局 pnpm/yarn。

### 1. 后端（端口 3000）

```bash
cd backend
npm install
npm start
```

开发时可使用热重载：

```bash
npm run dev
```

首次启动会自动创建 `backend/data/fountain.db` 并写入 5 条种子数据。

### 2. 前端（端口 3101）

另开终端：

```bash
cd frontend
npm install
npm run dev
```

浏览器访问 http://localhost:3101

前端通过 Vite 代理将 `/api` 请求转发至后端。

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/fountains` | 列表 |
| GET | `/api/fountains/:id` | 详情 |
| PUT | `/api/fountains/:id` | 更新 |
