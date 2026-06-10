import { MaterialForm } from "@/components/admin/MaterialForm"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

type Params = Promise<{ id: string }>

export default async function EditMaterialPage(segmentData: { params: Params }) {
  const { id } = await segmentData.params
  const material = await prisma.material.findUnique({
    where: { id }
  })

  if (!material) {
    notFound()
  }

  return (
    <div className="max-w-4xl pb-24">
      <div className="flex items-center gap-4 mb-8 border-b border-neutral-200 pb-4">
        <Link href="/admin/materials" className="text-[#52525B] hover:text-[#10B981] font-['DM_Mono'] text-sm tracking-widest uppercase transition-colors">
          ← Back
        </Link>
        <h1 className="text-3xl font-['Bebas_Neue'] tracking-wider text-[#09090B]">
          EDIT <span className="text-[#10B981]">{material.name}</span>
        </h1>
      </div>
      
      <MaterialForm initialData={material} />
    </div>
  )
}
