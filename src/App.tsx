import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DomacaStran from './pages/DomacaStran'
import Kolesarji from './pages/Kolesarji'
import KoleSarJiForm from './pages/KolesarForm'
import SkeniranjeCilja from './pages/SkeniranjeCilja'
import Registracije from './pages/Registracije'
import Cilji from './pages/Cilji'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DomacaStran />} />
        <Route path="/kolesarji" element={<Kolesarji />} />
        <Route path="/kolesarji/nov" element={<KoleSarJiForm />} />
        <Route path="/kolesarji/:id/uredi" element={<KoleSarJiForm />} />
        <Route path="/skeniraj" element={<SkeniranjeCilja />} />
        <Route path="/registracije" element={<Registracije />} />
        <Route path="/cilji" element={<Cilji />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
