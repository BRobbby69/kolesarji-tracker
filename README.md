# 🚴 Kolesarji Tracker

Mobilna PWA aplikacija za evidenco kolesarjev in registracijo ciljev z QR skeniranjem.

## Zahteve

- Node.js 18+
- npm 9+
- Supabase račun (brezplačen)

---

## 1. Postavitev Supabase

1. Ustvarite projekt na [supabase.com](https://supabase.com)
2. Pojdite v **SQL Editor** in izvedite celotno vsebino datoteke `supabase_schema.sql`
3. Iz **Settings > API** kopirajte:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` ključ → `VITE_SUPABASE_ANON_KEY`

---

## 2. Lokalni razvoj

```bash
# 1. Kopirajte env
cp .env.example .env
# Uredite .env z vašimi Supabase podatki

# 2. Namestite odvisnosti
npm install

# 3. Zaženite razvojni strežnik
npm run dev
```

Aplikacija bo dostopna na `http://localhost:5173`

Za testiranje na telefonu (Xiaomi 12 Pro) zaženite:
```bash
npm run dev -- --host
```
In obiščite IP vašega računalnika na telefonu.

---

## 3. Build in deploy

```bash
npm run build
npm run preview  # Lokalni pregled
```

**Priporočeni hosting:** Vercel, Netlify ali Firebase Hosting (brezplačno)

---

## 4. Struktura QR kode

QR kode na ciljih vsebujejo JSON:

```json
{
  "cilj_id": "uuid-cilja",
  "naziv": "Cilj - Velika planina",
  "latitude": 46.2860,
  "longitude": 14.5500,
  "opis": "Na sedlu"
}
```

### Generiranje QR kode:
1. V aplikaciji odprite **Cilji** zavihek
2. Dodajte cilj z GPS koordinatami
3. Kliknite QR ikono → odpre se QR koda za tiskanje

### GPS koordinate:
- Pridobite jih na Google Maps (desni klik → "Kaj je tukaj?")
- Ali uporabite GPS aplikacijo na mestu cilja

---

## 5. Preverjanje razdalje

Aplikacija pri skeniranju:
1. Prebere GPS koordinate iz QR kode
2. Pridobi trenutno lokacijo kolesarja (GPS)
3. Izračuna razdaljo (Haversine formula)
4. **Dovoli registracijo samo če je razdalja ≤ 50m**

---

## 6. Supabase RLS (varnost)

Za produkcijsko uporabo priporočamo vklop Row Level Security.
Odkomentirajte politike v `supabase_schema.sql` ali nastavite
avtentikacijo za organizatorje.

---

## Visual Studio 2026 navodila

1. Odprite mapo `kolesarji` v VS 2026
2. Terminal → `npm install` → `npm run dev`
3. Za Android/iOS testiranje uporabite `npm run dev -- --host`
4. Za build: `npm run build` (izhodna mapa: `dist/`)
