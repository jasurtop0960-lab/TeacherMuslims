import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken } from './api';
import { useT } from './i18n.jsx';
import Login from './components/Login.jsx';
import ChangePassword from './components/ChangePassword.jsx';
import StudentDashboard from './components/StudentDashboard.jsx';
import TeacherDashboard from './components/TeacherDashboard.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

const Auth = createContext();
export const useAuth = () => useContext(Auth);

function Header() {
  const { t, lang, setLang } = useT();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const staff = user && user.role !== 'student';
  const Lang = () => (
    <div className="flex overflow-hidden rounded-full ring-1 ring-slate-300">
      {[['uz', "O'zbekcha"], ['ru', 'Русский']].map(([k, label]) => (
        <button key={k} onClick={() => setLang(k)} className={`px-3 py-1.5 text-xs font-semibold ${lang === k ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600'}`}>{label}</button>
      ))}
    </div>
  );
  return (
    <>
    <header className="sticky top-0 z-10 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 font-black text-white">M</div>
          <b className="text-lg text-slate-800">TeacherM</b>
        </div>
        {/* Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Lang />
          {user && (<>
            <span className="text-sm text-slate-600">{user.name} {user.surname} · <i>{t('role_' + user.role)}</i></span>
            {staff && <button onClick={() => setPwOpen(true)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200">🔑 {t('changePassword')}</button>}
            <button onClick={logout} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold hover:bg-slate-200">{t('logout')}</button>
          </>)}
        </div>
        {/* Mobil: hamburger */}
        <button className="rounded-lg p-2 ring-1 ring-slate-200 md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h16M3 11h16M3 16h16" /></svg>
        </button>
      </div>
      {open && (
        <div className="space-y-3 border-t px-4 py-3 md:hidden">
          <Lang />
          {user && (<>
            <p className="text-sm text-slate-600">{user.name} {user.surname} · {t('role_' + user.role)}</p>
            {staff && <button onClick={() => { setPwOpen(true); setOpen(false); }} className="w-full rounded-xl bg-slate-100 py-2 text-sm font-semibold">🔑 {t('changePassword')}</button>}
            <button onClick={logout} className="w-full rounded-xl bg-slate-100 py-2 text-sm font-semibold">{t('logout')}</button>
          </>)}
        </div>
      )}
    </header>
    {pwOpen && <ChangePassword onClose={() => setPwOpen(false)} />}
    </>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    (localStorage.token ? api('/auth/me').then(setUser).catch(() => setToken(null)) : Promise.resolve()).finally(() => setReady(true));
  }, []);
  const logout = () => { setToken(null); setUser(null); };
  if (!ready) return null;
  const Page = !user ? Login : user.role === 'admin' ? AdminDashboard : user.role === 'teacher' ? TeacherDashboard : StudentDashboard;
  return (
    <Auth.Provider value={{ user, setUser, logout }}>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-5"><Page /></main>
    </Auth.Provider>
  );
}
