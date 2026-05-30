import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Kolesar } from '../lib/supabase'
import styles from './Kolesarji.module.css'

export default function Kolesarji() {
  const navigate = useNavigate()
  const [kolesarji, setKolesarji] = useState<Kolesar[]>([])
  const [iskanje, setIskanje] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch() }, [])

  async function fetch() {
    const { data } = await supabase.from('kolesarji').select('*').order('stevilka')
    setKolesarji(data ?? [])
    setLoading(false)
  }

  async function izbrisi(id: string) {
    if (!confirm('Res izbrišete tega kolesarja?')) return
    await supabase.from('kolesarji').delete().eq('id', id)
    setKolesarji(prev => prev.filter(k => k.id !== id))
  }

  const filtrirani = iskanje
    ? kolesarji.filter(k =>
        k.ime.toLowerCase().includes(iskanje.toLowerCase()) ||
        k.priimek.toLowerCase().includes(iskanje.toLowerCase()) ||
        String(k.stevilka).includes(iskanje))
    : kolesarji

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Kolesarji</h1>
          <p>{kolesarji.length} registriranih</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/kolesarji/nov')}>
          <PlusIcon /> Nov
        </button>
      </div>

      <div className={styles.searchBar}>
        <SearchIcon />
        <input
          type="text"
          placeholder="Išči..."
          value={iskanje}
          onChange={e => setIskanje(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loader}><div className="spinner" /></div>
      ) : filtrirani.length === 0 ? (
        <div className={styles.prazno}>
          {kolesarji.length === 0
            ? (<><p>Ni kolesarjev</p><button className={styles.addBtnLarge} onClick={() => navigate('/kolesarji/nov')}>Dodaj prvega</button></>)
            : <p>Ni zadetkov</p>}
        </div>
      ) : (
        <div className={styles.list}>
          {filtrirani.map(k => (
            <div key={k.id} className={styles.item}>
              <div className={styles.num}>#{k.stevilka}</div>
              <div className={styles.info}>
                <strong>{k.ime} {k.priimek}</strong>
                {k.ekipa && <span>{k.ekipa}</span>}
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => navigate(`/kolesarji/${k.id}/uredi`)}>
                  <EditIcon />
                </button>
                <button className={styles.delBtn} onClick={() => izbrisi(k.id)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlusIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }
function SearchIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> }
function EditIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> }
function TrashIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> }
