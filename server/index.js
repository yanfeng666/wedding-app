require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Supabase 配置
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 邮件配置（Resend HTTP API）
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || '';

// 管理端认证
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'wedding2026';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'wedding-admin-secret-2026';

// 密码哈希
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'wedding-salt').digest('hex');
}

// 验证用户（先查数据库，再查环境变量）
async function verifyUser(username, password) {
  const hashed = hashPassword(password);
  // 查数据库
  if (supabase) {
    const { data } = await supabase
      .from('admin_users')
      .select('id, username')
      .eq('username', username)
      .eq('password', hashed)
      .single();
    if (data) return { id: data.id, username: data.username };
  }
  // 回退到环境变量
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return { id: 0, username: ADMIN_USER };
  }
  return null;
}

// 默认配置（数据库未配置时使用）
const DEFAULT_CONFIG = {
  groom_name: '张三',
  bride_name: '李四',
  wedding_date: '2026-10-01T18:08:00',
  wedding_date_display: '2026年10月1日 · 星期四',
  hero_bg: '',
  story_bg: '',
  gallery_bg: '',
  info_bg: '',
  invitation_bg: '',
  navbar_logo: '我们结婚啦',
  footer_quote: '执子之手，与子偕老',
  text_color: '',
  heading_color: '',
  story_img_fit: 'cover',
  gallery_img_fit: 'cover',
  story_items: [
    { date: '2021年3月', title: '初次相遇', desc: '在一次朋友聚会上，我们第一次见到了彼此。你笑起来的样子，让我一见倾心。', img: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=400&h=300&fit=crop' },
    { date: '2022年6月', title: '第一次旅行', desc: '我们一起去了大理，在洱海边骑行，苍山下看云。那是最美好的夏天。', img: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=300&fit=crop' },
    { date: '2023年12月', title: '求婚', desc: '在初雪的夜晚，你单膝跪地，说出了那句我等待已久的话。Yes, I do.', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop' },
    { date: '2024年2月', title: '领证', desc: '在一个阳光明媚的早晨，我们成为了彼此生命中最重要的那个人。', img: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop' },
    { date: '2026年10月', title: '婚礼', desc: '终于等到这一天，我们要在所有亲友的见证下，许下一生的承诺。', img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop' },
  ],
  gallery_images: [
    { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', label: '幸福时刻' },
    { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', label: '甜蜜瞬间' },
    { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop', label: '浪漫时光' },
    { src: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&h=600&fit=crop', label: '携手同行' },
    { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&h=600&fit=crop', label: '爱的约定' },
    { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&h=600&fit=crop', label: '一生一世' },
  ],
  info_cards: [
    { icon: '📅', title: '婚礼日期', lines: ['2026年10月1日', '农历八月廿一', '星期四'] },
    { icon: '📍', title: '婚礼地点', lines: ['XX大酒店 · 宴会厅', 'XX市XX区XX路88号', '3楼百合厅'] },
    { icon: '⏰', title: '时间安排', lines: ['17:00 宾客签到', '18:08 婚礼仪式', '19:00 婚宴开始'] },
  ],
  invitation_text: {
    label: 'You are Invited',
    title: '诚挚邀请',
    names: '张三 & 李四',
    content: '谨定于2026年10月1日（星期四）\n在 XX大酒店 三楼百合厅\n举行结婚典礼\n届时恭请光临',
    details: ['🕐 17:00 迎宾', '📍 XX市XX区XX路88号'],
  },
};

// 敏感词列表
const PROFANITY_WORDS = [
  '傻逼', '操你', '草泥马', '滚蛋', '去死', '废物', '贱人', '婊子',
  '他妈的', '你妈', 'fuck', 'shit', 'bitch', 'damn', '混蛋', '王八蛋',
  '去你的', '猪', '狗屎', '垃圾', '恶心', '丑八怪', '神经病', '变态',
  '滚', '煞笔', '沙雕', '脑残', '智障', '弱智', '白痴', ' idiot',
];

function containsProfanity(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return PROFANITY_WORDS.some(word => lower.includes(word.toLowerCase()));
}

// ========== Token 工具 ==========
function createToken(username) {
  const payload = { username, exp: Date.now() + 24 * 60 * 60 * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
  return `${data}.${sig}`;
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', ADMIN_SECRET).update(data).digest('hex');
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// 管理端认证中间件
function requireAdmin(req, res, next) {
  const payload = verifyToken(req.headers.authorization);
  if (!payload) {
    return res.status(401).json({ error: '未授权，请重新登录' });
  }
  req.admin = payload;
  next();
}

// ========== 发送邮件 ==========
function sendNotification(subject, content) {
  if (!RESEND_API_KEY || !NOTIFY_EMAIL) return;
  const payload = JSON.stringify({
    from: 'Wedding App <onboarding@resend.dev>',
    to: [NOTIFY_EMAIL],
    subject,
    text: content,
  });
  const req = https.request({
    hostname: 'api.resend.com',
    path: '/emails',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    timeout: 10000,
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ 邮件通知已发送:', subject);
      } else {
        console.error('发送邮件失败:', res.statusCode, body);
      }
    });
  });
  req.on('error', (err) => console.error('发送邮件失败:', err.message));
  req.on('timeout', () => { req.destroy(); console.error('发送邮件超时'); });
  req.write(payload);
  req.end();
}

// ========== 获取配置 ==========
async function getConfig() {
  if (!supabase) return DEFAULT_CONFIG;
  try {
    const { data, error } = await supabase
      .from('wedding_config')
      .select('*')
      .eq('id', 1)
      .single();
    if (error || !data) return DEFAULT_CONFIG;
    // 合并默认值和数据库值
    return {
      ...DEFAULT_CONFIG,
      ...data,
      story_items: data.story_items || DEFAULT_CONFIG.story_items,
      gallery_images: data.gallery_images || DEFAULT_CONFIG.gallery_images,
      info_cards: data.info_cards || DEFAULT_CONFIG.info_cards,
      invitation_text: data.invitation_text || DEFAULT_CONFIG.invitation_text,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ========== 公开 API ==========

// 获取婚礼配置（公开）
app.get('/api/config', async (_req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 获取祝福列表（只返回已审核通过的）
app.get('/api/blessings', async (_req, res) => {
  try {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase
      .from('blessings')
      .select('*')
      .or('status.eq.approved,status.is.null')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('获取祝福失败:', err);
    res.status(500).json({ error: '获取祝福失败' });
  }
});

// 提交祝福（含敏感词检测）
app.post('/api/blessings', async (req, res) => {
  try {
    const { name, relation, message } = req.body;
    if (!name || !message) {
      return res.status(400).json({ error: '姓名和祝福内容不能为空' });
    }
    if (!supabase) return res.json({ id: Date.now(), success: true });

    const hasProfanity = containsProfanity(message) || containsProfanity(name);
    const status = hasProfanity ? 'pending' : 'approved';

    const { data, error } = await supabase
      .from('blessings')
      .insert([{ name, relation: relation || '亲友', message, status }])
      .select();
    if (error) throw error;

    if (!hasProfanity) {
      sendNotification(
        '💌 收到新的婚礼祝福',
        `${name}（${relation || '亲友'}）发送了祝福：\n\n${message}`
      );
    } else {
      sendNotification(
        '⚠️ 收到包含敏感词的祝福（待审核）',
        `${name}（${relation || '亲友'}）发送了祝福，但包含敏感词，已自动隔离：\n\n${message}`
      );
    }

    res.json({ id: data[0].id, success: true, status });
  } catch (err) {
    console.error('提交祝福失败:', err);
    res.status(500).json({ error: '提交祝福失败' });
  }
});

// RSVP
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

// 数据导出
app.get('/api/export', async (req, res) => {
  try {
    const exportKey = process.env.EXPORT_KEY || 'wedding2026';
    if (req.query.key !== exportKey) {
      return res.status(403).json({ error: '无权访问' });
    }

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

// ========== 管理端 API ==========

// 登录
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await verifyUser(username, password);
    if (user) {
      const token = createToken(user.username);
      res.json({ token, username: user.username });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch {
    res.status(500).json({ error: '登录失败' });
  }
});

// 验证 token
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ valid: true, username: req.admin.username });
});

// 获取完整配置（管理端）
app.get('/api/admin/config', requireAdmin, async (_req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: '获取配置失败' });
  }
});

// 更新配置
app.put('/api/admin/config', requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: '数据库未连接' });

    const allowedFields = [
      'groom_name', 'bride_name', 'wedding_date', 'wedding_date_display',
      'hero_bg', 'story_bg', 'gallery_bg', 'info_bg', 'invitation_bg',
      'navbar_logo', 'footer_quote',
      'text_color', 'heading_color', 'story_img_fit', 'gallery_img_fit',
      'story_items', 'gallery_images', 'info_cards', 'invitation_text',
    ];

    const update = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('wedding_config')
      .update(update)
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, config: data });
  } catch (err) {
    console.error('更新配置失败:', err);
    res.status(500).json({ error: '更新配置失败: ' + err.message });
  }
});

// 获取所有祝福（包括待审核）
app.get('/api/admin/blessings', requireAdmin, async (_req, res) => {
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

// 审核祝福（通过/拒绝）
app.put('/api/admin/blessings/:id', requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: '数据库未连接' });
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: '无效的状态' });
    }

    const { data, error } = await supabase
      .from('blessings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, blessing: data });
  } catch (err) {
    console.error('审核祝福失败:', err);
    res.status(500).json({ error: '审核失败' });
  }
});

