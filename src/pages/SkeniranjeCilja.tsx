import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase, QRData, Kolesar } from '../lib/supabase'
import { getCurrentPosition, haversineRazdalja, MAX_RAZDALJA_M } from '../lib/geo'
import styles from './SkeniranjeCilja.module.css'

type Stanje = 'izbira_kolesarja' | 'skeniranje' | 'preverjanje' | 'uspeh' | 'napaka'

export default function SkeniranjeCilja() {
  const [stanje, setStanje] = useState<Stanje>('izbira_kolesarja')
  const [kolesarji, setKolesarji] = useState<Kolesar[]>([])
  const [izbraniKolesar, setIzbraniKolesar] = useState<Kolesar | null>(null)
  const [iskanje, setIskanje] = useState('')
  const [sporocilo, setSporocilo] = useState('')
  const [podrobnosti, setPodrobnosti] = useState<{ cilj: string; razdalja: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchKolesarji()
  }, [])

  async function fetchKolesarji() {
    const { data } = await supabase
      .from('kolesarji')
      .select('*')
      .order('stevilka')
    setKolesarji(data ?? [])
  }

  function filtrirani() {
    if (!iskanje) return kolesarji
    const q = iskanje.toLowerCase()
    return kolesarji.filter(k =>
      k.ime.toLowerCase().includes(q) ||
      k.priimek.toLowerCase().includes(q) ||
      String(k.stevilka).includes(q)
    )
  }

  function izberiKolesarja(k: Kolesar) {
    setIzbraniKolesar(k)
    setStanje('skeniranje')
  }

  useEffect(() => {
    if (stanje === 'skeniranje') {
      startScanner()
    } else {
      stopScanner()
    }
    return () => { stopScanner() }
  }, [stanje])

  async function startScanner() {
    if (!scannerDivRef.current) return
    try {
      const qr = new Html5Qrcode('qr-reader')
      scannerRef.current = qr
      await qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        handleQRCode,
        undefined
      )
    } catch (e) {
      setSporocilo('Kamera ni dostopna. Preverite dovoljenja.')
      setStanje('napaka')
    }
  }

  async function stopScanner() {
    if (scannerRef.current?.isScanning) {
      try { await scannerRef.current.stop() } catch {}
    }
  }

  async function handleQRCode(qrText: string) {
    await stopScanner()
    setStanje('preverjanje')
    setLoading(true)

    try {
      // Razčleni QR kodo (JSON format)
      let qrData: QRData
      try {
        qrData = JSON.parse(qrText)
        if (!qrData.cilj_id || !qrData.latitude || !qrData.longitude) {
          throw new Error('Neveljavna QR koda')
        }
      } catch {
        throw new Error('QR koda ne vsebuje veljavnih podatkov o cilju')
      }

      // Pridobi GPS lokacijo kolesarja
      setSporocilo('Pridobivam GPS lokacijo...')
      let position: GeolocationPosition
      try {
        position = await getCurrentPosition()
      } catch {
        throw new Error('GPS lokacija ni dostopna. Preverite dovoljenja.')
      }

      // Preveri razdaljo
      const razdalja = haversineRazdalja(
        position.coords.latitude, position.coords.longitude,
        qrData.latitude, qrData.longitude
      )

      if (razdalja > MAX_RAZDALJA_M) {
        throw new Error(
          `Predalec od cilja! Ste ${Math.round(razdalja)} m stran. Dovoljena razdalja je ${MAX_RAZDALJA_M} m.`
        )
      }

      // Preveri ali cilj obstaja, če ne - ga ustvari
      let { data: cilj } = await supabase
        .from('cilji')
        .select('*')
        .eq('id', qrData.cilj_id)
        .single()

      if (!cilj) {
        const { data: novCilj, error: ciljeErr } = await supabase
          .from('cilji')
          .insert({
            id: qrData.cilj_id,
            naziv: qrData.naziv,
            latitude: qrData.latitude,
            longitude: qrData.longitude,
            opis: qrData.opis ?? null,
          })
          .select()
          .single()
        if (ciljeErr) throw new Error('Napaka pri shranjevanju cilja')
        cilj = novCilj
      }

      // Preveri podvajanje (isti kolesar, isti cilj)
      const { data: obstojeca } = await supabase
        .from('registracije')
        .select('id')
        .eq('kolesar_id', izbraniKolesar!.id)
        .eq('cilj_id', qrData.cilj_id)
        .single()

      if (obstojeca) {
        throw new Error(`Kolesar ${izbraniKolesar?.ime} je ta cilj že dosegel!`)
      }

      // Shrani registracijo
      setSporocilo('Shranjujem registracijo...')
      const { error } = await supabase.from('registracije').insert({
        kolesar_id: izbraniKolesar!.id,
        cilj_id: qrData.cilj_id,
        cas: new Date().toISOString(),
        lat_ob_skeniranju: position.coords.latitude,
        lon_ob_skeniranju: position.coords.longitude,
        razdalja_m: Math.round(razdalja),
      })

      if (error) throw new Error('Napaka pri shranjevanju: ' + error.message)

      setPodrobnosti({ cilj: qrData.naziv, razdalja: Math.round(razdalja) })
      setStanje('uspeh')
    } catch (e: any) {
      setSporocilo(e.message ?? 'Prišlo je do napake')
      setStanje('napaka')
    } finally {
      setLoading(false)
    }
  }

  function ponovi() {
    setSporocilo('')
    setPodrobnosti(null)
    setStanje('skeniranje')
  }

  function zacetek() {
    setSporocilo('')
    setPodrobnosti(null)
    setIzbraniKolesar(null)
    setStanje('izbira_kolesarja')
  }

  return (
    <div className={styles.page}>

      {/* KORAK 1: Izbira kolesarja */}
      {stanje === 'izbira_kolesarja' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h1>Izberi kolesarja</h1>
            <p>Kdo dosega cilj?</p>
          </div>
          <div className={styles.searchBar}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Išči po imenu ali številki..."
              value={iskanje}
              onChange={e => setIskanje(e.target.value)}
            />
          </div>
          <div className={styles.kolsList}>
            {filtrirani().length === 0 ? (
              <div className={styles.prazno}>
                {kolesarji.length === 0 ? 'Ni registriranih kolesarjev' : 'Ni zadetkov'}
              </div>
            ) : filtrirani().map(k => (
              <button key={k.id} className={styles.kolsItem} onClick={() => izberiKolesarja(k)}>
                <div className={styles.kolsNum}>#{k.stevilka}</div>
                <div className={styles.kolsInfo}>
                  <strong>{k.ime} {k.priimek}</strong>
                  {k.ekipa && <span>{k.ekipa}</span>}
                </div>
                <ChevronRight />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* KORAK 2: QR Skeniranje */}
      {(stanje === 'skeniranje' || stanje === 'preverjanje') && (
        <div className={styles.scanSection}>
          <div className={styles.kolesar}>
            <span>#{izbraniKolesar?.stevilka}</span>
            <strong>{izbraniKolesar?.ime} {izbraniKolesar?.priimek}</strong>
            <button className={styles.spremeniBtn} onClick={zacetek}>Spremeni</button>
          </div>

          <div className={styles.scanContainer}>
            <div id="qr-reader" ref={scannerDivRef} className={styles.qrReader} />
            <div className={styles.scanOverlay}>
              <div className={styles.corner} data-pos="tl" />
              <div className={styles.corner} data-pos="tr" />
              <div className={styles.corner} data-pos="bl" />
              <div className={styles.corner} data-pos="br" />
              {stanje === 'skeniranje' && <div className={styles.scanLine} />}
            </div>
          </div>

          {stanje === 'preverjanje' ? (
            <div className={styles.preverjanje}>
              <div className="spinner" />
              <span>{sporocilo || 'Preverjam...'}</span>
            </div>
          ) : (
            <p className={styles.navodila}>Usmeri kamero na QR kodo cilja</p>
          )}
        </div>
      )}

      {/* KORAK 3: Uspeh */}
      {stanje === 'uspeh' && (
        <div className={styles.rezultat}>
          <div className={styles.uspesSirkel}>
            <CheckIcon />
          </div>
          <h2>Registrirano!</h2>
          <div className={styles.detajli}>
            <div className={styles.detajlItem}>
              <span>Kolesar</span>
              <strong>#{izbraniKolesar?.stevilka} {izbraniKolesar?.ime} {izbraniKolesar?.priimek}</strong>
            </div>
            <div className={styles.detajlItem}>
              <span>Cilj</span>
              <strong>{podrobnosti?.cilj}</strong>
            </div>
            <div className={styles.detajlItem}>
              <span>Razdalja od cilja</span>
              <strong className={styles.razdalja}>{podrobnosti?.razdalja} m ✓</strong>
            </div>
            <div className={styles.detajlItem}>
              <span>Čas</span>
              <strong>{new Date().toLocaleTimeString('sl-SI')}</strong>
            </div>
          </div>
          <div className={styles.gumbi}>
            <button className={styles.btnPrimary} onClick={ponovi}>
              Naslednji cilj
            </button>
            <button className={styles.btnSecondary} onClick={zacetek}>
              Nov kolesar
            </button>
          </div>
        </div>
      )}

      {/* KORAK 3b: Napaka */}
      {stanje === 'napaka' && (
        <div className={styles.rezultat}>
          <div className={styles.napakaSirkel}>
            <XIcon />
          </div>
          <h2>Napaka</h2>
          <p className={styles.napakaSporocilo}>{sporocilo}</p>
          <div className={styles.gumbi}>
            <button className={styles.btnPrimary} onClick={ponovi}>
              Poskusi znova
            </button>
            <button className={styles.btnSecondary} onClick={zacetek}>
              Na začetek
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
}
function ChevronRight() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
}
function CheckIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
}
function XIcon() {
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
