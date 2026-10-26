import { createFileRoute } from '@tanstack/react-router'
import BaganOrganisasi from '../components/BaganOrganisasi'

export const Route = createFileRoute('/anggota')({
  component: AnggotaPage,
})

function AnggotaPage() {
  return (
    <div className="w-full">
      <BaganOrganisasi />
    </div>
  )
}
