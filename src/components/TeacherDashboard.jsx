import { useEffect, useState } from 'react';
import { api } from '../api';
import { useT } from '../i18n.jsx';
import { gradeClasses } from '../utils/grade';
import { Card, Tabs, Empty, inp, btn, btnRed, fmt } from './ui.jsx';

// Admin ham shu komponentdan foydalanadi (Admin = O'qituvchi + qo'shimcha)
export default function TeacherDashboard() {
  const { t } = useT();
  const [tab, setTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [gid, setGid] = useState('');
  const loadGroups = () => api('/admin/groups').then((g) => { setGroups(g); setGid((c) => (g.some((x) => x._id === c) ? c : g[0]?._id || '')); });
  useEffect(() => { loadGroups(); }, []);
  const needsGroup = tab !== 'groups';
  const group = groups.find((g) => g._id === gid);

  return (
    <>
      <Tabs tabs={['groups', 'homework', 'grades', 'comments']} value={tab} onChange={setTab} t={t} />
      {needsGroup && (
        <select className={inp + ' mb-4 max-w-xs'} value={gid} onChange={(e) => setGid(e.target.value)}>
          {!groups.length && <option value="">{t('pickGroup')}</option>}
          {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
      )}
      {tab === 'groups' && <Groups groups={groups} reload={loadGroups} />}
      {needsGroup && !gid && <Card><Empty t={t} /></Card>}
      {tab === 'homework' && gid && <Homework gid={gid} />}
      {tab === 'grades' && gid && <Grades gid={gid} group={group} />}
      {tab === 'comments' && gid && <Comments gid={gid} group={group} />}
    </>
  );
}

// Guruhsiz o'quvchilar + guruhlar bir joyda
function Groups({ groups, reload }) {
  const { t } = useT();
  const [un, setUn] = useState([]);
  const [pick, setPick] = useState({});
  const [name, setName] = useState('');
  const loadUn = () => api('/admin/unassigned').then(setUn);
  useEffect(() => { loadUn(); }, []);
  const assign = async (id) => { await api('/admin/assign', { method: 'POST', body: { studentId: id, groupId: pick[id] } }); loadUn(); reload(); };
  const remove = async (id) => { if (confirm(t('confirmDel'))) { await api('/admin/users/' + id, { method: 'DELETE' }); loadUn(); } };
  const addGroup = async (e) => { e.preventDefault(); await api('/admin/groups', { method: 'POST', body: { name } }); setName(''); reload(); };
  const delGroup = async (id) => { if (confirm(t('confirmDelGroup'))) { await api('/admin/groups/' + id, { method: 'DELETE' }); reload(); loadUn(); } };
  return (
    <div className="space-y-4">
      <Card title={`${t('unassigned')}${un.length ? ` (${un.length})` : ''}`}>
        {!un.length ? <Empty t={t} /> : (
          <ul className="divide-y">
            {un.map((s) => (
              <li key={s._id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="font-medium">{s.name} {s.surname}</p><p className="text-xs text-slate-400">{fmt(s.createdAt)}</p></div>
                <div className="flex flex-wrap gap-2">
                  <select className={inp + ' !w-40'} value={pick[s._id] || ''} onChange={(e) => setPick({ ...pick, [s._id]: e.target.value })}>
                    <option value="">{t('pickGroup')}</option>
                    {groups.map((g) => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                  <button className={btn} disabled={!pick[s._id]} onClick={() => assign(s._id)}>{t('assign')}</button>
                  <button className={btnRed} onClick={() => remove(s._id)}>{t('del')}</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card title={t('newGroup')}>
          <form onSubmit={addGroup} className="space-y-2">
            <input className={inp} placeholder={t('groupName')} value={name} onChange={(e) => setName(e.target.value)} required />
            <button className={btn + ' w-full'}>{t('add')}</button>
          </form>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 md:col-span-2">
          {!groups.length && <Card><Empty t={t} /></Card>}
          {groups.map((g) => (
            <Card key={g._id}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="font-bold">{g.name} ({g.studentIds.length})</h3>
                <button className={btnRed + ' !px-2.5 !py-1 text-xs'} onClick={() => delGroup(g._id)}>{t('del')}</button>
              </div>
              <ul className="space-y-1 text-sm text-slate-600">{g.studentIds.map((s) => <li key={s._id}>• {s.name} {s.surname}</li>)}</ul>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Homework({ gid }) {
  const { t } = useT();
  const [list, setList] = useState([]);
  const [f, setF] = useState({ title: '', description: '', dueDate: '' });
  const [subs, setSubs] = useState({});
  const load = () => api('/teacher/homework?groupId=' + gid).then(setList);
  useEffect(() => { load(); }, [gid]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => { e.preventDefault(); await api('/teacher/homework', { method: 'POST', body: { ...f, groupId: gid } }); setF({ title: '', description: '', dueDate: '' }); load(); };
  const toggle = async (id) => setSubs({ ...subs, [id]: subs[id] ? null : await api(`/teacher/homework/${id}/submissions`) });
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title={t('homework')}>
        <form onSubmit={add} className="space-y-2">
          <input className={inp} placeholder={t('title')} value={f.title} onChange={set('title')} required />
          <textarea className={inp} rows={3} placeholder={t('description')} value={f.description} onChange={set('description')} />
          <input className={inp} type="date" value={f.dueDate} onChange={set('dueDate')} />
          <button className={btn + ' w-full'}>{t('add')}</button>
        </form>
      </Card>
      <div className="space-y-4 md:col-span-2">
        {!list.length && <Card><Empty t={t} /></Card>}
        {list.map((h) => (
          <Card key={h._id}>
            <h3 className="font-bold">{h.title}</h3>
            <p className="my-1 whitespace-pre-wrap text-sm text-slate-600">{h.description}</p>
            {h.dueDate && <p className="text-xs text-slate-400">{t('dueDate')}: {fmt(h.dueDate)}</p>}
            <button className="mt-2 text-sm font-semibold text-indigo-600" onClick={() => toggle(h._id)}>{t('submissions')}</button>
            {subs[h._id] && (subs[h._id].length ? subs[h._id].map((s) => (
              <div key={s._id} className="mt-2 rounded-lg bg-slate-50 p-2 text-sm"><b>{s.studentId?.name} {s.studentId?.surname}:</b> {s.text}</div>
            )) : <Empty t={t} />)}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Mavzuni ustoz shu yerning o'zida qo'shadi; ustun = mavzu, katak = baho (1-10)
function Grades({ gid, group }) {
  const { t } = useT();
  const [lessons, setLessons] = useState([]);
  const [grades, setGrades] = useState({});
  const [topic, setTopic] = useState('');
  const loadLessons = () => api('/teacher/lessons?groupId=' + gid).then(setLessons);
  useEffect(() => {
    loadLessons();
    api('/teacher/grades?groupId=' + gid).then((g) => setGrades(Object.fromEntries(g.map((x) => [`${x.studentId}_${x.lessonId}`, x.value]))));
  }, [gid]);
  const addTopic = async (e) => { e.preventDefault(); await api('/teacher/lessons', { method: 'POST', body: { title: topic, groupId: gid } }); setTopic(''); loadLessons(); };
  const put = async (studentId, lessonId, value) => {
    const k = `${studentId}_${lessonId}`;
    if (!value) { await api('/teacher/grades', { method: 'DELETE', body: { studentId, lessonId, groupId: gid } }); setGrades((g) => ({ ...g, [k]: undefined })); return; }
    await api('/teacher/grades', { method: 'PUT', body: { studentId, lessonId, groupId: gid, value: +value } });
    setGrades((g) => ({ ...g, [k]: +value }));
  };
  const students = group?.studentIds || [];
  return (
    <Card title={t('grades')}>
      <form onSubmit={addTopic} className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input className={inp + ' sm:max-w-xs'} placeholder={t('topic')} value={topic} onChange={(e) => setTopic(e.target.value)} required />
        <button className={btn}>+ {t('add')}</button>
      </form>
      {!students.length || !lessons.length ? <Empty t={t} /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr>
              <th className="sticky left-0 bg-white px-2 py-2 text-left">{t('students')}</th>
              {lessons.map((l) => <th key={l._id} className="min-w-[72px] px-1 py-2 text-xs font-semibold text-slate-500"><div className="line-clamp-2">{l.title}</div><div className="font-normal text-slate-400">{fmt(l.date)}</div></th>)}
            </tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id} className="border-t">
                  <td className="sticky left-0 whitespace-nowrap bg-white px-2 py-2 font-medium">{s.name} {s.surname}</td>
                  {lessons.map((l) => {
                    const v = grades[`${s._id}_${l._id}`];
                    return (
                      <td key={l._id} className="px-1 py-1.5 text-center">
                        <select value={v || ''} onChange={(e) => put(s._id, l._id, e.target.value)}
                          className={`h-9 w-14 cursor-pointer rounded-full text-center text-sm font-bold ring-2 outline-none ${gradeClasses(v)}`}>
                          <option value="">–</option>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

// Izohlar: butun guruhga yoki bitta o'quvchiga -> o'quvchi sahifasida ko'rinadi
function Comments({ gid, group }) {
  const { t } = useT();
  const [list, setList] = useState([]);
  const [to, setTo] = useState('');
  const [text, setText] = useState('');
  const load = () => api('/teacher/comments?groupId=' + gid).then(setList);
  useEffect(() => { setTo(''); load(); }, [gid]);
  const send = async (e) => { e.preventDefault(); await api('/teacher/comments', { method: 'POST', body: { groupId: gid, studentId: to || null, text } }); setText(''); load(); };
  const del = async (id) => { await api('/teacher/comments/' + id, { method: 'DELETE' }); load(); };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title={t('comments')}>
        <form onSubmit={send} className="space-y-2">
          <select className={inp} value={to} onChange={(e) => setTo(e.target.value)}>
            <option value="">{t('wholeGroup')}</option>
            {(group?.studentIds || []).map((s) => <option key={s._id} value={s._id}>{s.name} {s.surname}</option>)}
          </select>
          <textarea className={inp} rows={4} placeholder={t('writeComment')} value={text} onChange={(e) => setText(e.target.value)} required />
          <button className={btn + ' w-full'}>{t('send')}</button>
        </form>
      </Card>
      <Card className="md:col-span-2">
        {!list.length ? <Empty t={t} /> : (
          <ul className="space-y-2">
            {list.map((c) => (
              <li key={c._id} className="rounded-xl bg-slate-50 p-3 text-sm ring-1 ring-slate-200">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span><b>{c.studentId ? `${c.studentId.name} ${c.studentId.surname}` : t('wholeGroup')}</b> · {fmt(c.createdAt)}</span>
                  <button className="font-semibold text-red-500" onClick={() => del(c._id)}>{t('del')}</button>
                </div>
                <p className="whitespace-pre-wrap">{c.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
