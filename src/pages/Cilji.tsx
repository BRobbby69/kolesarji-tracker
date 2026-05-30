import { useEffect, useState } from 'react'
import { supabase, Cilj } from '../lib/supabase'
import styles from './Cilji.module.css'

export default function Cilji() {
  const [cilji, setCilji] = useState<Cilj[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ naziv: '', latitude: '', longitude: '', opis: '' })
  const [saving, setSaving] = useState(false)
  const [napaka, setNapaka] = useState('')

  useEffect(() => { fetchCilji() }, [])

  async function fetchCilji() {
    const { data } = await supabase.from('cilji').select('*').order('naziv')
    setCilji(data ?? [])
    setLoading(false)
  }

  async function shrani() {
    if (!form.naziv.trim() || !form.latitude || !form.longitude) {
      setNapaka('Naziv, latitude in longitude so obvezni')
      return
    }
    setSaving(true)
    setNapaka('')
    const { error } = await supabase.from('cilji').insert({
      naziv: form.naziv.trim(),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      opis: form.opis.trim() || null,
    })
    if (error) {
      setNapaka(error.message)
    } else {
      setForm({ naziv: '', latitude: '', longitude: '', opis: '' })
      setShowForm(false)
      fetchCilji()
    }
    setSaving(false)
  }

  function generirajQR(c: Cilj) {
    const data = JSON.stringify({
      cilj_id: c.id,
      naziv: c.naziv,
      latitude: c.latitude,
      longitude: c.longitude,
      opis: c.opis ?? '',
    })
    // Odpri QR generator v novem oknu
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data)}`
    window.open(url, '_blank')
  }

  async function izbrisi(id: string) {
    if (!confirm('Res izbrišete ta cilj?')) return
    await supabase.from('cilji').delete().eq('id', id)
    setCilji(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Cilji</h1>
          <p>{cilji.length} ciljev</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Zapri' : '+ Nov cilj'}
        </button>
      </div>

      {showForm && (
        <div className={styles.form}>
          <h3>Nov cilj</h3>
          <div className={styles.field}>
            <label>Naziv *</label>
            <input type="text" placeholder="npr. Cilj - Velika planina" value={form.naziv} onChange={e => setForm(p => ({...p, naziv: e.target.value}))} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Latitude *</label>
              <input type="number" step="0.000001" placeholder="46.123456" value={form.latitude} onChange={e => setForm(p => ({...p, latitude: e.target.value}))} />
            </div>
            <div className={styles.field}>
              <label>Longitude *</label>
              <input type="number" step="0.000001" placeholder="14.123456" value={form.longitude} onChange={e => setForm(p => ({...p, longitude: e.target.value}))} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Opis</label>
            <input type="text" placeholder="neobvezno" value={form.opis} onChange={e => setForm(p => ({...p, opis: e.target.value}))} />
          </div>
          {napaka && <div className={styles.napaka}>{napaka}</div>}
          <button className={styles.saveBtn} onClick={shrani} disabled={saving}>
            {saving ? 'Shranjujem...' : 'Shrani cilj'}
          </button>
        </div>
      )}

      {loading ? (
        <div className={styles.loader}><div className="spinner" /></div>
      ) : cilji.length === 0 ? (
        <div className={styles.prazno}>Ni ciljev</div>
      ) : (
        <div className={styles.list}>
          {cilji.map(c => (
            <div key={c.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <strong>{c.naziv}</strong>
                <span className={styles.coords}>📍 {c.latitude.toFixed(5)}, {c.longitude.toFixed(5)}</span>
                {c.opis && <em>{c.opis}</em>}
              </div>
              <div className={styles.itemActions}>
                <button className={styles.qrBtn} onClick={() => generirajQR(c)} title="Generiraj QR kodo">
                  <QRIcon />
                </button>
                <button className={styles.delBtn} onClick={() => izbrisi(c.id)}>
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.info}>
        <InfoIcon />
        <span>Kliknite QR ikono za generiranje QR kode cilja. QR koda vsebuje GPS koordinate cilja za preverjanje razdalje.</span>
      </div>
    </div>
  )
}

function QRIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/><rect x="18" y="18" width="3" height="3"/></svg> }
function TrashIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> }
function InfoIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> }
