import { useEffect, useState } from 'react'
import { supabase, Cilj } from '../lib/supabase'
import styles from './Statistika.module.css'

type StatistikaPoKolesarju = {
  kolesar_id: string
  ime: string
  priimek: string
  stevilka: number
  ekipa?: string
  stevilo_obiskov: number
}

export default function Statistika() {
  const [cilji, setCilji] = useState<Cilj[]>([])
  const [statistika, setStatistika] = useState<Map<string, StatistikaPoKolesarju[]>>(new Map())
  const [loading, setLoading] = useState(true)
  const [izbaniCilj, setIzbaniCilj] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    // Pridobi vse cilje
    const { data: cilje } = await supabase
      .from('cilji')
      .select('*')
      .order('naziv')

    if (cilje) {
      setCilji(cilje)
      if (cilje.length > 0) {
        setIzbaniCilj(cilje[0].id)
      }
    }

    // Pridobi statistiko registracij po ciljih
    const { data: registracije } = await supabase
      .from('registracije')
      .select('kolesar_id, cilj_id, kolesarji(ime, priimek, stevilka, ekipa)')

    if (registracije) {
      const stats = new Map<string, StatistikaPoKolesarju[]>()

      // Grupiraj registracije po ciljih
      registracije.forEach(reg => {
        const ciljId = reg.cilj_id
        const kolesar = reg.kolesarji as any

        if (!stats.has(ciljId)) {
          stats.set(ciljId, [])
        }

        const ciljStats = stats.get(ciljId)!
        const obstojeciKolesar = ciljStats.find(
          s => s.kolesar_id === reg.kolesar_id
        )

        if (obstojeciKolesar) {
          obstojeciKolesar.stevilo_obiskov++
        } else {
          ciljStats.push({
            kolesar_id: reg.kolesar_id,
            ime: kolesar?.ime || '?',
            priimek: kolesar?.priimek || '?',
            stevilka: kolesar?.stevilka || 0,
            ekipa: kolesar?.ekipa,
            stevilo_obiskov: 1,
          })
        }
      })

      // Sortiraj kolesarje po številu obiskov (padajoče)
      stats.forEach(kolesarji => {
        kolesarji.sort((a, b) => b.stevilo_obiskov - a.stevilo_obiskov)
      })

      setStatistika(stats)
    }

    setLoading(false)
  }

  const izbaniCiljData = cilji.find(c => c.id === izbaniCilj)
  const lestvica = izbaniCilj ? statistika.get(izbaniCilj) || [] : []

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Statistika po ciljih</h1>
        <p>Lestvica kolesarjev po številu obiskov</p>
      </div>

      {loading ? (
        <div className={styles.loader}><div className="spinner" /></div>
      ) : cilji.length === 0 ? (
        <div className={styles.prazno}>Ni ciljev</div>
      ) : (
        <div className={styles.container}>
          <div className={styles.ciljiBoksi}>
            <h3>Cilji:</h3>
            <div className={styles.ciljiBoksevi}>
              {cilji.map(c => (
                <button
                  key={c.id}
                  className={`${styles.ciljBtn} ${izbaniCilj === c.id ? styles.active : ''}`}
                  onClick={() => setIzbaniCilj(c.id)}
                >
                  <span className={styles.naziv}>{c.naziv}</span>
                  <span className={styles.obiskov}>
                    {statistika.get(c.id)?.length || 0} kolesarjev
                  </span>
                </button>
              ))}
            </div>
          </div>

          {izbaniCiljData && (
            <div className={styles.lestvica}>
              <div className={styles.ciljInfo}>
                <h2>{izbaniCiljData.naziv}</h2>
                {izbaniCiljData.opis && <p>{izbaniCiljData.opis}</p>}
                <span className={styles.coords}>
                  📍 {izbaniCiljData.latitude.toFixed(5)}, {izbaniCiljData.longitude.toFixed(5)}
                </span>
              </div>

              {lestvica.length === 0 ? (
                <div className={styles.praznolestvica}>
                  Ni registracij za ta cilj
                </div>
              ) : (
                <div className={styles.lestvicaList}>
                  <div className={styles.lestvicaHeader}>
                    <span className={styles.rang}>Mesto</span>
                    <span className={styles.kolesar}>Kolesar</span>
                    <span className={styles.ekipa}>Ekipa</span>
                    <span className={styles.stevilo}>Obiski</span>
                  </div>
                  {lestvica.map((k, index) => (
                    <div key={k.kolesar_id} className={styles.lestvicaRow}>
                      <span className={`${styles.rang} ${styles['rang' + (index + 1)]}`}>
                        {index + 1}{index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                      </span>
                      <span className={styles.kolesar}>
                        <strong>#{k.stevilka}</strong> {k.ime} {k.priimek}
                      </span>
                      <span className={styles.ekipa}>{k.ekipa || '-'}</span>
                      <span className={`${styles.stevilo} ${styles.bold}`}>
                        {k.stevilo_obiskov}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
