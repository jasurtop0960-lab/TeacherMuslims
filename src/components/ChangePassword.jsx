import { useState } from 'react';
import { api } from '../api';
import { useT } from '../i18n.jsx';
import { inp, btn } from './ui.jsx';

export default function ChangePassword({ onClose }) {
  const { t } = useT();
  const [f, setF] = useState({ oldPassword: '', newPassword: '', repeat: '' });
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (f.newPassword !== f.repeat) return setErr(t('err_MISMATCH'));
    try {
      await api('/auth/change-password', { method: 'POST', body: { oldPassword: f.oldPassword, newPassword: f.newPassword } });
      setDone(true);
    } catch (x) { setErr(t('err_' + x.message)); }
  };

  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold">{t('changePassword')}</h3>
        {done ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{t('passwordChanged')}</p> : (<>
          <input className={inp} type="password" placeholder={t('oldPassword')} value={f.oldPassword} onChange={set('oldPassword')} required />
          <input className={inp} type="password" placeholder={t('newPassword')} value={f.newPassword} onChange={set('newPassword')} required minLength={6} />
          <input className={inp} type="password" placeholder={t('repeatPassword')} value={f.repeat} onChange={set('repeat')} required minLength={6} />
          {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{err}</p>}
          <button className={btn + ' w-full'}>{t('save')}</button>
        </>)}
        <button type="button" onClick={onClose} className="w-full rounded-xl bg-slate-100 py-2 text-sm font-semibold">✕</button>
      </form>
    </div>
  );
}
