const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Group } = require('./models');

const passKey = (p) => crypto.createHmac('sha256', process.env.PASS_SECRET).update(String(p)).digest('hex');
const norm = (s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();

async function createUser({ name, surname = '', password, role = 'student' }) {
  if (!name || !password || String(password).length < 6) throw new Error('WEAK');
  const key = passKey(password);
  if (await User.findOne({ passKey: key })) throw new Error('PASSWORD_TAKEN'); // parol unikal
  return User.create({
    name: name.trim(), surname: surname.trim(), role,
    fullName: norm(`${name} ${surname}`),
    passwordHash: await bcrypt.hash(String(password), 10), passKey: key,
  });
}

const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u._id, name: u.name, surname: u.surname, role: u.role, groupId: u.groupId });

// auth(['admin','teacher']) — token + rol tekshiruvi
const auth = (roles = []) => (req, res, next) => {
  try {
    const p = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET);
    if (roles.length && !roles.includes(p.role)) return res.status(403).json({ code: 'FORBIDDEN' });
    req.user = { id: p.id, role: p.role };
    next();
  } catch { res.status(401).json({ code: 'UNAUTHORIZED' }); }
};

const canGroup = async (user, gid) =>
  user.role === 'admin' || !!(await Group.exists({ _id: gid, teacherId: user.id }));

module.exports = { passKey, norm, createUser, sign, publicUser, auth, canGroup };
