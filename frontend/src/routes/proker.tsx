import { createFileRoute } from '@tanstack/react-router'
import ProkerSection from '../components/ProkerSection'

export const Route = createFileRoute('/proker')({
  component: ProkerPage,
})

function ProkerPage() {
  return (
    <div className="pt-24 pb-16 w-full">
      <ProkerSection />
    </div>
  )
}
