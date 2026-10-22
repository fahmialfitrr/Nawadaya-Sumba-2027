import { createFileRoute, notFound } from '@tanstack/react-router'
import WisataSection from '../components/WisataSection'

export const Route = createFileRoute('/wisata')({
  beforeLoad: () => {
    // ponytail: sementara dinonaktifkan (404), hapus baris ini saat wisata siap dibuka
    throw notFound()
  },
  component: WisataPage,
})

function WisataPage() {
  return (
    <div className="pt-24 pb-16 w-full">
      <WisataSection />
    </div>
  )
}
