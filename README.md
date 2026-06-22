# 城市公共充电桩图鉴

React + Mantine 前端与 Express + SQLite 后端，记录城市公共充电桩信息。

## 技术栈

| 层级 | 技术 | 端口 |
|------|------|------|
| 前端 | React + Mantine + axios | 3101 |
| 后端 | Express + SQLite (`./data/charging.db`) | 3000 |

## 字段说明

- **城市** — 所在城市
- **具体位置** — 具体地点描述
- **桩类型** — 充电桩类型（直流快充、交流慢充、交直流一体等）
- **功率说明** — 功率参数与充电速度描述
- **最后核实日期** — 最近一次实地核实日期

## 启动

依赖均在各自目录内安装，无需全局包管理工具。

### 1. 后端（端口 3000）

```bash
cd backend
npm install
npm start
```

首次启动会自动创建 `backend/data/charging.db` 并写入 5 条种子数据。

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
| GET | `/api/chargers` | 列表 |
| GET | `/api/chargers/:id` | 详情 |
| PUT | `/api/chargers/:id` | 更新 |
