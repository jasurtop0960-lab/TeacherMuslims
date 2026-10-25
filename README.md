# TeacherM — LMS (React + Express + MongoDB)

## Ishga tushirish
Backend:
  cd backend && npm i && cp .env.example .env && npm run dev
Frontend:
  cd frontend && npm i && npm run dev   (http://localhost:5173)

Birinchi ishga tushishda Admin avtomatik yaratiladi:
  Ism: Muslima (familiya yo'q)  |  Parol: .env dagi ADMIN_PASSWORD (190991)
Demo-kirish tugmasi yo'q. O'quvchilar "Ro'yxatdan o'tish" orqali kiradi,
o'qituvchilarni Admin yaratadi.

## Yangiliklar
- Mavzular bo'limi yo'q: ustoz mavzuni "Baholar" bo'limida o'zi qo'shadi.
- Guruhsiz o'quvchilar va guruhlar bitta "Guruhlar" bo'limida; guruhni o'chirish mumkin.
- Izohlar: ustoz butun guruhga yoki bitta o'quvchiga izoh yozadi, o'quvchi sahifasi tepasida ko'rinib turadi.
- MongoDB o'rnatmasangiz: https://www.mongodb.com/atlas (bepul) dan ulanish manzilini oling va backend/.env dagi MONGO_URI ga yozing.
