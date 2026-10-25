// Admin + O'qituvchi: foydalanuvchilar, guruhlar. (Admin ham o'qituvchi vazifasini bajaradi)
const router = require('express').Router();
const { User, Group, Grade, Submission, Lesson, Homework, Comment } = require('../models');
const { createUser, auth, canGroup } = require('../lib');

router.use(auth(['admin', 'teacher']));

// Guruhga qo'shilmagan o'quvchilar
router.get('/unassigned', async (_req, res) =>
  res.json(await User.find({ role: 'student', groupId: null }).select('name surname createdAt').sort('-createdAt')));

// Guruhga biriktirish
router.post('/assign', async (req, res) => {
  const { studentId, groupId } = req.body;
  if (!(await canGroup(req.user, groupId))) return res.status(403).json({ code: 'FORBIDDEN' });
  const s = await User.findOneAndUpdate({ _id: studentId, role: 'student' }, { groupId }, { new: true });
  if (!s) return res.status(404).json({ code: 'NOT_FOUND' });
  await Group.updateMany({ studentIds: s._id }, { $pull: { studentIds: s._id } });
  await Group.findByIdAndUpdate(groupId, { $addToSet: { studentIds: s._id } });
  res.json({ ok: true });
});

// Tizimdan o'chirish (o'qituvchi faqat guruhsiz o'quvchini, admin istalganini)
router.delete('/users/:id', async (req, res) => {
  const s = await User.findOne({ _id: req.params.id, role: 'student' });
  if (!s) return res.status(404).json({ code: 'NOT_FOUND' });
  if (s.groupId && req.user.role !== 'admin') return res.status(403).json({ code: 'FORBIDDEN' });
  await Promise.all([
    Group.updateMany({}, { $pull: { studentIds: s._id } }),
    Grade.deleteMany({ studentId: s._id }), Submission.deleteMany({ studentId: s._id }),
    Comment.deleteMany({ studentId: s._id }), s.deleteOne(),
  ]);
  res.json({ ok: true });
});

// Guruhlar
router.get('/groups', async (req, res) => {
  const q = req.user.role === 'admin' ? {} : { teacherId: req.user.id };
  res.json(await Group.find(q).populate('studentIds', 'name surname').sort('name'));
});
router.post('/groups', async (req, res) => {
  if (!req.body.name) return res.status(400).json({ code: 'WEAK' });
  const teacherId = req.user.role === 'admin' && req.body.teacherId ? req.body.teacherId : req.user.id;
  res.status(201).json(await Group.create({ name: req.body.name, teacherId }));
});

// Guruhni o'chirish: o'quvchilar guruhsiz bo'lib qoladi, mavzu/vazifa/baho/izohlar o'chadi
router.delete('/groups/:id', async (req, res) => {
  const id = req.params.id;
  if (!(await canGroup(req.user, id))) return res.status(403).json({ code: 'FORBIDDEN' });
  const [lessons, hws] = await Promise.all([Lesson.find({ groupId: id }).select('_id'), Homework.find({ groupId: id }).select('_id')]);
  await Promise.all([
    User.updateMany({ groupId: id }, { groupId: null }),
    Grade.deleteMany({ lessonId: { $in: lessons.map((l) => l._id) } }),
    Submission.deleteMany({ homeworkId: { $in: hws.map((h) => h._id) } }),
    Lesson.deleteMany({ groupId: id }), Homework.deleteMany({ groupId: id }),
    Comment.deleteMany({ groupId: id }), Group.findByIdAndDelete(id),
  ]);
  res.json({ ok: true });
});

// --- Faqat admin: o'qituvchilar ---
router.get('/teachers', auth(['admin']), async (_req, res) =>
  res.json(await User.find({ role: 'teacher' }).select('name surname')));
router.post('/teachers', auth(['admin']), async (req, res) => {
  try {
    const u = await createUser({ ...req.body, role: 'teacher' });
    res.status(201).json({ id: u._id });
  } catch (e) { res.status(e.message === 'PASSWORD_TAKEN' ? 409 : 400).json({ code: e.message }); }
});

module.exports = router;
