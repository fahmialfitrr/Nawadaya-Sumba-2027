import { createFileRoute } from '@tanstack/react-router'
import CeritaSection from '../components/CeritaSection'

export const Route = createFileRoute('/cerita')({
  component: CeritaPage,
})

function CeritaPage() {
  return (
    <div className="pt-24 pb-16 w-full">
      <CeritaSection />
    </div>
  )
}
