import { prisma } from "@/lib/db"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { MaterialListClient } from "./MaterialListClient"

export const dynamic = "force-dynamic"

export default async function AdminMaterialsIndex() {
  const materials = await prisma.material.findMany({
    include: { parentCat: true },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ]
  })

  async function deleteMaterial(formData: FormData) {
    "use server"
    await prisma.material.delete({
      where: { id: formData.get("id") as string }
    })
    revalidatePath("/admin/materials")
  }

  async function updateOrder(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const direction = formData.get("direction") as string
    const currentOrder = parseInt(formData.get("currentOrder") as string)
    
    // Simple increment/decrement strategy
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1
    
    await prisma.material.update({
      where: { id },
      data: { order: newOrder }
    })
    
    revalidatePath("/admin/materials")
    revalidatePath("/materials")
  }

  return (
    <div className="max-w-6xl pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-neutral-200 pb-4 gap-4">
        <h1 className="text-3xl font-['Bebas_Neue'] tracking-wider text-[#09090B]">
          MATERIAL <span className="text-[#10B981]">MANAGEMENT</span>
        </h1>
        <div className="flex gap-4">
          <Link href="/admin/materials/categories" className="bg-[#FFFFFF] border border-[#10B981] text-[#10B981] font-['DM_Mono'] text-xs uppercase tracking-widest px-6 py-2 hover:bg-[#10B981] hover:text-[#FAFAFA] transition-colors">
            Manage Categories
          </Link>
          <Link href="/admin/materials/new" className="bg-[#09090B] text-[#FAFAFA] font-['DM_Mono'] text-xs font-bold uppercase tracking-widest px-6 py-2 hover:bg-[#10B981] transition-colors">
            + New Material
          </Link>
        </div>
      </div>

      <div className="bg-[#FFFFFF] p-8 border border-neutral-200">
        <div className="mb-8">
          <h2 className="text-xl font-['Bebas_Neue'] tracking-widest text-[#09090B] mb-2">System Database</h2>
          <p className="text-[#52525B] font-['Lora'] text-sm italic">Categorized material sorting interface.</p>
        </div>

        {materials.length === 0 ? (
          <div className="p-8 text-center text-[#52525B] font-['DM_Mono'] text-sm uppercase bg-[#FAFAFA] border border-neutral-200">
            No materials found in the database.
          </div>
        ) : (
          <MaterialListClient materials={materials} deleteMaterialAction={deleteMaterial} />
        )}
      </div>
    </div>
  )
}
