import { useEffect, useState } from 'react';
import { api } from '../api';
import { useT } from '../i18n.jsx';
import TeacherDashboard from './TeacherDashboard.jsx';
import { Card, Tabs, Empty, inp, btn } from './ui.jsx';

// Admin = O'qituvchi paneli (to'liq) + O'qituvchilarni boshqarish
export default function AdminDashboard() {
  const { t } = useT();
  const [tab, setTab] = useState('panel');
  return (
    <>
      <Tabs tabs={['panel', 'teachers']} value={tab} onChange={setTab} t={(k) => (k === 'panel' ? t('role_admin') + ' / ' + t('role_teacher') : t(k))} />
      {tab === 'panel' ? <TeacherDashboard /> : <Teachers />}
    </>
  );
}

function Teachers() {
  const { t } = useT();
  const [list, setList] = useState([]);
  const [f, setF] = useState({ name: '', surname: '', password: '' });
  const [err, setErr] = useState('');
  const load = () => api('/admin/teachers').then(setList);
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const add = async (e) => {
    e.preventDefault(); setErr('');
    try { await api('/admin/teachers', { method: 'POST', body: f }); setF({ name: '', surname: '', password: '' }); load(); }
    catch (x) { setErr(t('err_' + x.message)); }
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title={t('newTeacher')}>
        <form onSubmit={add} className="space-y-2">
          <input className={inp} placeholder={t('name')} value={f.name} onChange={set('name')} required />
          <input className={inp} placeholder={t('surname')} value={f.surname} onChange={set('surname')} required />
          <input className={inp} type="password" placeholder={t('password')} value={f.password} onChange={set('password')} required minLength={6} />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button className={btn + ' w-full'}>{t('add')}</button>
        </form>
      </Card>
      <Card title={t('teachers')} className="md:col-span-2">
        {!list.length ? <Empty t={t} /> : <ul className="divide-y">{list.map((u) => <li key={u._id} className="py-2 text-sm">{u.name} {u.surname}</li>)}</ul>}
      </Card>
    </div>
  );
}
