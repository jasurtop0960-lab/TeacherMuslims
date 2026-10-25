// 8-10 -> yashil, 5-7 -> sariq, 1-4 -> qizil
export const gradeTone = (v) => (v >= 8 ? 'success' : v >= 5 ? 'warning' : 'danger');

const CLASSES = {
  success: 'bg-green-100 text-green-800 ring-green-400',
  warning: 'bg-yellow-100 text-yellow-800 ring-yellow-400',
  danger: 'bg-red-100 text-red-800 ring-red-400',
};
export const gradeClasses = (v) => (v ? CLASSES[gradeTone(v)] : 'bg-white text-slate-400 ring-slate-300');
