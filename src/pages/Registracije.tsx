import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import styles from './Registracije.module.css'

export default function Registracije() {
  const [registracije, setRegistracije] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => { fetch() }, [])

  async function fetch() {
    const { data } = await supabase
      .from('registracije')
      .select('*, kolesarji(ime, priimek, stevilka, ekipa), cilji(naziv)')
      .order('cas', { ascending: false })
    setRegistracije(data ?? [])
    setLoading(false)
  }

  const filtrirane = filter
    ? registracije.filter(r =>
        r.kolesarji?.ime?.toLowerCase().includes(filter.toLowerCase()) ||
        r.kolesarji?.priimek?.toLowerCase().includes(filter.toLowerCase()) ||
        String(r.kolesarji?.stevilka).includes(filter) ||
        r.cilji?.naziv?.toLowerCase().includes(filter.toLowerCase()))
    : registracije

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Registracije</h1>
        <p>{registracije.length} vnosov</p>
      </div>

      <div className={styles.searchBar}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Filtriraj..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loader}><div className="spinner" /></div>
      ) : filtrirane.length === 0 ? (
        <div className={styles.prazno}>Ni registracij</div>
      ) : (
        <div className={styles.list}>
          {filtrirane.map(r => (
            <div key={r.id} className={styles.item}>
              <div className={styles.itemLeft}>
                <div className={styles.num}>#{r.kolesarji?.stevilka}</div>
                <div className={styles.info}>
                  <strong>{r.kolesarji?.ime} {r.kolesarji?.priimek}</strong>
                  <span>{r.cilji?.naziv}</span>
                  {r.ekipa && <em>{r.kolesarji?.ekipa}</em>}
                </div>
              </div>
              <div className={styles.itemRight}>
                <div className={styles.cas}>
                  {new Date(r.cas).toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className={styles.datum}>
                  {new Date(r.cas).toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' })}
                </div>
                {r.razdalja_m != null && (
                  <div className={styles.razdalja}>{r.razdalja_m}m</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
