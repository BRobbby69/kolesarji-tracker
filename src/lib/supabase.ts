import { createClient } from '@supabase/supabase-js'

// Zamenjajte s svojimi Supabase podatki
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Kolesar = {
  id: string
  ime: string
  priimek: string
  ekipa?: string
  stevilka: number
  created_at: string
}

export type Cilj = {
  id: string
  naziv: string
  latitude: number
  longitude: number
  opis?: string
  created_at: string
}

export type Registracija = {
  id: string
  kolesar_id: string
  cilj_id: string
  cas: string
  lat_ob_skeniranju?: number
  lon_ob_skeniranju?: number
  razdalja_m?: number
  created_at: string
  kolesarji?: Kolesar
  cilji?: Cilj
}

export type QRData = {
  cilj_id: string
  naziv: string
  latitude: number
  longitude: number
  opis?: string
}
