// Mavzular, uy vazifalari, baholar
const router = require('express').Router();
const { Lesson, Homework, Grade, Submission, User, Comment } = require('../models');
const { auth, canGroup } = require('../lib');

router.use(auth(['admin', 'teacher']));

const guard = async (req, res, next) => {
  const gid = req.query.groupId || req.body.groupId;
  if (!gid || !(await canGroup(req.user, gid))) return res.status(403).json({ code: 'FORBIDDEN' });
  next();
};

router.get('/lessons', guard, async (req, res) => res.json(await Lesson.find({ groupId: req.query.groupId }).sort('date')));
router.post('/lessons', guard, async (req, res) => {
  const { title, groupId, date } = req.body;
  if (!title) return res.status(400).json({ code: 'WEAK' });
  res.status(201).json(await Lesson.create({ title, groupId, date: date || Date.now() }));
});

router.get('/homework', guard, async (req, res) =>
  res.json(await Homework.find({ groupId: req.query.groupId }).populate('lessonId', 'title').sort('-createdAt')));
router.post('/homework', guard, async (req, res) => {
  const { title, description, groupId, lessonId, dueDate } = req.body;
  if (!title) return res.status(400).json({ code: 'WEAK' });
  res.status(201).json(await Homework.create({ title, description, groupId, lessonId: lessonId || undefined, dueDate }));
});
router.get('/homework/:id/submissions', async (req, res) => {
  const hw = await Homework.findById(req.params.id);
  if (!hw || !(await canGroup(req.user, hw.groupId))) return res.status(403).json({ code: 'FORBIDDEN' });
  res.json(await Submission.find({ homeworkId: hw._id }).populate('studentId', 'name surname'));
});

// Baholar jadvali: guruh o'quvchilari x mavzular
router.get('/grades', guard, async (req, res) => {
  const lessons = await Lesson.find({ groupId: req.query.groupId }).select('_id');
  res.json(await Grade.find({ lessonId: { $in: lessons.map((l) => l._id) } }));
});
router.put('/grades', guard, async (req, res) => {
  const { studentId, lessonId, groupId, value } = req.body;
  const v = Number(value);
  if (!Number.isInteger(v) || v < 1 || v > 10) return res.status(400).json({ code: 'WEAK' });
  const [lesson, stu] = await Promise.all([
    Lesson.findOne({ _id: lessonId, groupId }), User.findOne({ _id: studentId, groupId }),
  ]);
  if (!lesson || !stu) return res.status(404).json({ code: 'NOT_FOUND' });
  res.json(await Grade.findOneAndUpdate({ studentId, lessonId }, { value: v, date: Date.now() }, { upsert: true, new: true }));
});
router.delete('/grades', guard, async (req, res) => {
  await Grade.deleteOne({ studentId: req.body.studentId, lessonId: req.body.lessonId });
  res.json({ ok: true });
});

// Izohlar: butun guruhga yoki bitta o'quvchiga
router.get('/comments', guard, async (req, res) =>
  res.json(await Comment.find({ groupId: req.query.groupId }).populate('studentId', 'name surname').sort('-createdAt')));
router.post('/comments', guard, async (req, res) => {
  const { groupId, studentId, text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ code: 'WEAK' });
  if (studentId && !(await User.exists({ _id: studentId, groupId }))) return res.status(404).json({ code: 'NOT_FOUND' });
  res.status(201).json(await Comment.create({ authorId: req.user.id, groupId, studentId: studentId || null, text }));
});
router.delete('/comments/:id', async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c || !(await canGroup(req.user, c.groupId))) return res.status(403).json({ code: 'FORBIDDEN' });
  await c.deleteOne();
  res.json({ ok: true });
});

module.exports = router;
