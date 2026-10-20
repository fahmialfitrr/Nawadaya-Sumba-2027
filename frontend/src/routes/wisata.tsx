import { createFileRoute } from '@tanstack/react-router'
import WisataSection from '../components/WisataSection'

export const Route = createFileRoute('/wisata')({
  component: WisataPage,
})

function WisataPage() {
  return (
    <div className="pt-24 pb-16 w-full">
      <WisataSection />
    </div>
  )
}
