import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './DomacaStran.module.css'

export default function DomacaStran() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ kolesarji: 0, registracije: 0, cilji: 0 })
  const [zadnje, setZadnje] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [k, r, c] = await Promise.all([
          supabase.from('kolesarji').select('*', { count: 'exact', head: true }),
          supabase.from('registracije').select('*', { count: 'exact', head: true }),
          supabase.from('cilji').select('*', { count: 'exact', head: true }),
        ])
        setStats({
          kolesarji: k.count ?? 0,
          registracije: r.count ?? 0,
          cilji: c.count ?? 0,
        })

        const { data } = await supabase
          .from('registracije')
          .select('*, kolesarji(ime, priimek, stevilka), cilji(naziv)')
          .order('cas', { ascending: false })
          .limit(5)
        setZadnje(data ?? [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h1>Passo di Strojna<span>🚴</span></h1>
          <p>Sledite kolesarjem v realnem času</p>
        </div>
        <div className={styles.heroBadge}>
          {new Date().toLocaleDateString('sl-SI', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard icon="🚴" value={loading ? '—' : stats.kolesarji} label="Kolesarjev" color="accent" />
        <StatCard icon="🏁" value={loading ? '—' : stats.registracije} label="Registracij" color="green" />
        <StatCard icon="📍" value={loading ? '—' : stats.cilji} label="Ciljev" color="orange" />
      </div>

      <div className={styles.quickActions}>
        <h2>Hitre akcije</h2>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => navigate('/skeniraj')}>
            <span className={styles.actionIcon}>📷</span>
            <div>
              <strong>Skeniraj cilj</strong>
              <span>QR koda na cilju</span>
            </div>
            <ChevronRight />
          </button>
          <button className={styles.actionBtn} onClick={() => navigate('/kolesarji/nov')}>
            <span className={styles.actionIcon}>➕</span>
            <div>
              <strong>Nov kolesar</strong>
              <span>Registracija</span>
            </div>
            <ChevronRight />
          </button>
          <button className={styles.actionBtn} onClick={() => navigate('/registracije')}>
            <span className={styles.actionIcon}>📊</span>
            <div>
              <strong>Rezultati</strong>
              <span>Vse registracije</span>
            </div>
            <ChevronRight />
          </button>
        </div>
      </div>

      {zadnje.length > 0 && (
        <div className={styles.zadnje}>
          <h2>Zadnje registracije</h2>
          {zadnje.map(r => {
            const cas = r.cas ? new Date(r.cas) : null
            return (
              <div key={r.id} className={styles.zaRegItem}>
                <div className={styles.zaRegNum}>#{r.kolesarji?.stevilka}</div>
                <div className={styles.zaRegInfo}>
                  <strong>{r.kolesarji?.ime} {r.kolesarji?.priimek}</strong>
                  <span>{r.cilji?.naziv}</span>
                </div>
                <div className={styles.zaRegCas}>
                  {cas ? (
                    <>
                      <div>{cas.toLocaleDateString('sl-SI', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                      <div>{cas.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' })}</div>
                    </>
                  ) : '—'}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, value, label, color }: { icon: string, value: any, label: string, color: string }) {
  return (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

function ChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
}