// 删除祝福
app.delete('/api/admin/blessings/:id', requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: '数据库未连接' });
    const { id } = req.params;

    const { error } = await supabase
      .from('blessings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('删除祝福失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

// 获取所有 RSVP（管理端）
app.get('/api/admin/rsvps', requireAdmin, async (_req, res) => {
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

app.delete('/api/admin/rsvps/:id', requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.json({ success: true });
    const { error } = await supabase.from('rsvp').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('删除 RSVP 失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

// ========== 账号管理 API ==========

// admin_users 表的建表 SQL
const ADMIN_USERS_SQL = `CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`;

// 检查错误是否为"表不存在"
function isTableMissingError(err) {
  return err && (err.code === '42P01' || /does not exist|relation/i.test(err.message || ''));
}

// 获取账号列表
app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  try {
    if (!supabase) return res.json([]);
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, created_at')
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    if (isTableMissingError(err)) return res.json([]);
    console.error('获取用户列表失败:', err);
    res.status(500).json({ error: '获取失败' });
  }
});

// 获取建表 SQL（用于初始化）
app.get('/api/admin/users/schema', requireAdmin, (_req, res) => {
  res.json({ sql: ADMIN_USERS_SQL });
});

// 创建账号
app.post('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username?.trim() || !password?.trim()) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    if (!supabase) return res.status(500).json({ error: '数据库未配置' });
    // 检查重名
    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username.trim())
      .single();
    if (existing) return res.status(409).json({ error: '用户名已存在' });
    const { data, error } = await supabase
      .from('admin_users')
      .insert({ username: username.trim(), password: hashPassword(password) })
      .select('id, username, created_at')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('创建用户失败:', err);
    if (isTableMissingError(err)) {
      return res.status(500).json({
        error: 'admin_users 表不存在，请先在 Supabase SQL 编辑器中执行建表语句',
        sql: ADMIN_USERS_SQL,
      });
    }
    res.status(500).json({ error: '创建失败' });
  }
});

