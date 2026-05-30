import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './KolesarForm.module.css'

export default function KolesarForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({ ime: '', priimek: '', ekipa: '', stevilka: '' })
  const [loading, setLoading] = useState(false)
  const [napaka, setNapaka] = useState('')

  useEffect(() => {
    if (isEdit) {
      supabase.from('kolesarji').select('*').eq('id', id!).single().then(({ data }) => {
        if (data) setForm({ ime: data.ime, priimek: data.priimek, ekipa: data.ekipa ?? '', stevilka: String(data.stevilka) })
      })
    }
  }, [id])

  async function shrani() {
    if (!form.ime.trim() || !form.priimek.trim() || !form.stevilka) {
      setNapaka('Ime, priimek in številka so obvezni')
      return
    }
    setLoading(true)
    setNapaka('')
    const payload = {
      ime: form.ime.trim(),
      priimek: form.priimek.trim(),
      ekipa: form.ekipa.trim() || null,
      stevilka: parseInt(form.stevilka),
    }
    const { error } = isEdit
      ? await supabase.from('kolesarji').update(payload).eq('id', id!)
      : await supabase.from('kolesarji').insert(payload)

    if (error) {
      setNapaka(error.code === '23505' ? 'Številka kolesarja je že zasedena' : error.message)
    } else {
      navigate('/kolesarji')
    }
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/kolesarji')}>
          <ChevronLeft />
        </button>
        <h1>{isEdit ? 'Uredi kolesarja' : 'Nov kolesar'}</h1>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <label>Ime *</label>
          <input
            type="text"
            placeholder="npr. Janez"
            value={form.ime}
            onChange={e => setForm(p => ({ ...p, ime: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label>Priimek *</label>
          <input
            type="text"
            placeholder="npr. Novak"
            value={form.priimek}
            onChange={e => setForm(p => ({ ...p, priimek: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label>Startna številka *</label>
          <input
            type="number"
            placeholder="npr. 42"
            value={form.stevilka}
            onChange={e => setForm(p => ({ ...p, stevilka: e.target.value }))}
          />
        </div>
        <div className={styles.field}>
          <label>Ekipa</label>
          <input
            type="text"
            placeholder="neobvezno"
            value={form.ekipa}
            onChange={e => setForm(p => ({ ...p, ekipa: e.target.value }))}
          />
        </div>

        {napaka && <div className={styles.napaka}>{napaka}</div>}

        <button className={styles.saveBtn} onClick={shrani} disabled={loading}>
          {loading ? <><div className="spinner" /> Shranjujem...</> : isEdit ? 'Shrani spremembe' : 'Dodaj kolesarja'}
        </button>
      </div>
    </div>
  )
}

function ChevronLeft() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
}
