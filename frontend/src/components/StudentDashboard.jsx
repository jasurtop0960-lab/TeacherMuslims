import { useEffect, useState } from 'react';
import { api } from '../api';
import { useT } from '../i18n.jsx';
import { useAuth } from '../App.jsx';
import { Card, Tabs, Empty, GradeBadge, inp, btn, fmt } from './ui.jsx';

export default function StudentDashboard() {
  const { t } = useT();
  const { user } = useAuth();
  const [tab, setTab] = useState('myGrades');
  return (
    <>
      {!user.groupId && <p className="mb-4 rounded-xl bg-yellow-50 p-3 text-sm text-yellow-800">{t('noGroup')}</p>}
      <MyComments />
      <Tabs tabs={['myGrades', 'homework', 'classmates']} value={tab} onChange={setTab} t={t} />
      {tab === 'myGrades' && <MyGrades />}
      {tab === 'homework' && <MyHomework />}
      {tab === 'classmates' && <Classmates />}
    </>
  );
}

function MyGrades() {
  const { t } = useT();
  const [g, setG] = useState([]);
  useEffect(() => { api('/student/grades').then(setG); }, []);
  const avg = g.length ? (g.reduce((s, x) => s + x.value, 0) / g.length).toFixed(1) : null;
  return (
    <Card title={t('myGrades')}>
      {avg && <p className="mb-3 text-sm text-slate-500">{t('average')}: <b>{avg}</b></p>}
      {!g.length ? <Empty t={t} /> : (
        <ul className="divide-y">
          {g.map((x) => (
            <li key={x._id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0"><p className="truncate font-medium text-slate-800">{x.lessonId?.title}</p><p className="text-xs text-slate-400">{fmt(x.date)}</p></div>
              <GradeBadge value={x.value} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function MyHomework() {
  const { t } = useT();
  const [list, setList] = useState([]);
  const [text, setText] = useState({});
  const load = () => api('/student/homework').then(setList);
  useEffect(() => { load(); }, []);
  const send = async (id) => { await api(`/student/homework/${id}/submit`, { method: 'POST', body: { text: text[id] } }); load(); };
  return !list.length ? <Card><Empty t={t} /></Card> : (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((h) => (
        <Card key={h._id}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-slate-800">{h.title}</h3>
            {h.submission && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">{t('submitted')}</span>}
          </div>
          {h.lessonId && <p className="text-xs text-indigo-500">{h.lessonId.title}</p>}
          <p className="my-2 whitespace-pre-wrap text-sm text-slate-600">{h.description}</p>
          {h.dueDate && <p className="mb-2 text-xs text-slate-400">{t('dueDate')}: {fmt(h.dueDate)}</p>}
          <textarea className={inp} rows={3} placeholder={t('answer')} defaultValue={h.submission?.text} onChange={(e) => setText({ ...text, [h._id]: e.target.value })} />
          <button className={btn + ' mt-2'} disabled={!text[h._id]} onClick={() => send(h._id)}>{t('submit')}</button>
        </Card>
      ))}
    </div>
  );
}

function Classmates() {
  const { t } = useT();
  const [list, setList] = useState([]);
  const [sel, setSel] = useState(null);
  useEffect(() => { api('/student/classmates').then(setList); }, []);
  return (
    <Card title={t('classmates')}>
      {!list.length ? <Empty t={t} /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((s) => (
            <button key={s._id} onClick={() => setSel(s)} className="rounded-2xl bg-slate-50 p-3 text-center ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 text-lg font-bold text-white">{s.name[0]}{s.surname[0]}</div>
              <p className="truncate text-sm font-semibold">{s.name} {s.surname}</p>
            </button>
          ))}
        </div>
      )}
      {sel && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/40 p-4" onClick={() => setSel(null)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-indigo-400 to-fuchsia-400 text-2xl font-bold text-white">{sel.name[0]}{sel.surname[0]}</div>
            <h3 className="text-lg font-bold">{sel.name} {sel.surname}</h3>
            <p className="text-sm text-slate-500">{t('role_student')}</p>
            <p className="mt-1 text-xs text-slate-400">{t('joined')}: {fmt(sel.createdAt)}</p>
          </div>
        </div>
      )}
    </Card>
  );
}

// Ustoz izohlari — sahifa tepasida doim ko'rinib turadi
function MyComments() {
  const { t } = useT();
  const [list, setList] = useState([]);
  useEffect(() => { api('/student/comments').then(setList); }, []);
  if (!list.length) return null;
  return (
    <Card title={`💬 ${t('comments')}`} className="mb-4">
      <ul className="max-h-56 space-y-2 overflow-y-auto">
        {list.map((c) => (
          <li key={c._id} className={`rounded-xl p-3 text-sm ${c.studentId ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'bg-slate-50 ring-1 ring-slate-200'}`}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-xs text-slate-500">
              <span><b>{c.authorId?.name} {c.authorId?.surname}</b> · {c.studentId ? t('forYou') : t('forGroup')}</span>
              <span>{fmt(c.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap text-slate-800">{c.text}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
