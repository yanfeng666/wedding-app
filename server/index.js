const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 数据文件路径
const BLESSINGS_FILE = path.join(__dirname, 'data', 'blessings.json');
const RSVP_FILE = path.join(__dirname, 'data', 'rsvp.json');

// 确保 data 目录和数据文件存在
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

function readBlessings() {
  try {
    if (!fs.existsSync(BLESSINGS_FILE)) return [];
    const raw = fs.readFileSync(BLESSINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeBlessings(data) {
  fs.writeFileSync(BLESSINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 中间件
app.use(cors());
app.use(express.json());

// ========== API 路由 ==========

// 获取所有祝福
app.get('/api/blessings', (_req, res) => {
  try {
    const blessings = readBlessings();
    res.json(blessings);
  } catch (err) {
    console.error('获取祝福失败:', err);
    res.status(500).json({ error: '获取祝福失败' });
  }
});

// 提交祝福
app.post('/api/blessings', (req, res) => {
  try {
    const { name, relation, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: '姓名和祝福内容不能为空' });
    }
    const blessings = readBlessings();
    const newBlessing = {
      id: Date.now(),
      name,
      relation: relation || '亲友',
      message,
      created_at: new Date().toISOString(),
    };
    blessings.unshift(newBlessing);
    writeBlessings(blessings);
    res.json({ id: newBlessing.id, success: true });
  } catch (err) {
    console.error('提交祝福失败:', err);
    res.status(500).json({ error: '提交祝福失败' });
  }
});

// ========== RSVP（确认参加） ==========

function readRsvps() {
  try {
    if (!fs.existsSync(RSVP_FILE)) return [];
    const raw = fs.readFileSync(RSVP_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeRsvps(data) {
  fs.writeFileSync(RSVP_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// 获取所有 RSVP
app.get('/api/rsvp', (_req, res) => {
  try {
    const rsvps = readRsvps();
    res.json(rsvps);
  } catch (err) {
    console.error('获取 RSVP 失败:', err);
    res.status(500).json({ error: '获取 RSVP 失败' });
  }
});

// 提交 RSVP
app.post('/api/rsvp', (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '姓名不能为空' });
    }
    const rsvps = readRsvps();
    const newRsvp = {
      id: Date.now(),
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      created_at: new Date().toISOString(),
    };
    rsvps.unshift(newRsvp);
    writeRsvps(rsvps);
    res.json({ id: newRsvp.id, success: true });
  } catch (err) {
    console.error('提交 RSVP 失败:', err);
    res.status(500).json({ error: '提交 RSVP 失败' });
  }
});

// ========== 静态文件服务（生产环境） ==========
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// SPA fallback：所有非 API 路由返回 index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

// ========== 启动服务 ==========
app.listen(PORT, () => {
  console.log(`💒 婚礼网站服务已启动: http://localhost:${PORT}`);
  console.log(`📁 静态文件路径: ${clientDistPath}`);
});