// 修改密码
app.put('/api/admin/users/:id/password', requireAdmin, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password?.trim()) {
      return res.status(400).json({ error: '密码不能为空' });
    }
    if (!supabase) return res.status(500).json({ error: '数据库未配置' });
    const { error } = await supabase
      .from('admin_users')
      .update({ password: hashPassword(password) })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('修改密码失败:', err);
    res.status(500).json({ error: '修改失败' });
  }
});

// 删除账号
app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: '数据库未配置' });
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('删除用户失败:', err);
    res.status(500).json({ error: '删除失败' });
  }
});

// ========== 静态文件服务 ==========

// 管理端静态文件
const adminDistPath = path.join(__dirname, '..', 'admin', 'dist');
app.use('/admin', express.static(adminDistPath));

// 客户端静态文件
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

// 管理端 SPA fallback
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(adminDistPath, 'index.html'));
});

// 客户端 SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  }
});

// ========== 启动服务 ==========
app.listen(PORT, () => {
  console.log(`💒 婚礼网站服务已启动: http://localhost:${PORT}`);
  console.log(`� 管理端: http://localhost:${PORT}/admin`);
  console.log(supabase ? '✅ Supabase 数据库已连接' : '⚠️ Supabase 未配置');
  console.log(RESEND_API_KEY ? '✅ 邮件通知已配置 (Resend API)' : '⚠️ 邮件通知未配置');
  console.log(`🔐 管理端账号: ${ADMIN_USER}`);
});
