const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { passKey, norm, createUser, sign, publicUser, auth } = require('../lib');

// Ro'yxatdan o'tish (faqat o'quvchi, guruhsiz holatda)
router.post('/register', async (req, res) => {
  try {
    const { name, surname, password } = req.body;
    if (!surname) return res.status(400).json({ code: 'WEAK' });
    await createUser({ name, surname, password, role: 'student' });
    res.status(201).json({ ok: true });
  } catch (e) { res.status(e.message === 'PASSWORD_TAKEN' ? 409 : 400).json({ code: e.message }); }
});

// Kirish: foydalanuvchi PAROL orqali topiladi (unikal), ism-familiya tasdiqlanadi
router.post('/login', async (req, res) => {
  const { fullName, password } = req.body;
  const u = await User.findOne({ passKey: passKey(password || '') });
  if (!u || u.fullName !== norm(fullName) || !(await bcrypt.compare(String(password), u.passwordHash)))
    return res.status(401).json({ code: 'INVALID' });
  res.json({ token: sign(u), user: publicUser(u) });
});

router.get('/me', auth(), async (req, res) => {
  const u = await User.findById(req.user.id);
  u ? res.json(publicUser(u)) : res.status(401).json({ code: 'UNAUTHORIZED' });
});

// O'qituvchi/Admin o'z parolini almashtiradi (eski parol tekshiriladi, yangi parol unikal bo'lishi shart)
router.post('/change-password', auth(['admin', 'teacher']), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 6) return res.status(400).json({ code: 'WEAK' });
  const u = await User.findById(req.user.id);
  if (!u || !(await bcrypt.compare(String(oldPassword || ''), u.passwordHash))) return res.status(401).json({ code: 'INVALID_OLD' });
  const key = passKey(newPassword);
  if (key !== u.passKey && (await User.exists({ passKey: key }))) return res.status(409).json({ code: 'PASSWORD_TAKEN' });
  u.passwordHash = await bcrypt.hash(String(newPassword), 10);
  u.passKey = key;
  await u.save();
  res.json({ ok: true });
});

module.exports = router;
