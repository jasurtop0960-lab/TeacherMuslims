import { useState } from 'react';
import { api, setToken } from '../api';
import { useT } from '../i18n.jsx';
import { useAuth } from '../App.jsx';
import { inp, btn } from './ui.jsx';

export default function Login() {
  const { t } = useT();
  const { setUser } = useAuth();
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ fullName: '', name: '', surname: '', password: '' });
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(''); setOk('');
    try {
      if (mode === 'login') {
        const d = await api('/auth/login', { method: 'POST', body: { fullName: f.fullName, password: f.password } });
        setToken(d.token); setUser(d.user);
      } else {
        await api('/auth/register', { method: 'POST', body: { name: f.name, surname: f.surname, password: f.password } });
        setF({ ...f, fullName: `${f.name} ${f.surname}`.trim() });
        setOk(t('registered')); setMode('login');
      }
    } catch (x) { setErr(t('err_' + x.message)); }
  };

  return (
    <div className="mx-auto mt-6 max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:mt-14 sm:p-8">
      <h1 className="mb-1 text-2xl font-black text-slate-800">{mode === 'login' ? t('login') : t('register')}</h1>
      <p className="mb-5 text-sm text-slate-400">TeacherM</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === 'login' ? (
          <input className={inp} placeholder={t('fullName')} value={f.fullName} onChange={set('fullName')} required />
        ) : (<>
          <input className={inp} placeholder={t('name')} value={f.name} onChange={set('name')} required />
          <input className={inp} placeholder={t('surname')} value={f.surname} onChange={set('surname')} required />
        </>)}
        <input className={inp} type="password" placeholder={t('password')} value={f.password} onChange={set('password')} required minLength={6} />
        {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{err}</p>}
        {ok && <p className="rounded-lg bg-green-50 p-2 text-sm text-green-700">{ok}</p>}
        <button className={btn + ' w-full'}>{mode === 'login' ? t('login') : t('register')}</button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        {mode === 'login' ? t('noAccount') : t('haveAccount')}{' '}
        <button className="font-semibold text-indigo-600" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErr(''); setOk(''); }}>
          {mode === 'login' ? t('register') : t('login')}
        </button>
      </p>
    </div>
  );
}
