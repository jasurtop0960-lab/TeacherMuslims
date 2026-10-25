require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { User } = require('./models');
const { createUser } = require('./lib');

const app = express();
app.use(cors(), express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/student', require('./routes/student'));

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  // Birinchi ishga tushishda Admin yaratiladi: ism "Muslima", familiya yo'q
  if (!(await User.exists({ role: 'admin' })))
    await createUser({ name: 'Muslima', surname: '', password: process.env.ADMIN_PASSWORD || '190991', role: 'admin' });
  app.listen(process.env.PORT || 5000, () => console.log('TeacherM API ishga tushdi'));
})();
