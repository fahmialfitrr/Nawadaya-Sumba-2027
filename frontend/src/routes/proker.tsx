import { createFileRoute, notFound } from '@tanstack/react-router'
import ProkerSection from '../components/ProkerSection'

export const Route = createFileRoute('/proker')({
  beforeLoad: () => {
    // ponytail: sementara dinonaktifkan (404), hapus baris ini saat proker siap dibuka
    throw notFound()
  },
  component: ProkerPage,
})

function ProkerPage() {
  return (
    <div className="pt-24 pb-16 w-full">
      <ProkerSection />
    </div>
  )
}
