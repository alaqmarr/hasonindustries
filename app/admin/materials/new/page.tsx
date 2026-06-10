import { MaterialForm } from "@/components/admin/MaterialForm"
import Link from "next/link"

export default function NewMaterial() {
  return (
    <div className="max-w-4xl pb-24">
      <div className="flex items-center gap-4 mb-8 border-b border-neutral-200 pb-4">
        <Link href="/admin/materials" className="text-[#52525B] hover:text-[#10B981] font-['DM_Mono'] text-sm tracking-widest uppercase transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-['Bebas_Neue'] tracking-wider text-[#09090B]">
          NEW <span className="text-[#10B981]">MATERIAL</span>
        </h1>
      </div>

      <MaterialForm />
    </div>
  )
}
