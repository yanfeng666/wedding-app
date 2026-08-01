require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 邮件配置
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
  : null;

const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || '';

// 发送通知邮件
async function sendNotification(subject, content) {
  if (!transporter || !NOTIFY_EMAIL) return;
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: NOTIFY_EMAIL,
      subject,
      text: content,
    });
  } catch (err) {
    console.error('发送邮件失败:', err);
  }
}

// 中间件
app.use(cors());
app.use(express.json());

// ========== API 路由 ==========

// 获取所有祝福
app.get('/api/blessings', async (_req, res) => {
  try {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase
      .from('blessings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('获取祝福失败:', err);
    res.status(500).json({ error: '获取祝福失败' });
  }
});

// 提交祝福
app.post('/api/blessings', async (req, res) => {
  try {
    const { name, relation, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: '姓名和祝福内容不能为空' });
    }
    if (!supabase) return res.json({ id: Date.now(), success: true });

    const { data, error } = await supabase
      .from('blessings')
      .insert([{ name, relation: relation || '亲友', message }])
      .select();
    if (error) throw error;

    sendNotification(
      '💌 收到新的婚礼祝福',
      `${name}（${relation || '亲友'}）发送了祝福：\n\n${message}`
    );

    res.json({ id: data[0].id, success: true });
  } catch (err) {
    console.error('提交祝福失败:', err);
    res.status(500).json({ error: '提交祝福失败' });
  }
});

// ========== RSVP（确认参加） ==========

// 获取所有 RSVP
app.get('/api/rsvp', async (_req, res) => {
  try {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase
      .from('rsvp')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('获取 RSVP 失败:', err);
    res.status(500).json({ error: '获取 RSVP 失败' });
  }
});

// 提交 RSVP
app.post('/api/rsvp', async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: '姓名不能为空' });
    }
    if (!supabase) return res.json({ id: Date.now(), success: true });

    const { data, error } = await supabase
      .from('rsvp')
      .insert([{ name: name.trim(), phone: phone ? phone.trim() : '' }])
      .select();
    if (error) throw error;

    sendNotification(
      '🎉 收到新的 RSVP 确认',
      `${name.trim()} 确认参加婚礼！\n联系电话：${phone ? phone.trim() : '未提供'}`
    );

    res.json({ id: data[0].id, success: true });
  } catch (err) {
    console.error('提交 RSVP 失败:', err);
    res.status(500).json({ error: '提交 RSVP 失败' });
  }
});

// ========== 数据导出 ==========

app.get('/api/export', async (_req, res) => {
  try {
    let blessings = [];
    let rsvps = [];

    if (supabase) {
      const { data: bData } = await supabase.from('blessings').select('*').order('created_at', { ascending: false });
      blessings = bData || [];
      const { data: rData } = await supabase.from('rsvp').select('*').order('created_at', { ascending: false });
      rsvps = rData || [];
    }

    res.setHeader('Content-Disposition', 'attachment; filename="wedding-data.json"');
    res.json({
      export_time: new Date().toISOString(),
      blessings,
      rsvps,
      totals: { blessings: blessings.length, rsvps: rsvps.length },
    });
  } catch (err) {
    console.error('导出数据失败:', err);
    res.status(500).json({ error: '导出数据失败' });
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
  console.log(supabase ? '✅ Supabase 数据库已连接' : '⚠️ Supabase 未配置');
  console.log(transporter ? '✅ 邮件通知已配置' : '⚠️ 邮件通知未配置');
});
