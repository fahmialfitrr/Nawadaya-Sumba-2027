import { createFileRoute, notFound } from '@tanstack/react-router'
import CeritaSection from '../components/CeritaSection'

export const Route = createFileRoute('/cerita')({
  beforeLoad: () => {
    // ponytail: sementara dinonaktifkan (404), hapus baris ini saat cerita siap dibuka
    throw notFound()
  },
  component: CeritaPage,
})

function CeritaPage() {
  return (
    <div className="pt-24 pb-16 w-full">
      <CeritaSection />
    </div>
  )
}
