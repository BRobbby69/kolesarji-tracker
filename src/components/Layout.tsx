import { useLocation, useNavigate } from 'react-router-dom'
import { ReactNode } from 'react'
import styles from './Layout.module.css'

const navItems = [
  { path: '/', icon: HomeIcon, label: 'Domov' },
  { path: '/kolesarji', icon: UsersIcon, label: 'Kolesarji' },
  { path: '/skeniraj', icon: ScanIcon, label: 'Skeniraj', primary: true },
  { path: '/registracije', icon: ListIcon, label: 'Rezultati' },
  { path: '/cilji', icon: FlagIcon, label: 'Cilji' },
]

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <BikeIcon />
          <span>KOLESARJI</span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.badge}>LIVE</span>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <nav className={styles.nav}>
        {navItems.map(({ path, icon: Icon, label, primary }) => {
          const active = location.pathname === path ||
            (path !== '/' && location.pathname.startsWith(path))
          return (
            <button
              key={path}
              className={`${styles.navBtn} ${active ? styles.active : ''} ${primary ? styles.primary : ''}`}
              onClick={() => navigate(path)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function HomeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
function UsersIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function ScanIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
}
function ListIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function FlagIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
}
function BikeIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1l-5 8h5l1-5"/><path d="M12 6h6l-3 7"/></svg>
}
