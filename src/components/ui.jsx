import { gradeClasses } from '../utils/grade';

export const inp = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';
export const btn = 'rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50';
export const btnRed = 'rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100';

export const Card = ({ title, children, className = '' }) => (
  <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5 ${className}`}>
    {title && <h2 className="mb-3 text-base font-bold text-slate-800">{title}</h2>}
    {children}
  </section>
);

export const GradeBadge = ({ value }) => (
  <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ring-2 ${gradeClasses(value)}`}>{value}</span>
);

export const Tabs = ({ tabs, value, onChange, t }) => (
  <nav className="mb-4 flex gap-2 overflow-x-auto pb-1">
    {tabs.map((k) => (
      <button key={k} onClick={() => onChange(k)}
        className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${value === k ? 'bg-indigo-600 text-white shadow' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50'}`}>
        {t(k)}
      </button>
    ))}
  </nav>
);

export const Empty = ({ t }) => <p className="py-4 text-center text-sm text-slate-400">{t('empty')}</p>;
export const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '');
