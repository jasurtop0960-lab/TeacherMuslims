const router = require('express').Router();
const { User, Grade, Homework, Submission, Comment } = require('../models');
const { auth } = require('../lib');

router.use(auth(['student']));

const me = (req) => User.findById(req.user.id);

router.get('/grades', async (req, res) =>
  res.json(await Grade.find({ studentId: req.user.id }).populate('lessonId', 'title date').sort('-date')));

router.get('/homework', async (req, res) => {
  const u = await me(req);
  if (!u.groupId) return res.json([]);
  const [list, subs] = await Promise.all([
    Homework.find({ groupId: u.groupId }).populate('lessonId', 'title').sort('-createdAt').lean(),
    Submission.find({ studentId: u._id }).lean(),
  ]);
  const map = Object.fromEntries(subs.map((s) => [String(s.homeworkId), s]));
  res.json(list.map((h) => ({ ...h, submission: map[String(h._id)] || null })));
});

router.post('/homework/:id/submit', async (req, res) => {
  const u = await me(req);
  const hw = await Homework.findOne({ _id: req.params.id, groupId: u.groupId });
  if (!hw || !req.body.text) return res.status(400).json({ code: 'WEAK' });
  res.json(await Submission.findOneAndUpdate({ homeworkId: hw._id, studentId: u._id }, { text: req.body.text }, { upsert: true, new: true }));
});

// Guruhdoshlar ro'yxati (profil uchun)
router.get('/classmates', async (req, res) => {
  const u = await me(req);
  if (!u.groupId) return res.json([]);
  res.json(await User.find({ groupId: u.groupId, role: 'student' }).select('name surname createdAt').sort('surname name'));
});

// Ustoz izohlari: o'ziga yozilganlar + butun guruhga yozilganlar
router.get('/comments', async (req, res) => {
  const u = await me(req);
  const or = [{ studentId: u._id }];
  if (u.groupId) or.push({ groupId: u.groupId, studentId: null });
  res.json(await Comment.find({ $or: or }).populate('authorId', 'name surname').sort('-createdAt').limit(50));
});

module.exports = router;
