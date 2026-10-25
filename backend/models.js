const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

const User = mongoose.model('User', new Schema({
  name: { type: String, required: true, trim: true },
  surname: { type: String, default: '', trim: true },
  fullName: { type: String, index: true },          // "ism familiya" (lowercase)
  passwordHash: { type: String, required: true },   // bcrypt
  passKey: { type: String, required: true, unique: true }, // HMAC(parol) -> parol unikal
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'student' },
  groupId: { ...ref('Group'), default: null },
}, { timestamps: true }));

const Group = mongoose.model('Group', new Schema({
  name: { type: String, required: true, trim: true },
  teacherId: ref('User'),
  studentIds: [ref('User')],
}, { timestamps: true }));

const Lesson = mongoose.model('Lesson', new Schema({
  title: { type: String, required: true },
  groupId: { ...ref('Group'), required: true },
  date: { type: Date, default: Date.now },
}));

const Homework = mongoose.model('Homework', new Schema({
  title: { type: String, required: true },
  description: String,
  groupId: { ...ref('Group'), required: true },
  lessonId: ref('Lesson'),                          // ixtiyoriy: mavzuga biriktirish
  dueDate: Date,
}, { timestamps: true }));

const Submission = mongoose.model('Submission', new Schema({
  homeworkId: ref('Homework'), studentId: ref('User'), text: String,
}, { timestamps: true }));
Submission.schema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

const Grade = mongoose.model('Grade', new Schema({
  studentId: { ...ref('User'), required: true },
  lessonId: { ...ref('Lesson'), required: true },
  value: { type: Number, min: 1, max: 10, required: true },
  date: { type: Date, default: Date.now },
}));
Grade.schema.index({ studentId: 1, lessonId: 1 }, { unique: true });

// Ustoz izohi: studentId bor -> shaxsiy izoh, yo'q (null) -> butun guruhga
const Comment = mongoose.model('Comment', new Schema({
  authorId: ref('User'),
  groupId: { ...ref('Group'), required: true },
  studentId: { ...ref('User'), default: null },
  text: { type: String, required: true, trim: true },
}, { timestamps: true }));

module.exports = { User, Group, Lesson, Homework, Submission, Grade, Comment };
