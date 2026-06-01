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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)

    const { data: cilje } = await supabase
      .from('cilji')
      .select('*')
      .order('naziv')

    if (cilje) {
      setCilji(cilje)
    }

    const { data: registracije } = await supabase
      .from('registracije')
      .select('kolesar_id, cilj_id, kolesarji(ime, priimek, stevilka, ekipa)')

    if (registracije) {
      const stats = new Map<string, StatistikaPoKolesarju[]>()

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

      stats.forEach(kolesarji => {
        kolesarji.sort((a, b) => b.stevilo_obiskov - a.stevilo_obiskov)
      })

      setStatistika(stats)
    }

    setLoading(false)
  }

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
          {cilji.map(c => {
            const lestvica = statistika.get(c.id) || []
            return (
              <section key={c.id} className={styles.ciljSection}>
                <div className={styles.ciljInfo}>
                  <div className={styles.ciljNaslov}>
                    <h2>{c.naziv}</h2>
                    <span className={styles.obiskov}>
                      {lestvica.length} kolesarjev
                    </span>
                  </div>
                  {c.opis && <p>{c.opis}</p>}
                  <span className={styles.coords}>
                    📍 {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}
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
                          {index + 1}{index === 0 && ' 🥇'}{index === 1 && ' 🥈'}{index === 2 && ' 🥉'}
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
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
