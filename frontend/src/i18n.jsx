import { createContext, useContext, useState } from 'react';

const dict = {
  uz: {
    changePassword: 'Parolni almashtirish', oldPassword: 'Eski parol', newPassword: 'Yangi parol', repeatPassword: 'Yangi parolni takrorlang', passwordChanged: 'Parol almashtirildi', err_INVALID_OLD: "Eski parol noto'g'ri", err_MISMATCH: 'Yangi parollar bir xil emas', comments: 'Izohlar', wholeGroup: "Butun guruhga", writeComment: "Izoh yozing...", send: 'Yuborish', forYou: 'Sizga', forGroup: 'Guruhga', confirmDelGroup: "Guruh o'chirilsinmi? Mavzular, uy vazifalari va baholar ham o'chadi.", addTopic: 'Mavzu qo\'shish', login: 'Kirish', register: "Ro'yxatdan o'tish",
    fullName: 'Ism Familiya', name: 'Ism', surname: 'Familiya', password: 'Parol', logout: 'Chiqish',
    registered: "Ro'yxatdan o'tdingiz! Endi tizimga kiring.",
    noAccount: "Hisobingiz yo'qmi?", haveAccount: 'Hisobingiz bormi?',
    students: "O'quvchilar", unassigned: "Guruhsiz o'quvchilar", assign: "Guruhga qo'shish", del: "O'chirish",
    confirmDel: "O'quvchi tizimdan butunlay o'chirilsinmi?", pickGroup: 'Guruhni tanlang',
    groups: 'Guruhlar', newGroup: 'Yangi guruh', groupName: 'Guruh nomi', add: "Qo'shish", save: 'Saqlash',
    lessons: 'Mavzular', topic: 'Dars mavzusi', date: 'Sana',
    homework: 'Uy vazifalari', title: 'Sarlavha', description: 'Tavsif', dueDate: 'Muddat', linkTopic: 'Mavzu (ixtiyoriy)',
    grades: 'Baholar', myGrades: 'Mening baholarim', classmates: 'Guruhdoshlar', teachers: "O'qituvchilar",
    newTeacher: "Yangi o'qituvchi", submit: 'Topshirish', answer: 'Javobingiz', submitted: 'Topshirilgan', submissions: 'Javoblar',
    empty: "Hozircha ma'lumot yo'q", noGroup: "Siz hali guruhga qo'shilmagansiz", average: "O'rtacha",
    role_admin: 'Admin', role_teacher: "O'qituvchi", role_student: "O'quvchi", joined: "Ro'yxatdan o'tgan",
    err_INVALID: "Ism-familiya yoki parol noto'g'ri", err_PASSWORD_TAKEN: 'Bu parol band, boshqa parol tanlang',
    err_WEAK: "Maydonlarni to'g'ri to'ldiring (parol kamida 6 belgi)", err_FORBIDDEN: "Ruxsat yo'q",
    err_UNAUTHORIZED: 'Qayta kiring', err_NOT_FOUND: 'Topilmadi', err_ERROR: 'Xatolik yuz berdi',
  },
  ru: {
    changePassword: 'Сменить пароль', oldPassword: 'Старый пароль', newPassword: 'Новый пароль', repeatPassword: 'Повторите новый пароль', passwordChanged: 'Пароль изменён', err_INVALID_OLD: 'Старый пароль неверный', err_MISMATCH: 'Новые пароли не совпадают', comments: 'Комментарии', wholeGroup: 'Всей группе', writeComment: 'Напишите комментарий...', send: 'Отправить', forYou: 'Вам', forGroup: 'Группе', confirmDelGroup: 'Удалить группу? Темы, задания и оценки тоже удалятся.', addTopic: 'Добавить тему', login: 'Вход', register: 'Регистрация',
    fullName: 'Имя Фамилия', name: 'Имя', surname: 'Фамилия', password: 'Пароль', logout: 'Выйти',
    registered: 'Вы зарегистрированы! Теперь войдите в систему.',
    noAccount: 'Нет аккаунта?', haveAccount: 'Есть аккаунт?',
    students: 'Ученики', unassigned: 'Ученики без группы', assign: 'Добавить в группу', del: 'Удалить',
    confirmDel: 'Удалить ученика из системы полностью?', pickGroup: 'Выберите группу',
    groups: 'Группы', newGroup: 'Новая группа', groupName: 'Название группы', add: 'Добавить', save: 'Сохранить',
    lessons: 'Темы', topic: 'Тема урока', date: 'Дата',
    homework: 'Домашние задания', title: 'Заголовок', description: 'Описание', dueDate: 'Срок', linkTopic: 'Тема (необязательно)',
    grades: 'Оценки', myGrades: 'Мои оценки', classmates: 'Одногруппники', teachers: 'Учителя',
    newTeacher: 'Новый учитель', submit: 'Сдать', answer: 'Ваш ответ', submitted: 'Сдано', submissions: 'Ответы',
    empty: 'Пока нет данных', noGroup: 'Вы ещё не добавлены в группу', average: 'Средний балл',
    role_admin: 'Админ', role_teacher: 'Учитель', role_student: 'Ученик', joined: 'Дата регистрации',
    err_INVALID: 'Неверное имя-фамилия или пароль', err_PASSWORD_TAKEN: 'Этот пароль занят, выберите другой',
    err_WEAK: 'Заполните поля правильно (пароль минимум 6 символов)', err_FORBIDDEN: 'Нет доступа',
    err_UNAUTHORIZED: 'Войдите заново', err_NOT_FOUND: 'Не найдено', err_ERROR: 'Произошла ошибка',
  },
};

const Ctx = createContext();
export function I18nProvider({ children }) {
  const [lang, setLang] = useState(localStorage.lang || 'uz');
  const change = (l) => { localStorage.lang = l; setLang(l); };
  const t = (k) => dict[lang][k] ?? k;
  return <Ctx.Provider value={{ lang, setLang: change, t }}>{children}</Ctx.Provider>;
}
export const useT = () => useContext(Ctx);
