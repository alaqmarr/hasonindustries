"use client"

import React, { useTransition } from "react"
import { DraggableTable } from "@/components/admin/DraggableTable"
import { updateMaterialOrder } from "@/app/admin/actions/sort"
import Link from "next/link"
import toast from "react-hot-toast"

export function MaterialListClient({ materials, deleteMaterialAction }: { materials: any[], deleteMaterialAction: (formData: FormData) => void }) {
  const [isPending, startTransition] = useTransition()

  // Group materials by category
  const grouped: Record<string, any[]> = {}
  materials.forEach(m => {
    const catName = m.parentCat?.name || "Uncategorized"
    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push(m)
  })

  const handleReorder = async (newItems: any[]) => {
    const updates = newItems.map(item => ({ id: item.id, order: item.order }))
    
    startTransition(async () => {
      const res = await updateMaterialOrder(updates)
      if (res.success) {
        toast.success("Order updated")
      } else {
        toast.error("Failed to update order")
      }
    })
  }

  const columns = [
    {
      header: "Internal Name",
      render: (m: any) => <span className="font-bold text-[#09090B] group-hover:text-white transition-colors">{m.name}</span>
    },
    {
      header: "Taxonomy Route",
      className: "text-[#52525B] group-hover:text-white transition-colors",
      render: (m: any) => <span>{m.parentCat ? m.parentCat.name : "Uncategorized"}</span>
    },
    {
      header: "Visual Nodes",
      className: "text-[#10B981] font-bold group-hover:text-white transition-colors",
      render: (m: any) => <span>{m.imageKeys?.length || 0} active</span>
    },
    {
      header: "Actions",
      className: "text-right",
      render: (m: any) => (
        <div className="flex items-center justify-end gap-4">
          <Link href={`/admin/materials/${m.id}`} className="text-[#52525B] group-hover:text-white hover:!text-[#10B981] text-[10px] font-['DM_Mono'] uppercase tracking-widest underline decoration-neutral-300 hover:decoration-[#10B981] underline-offset-4 transition-colors">
            Edit
          </Link>
          <form action={deleteMaterialAction}>
            <input type="hidden" name="id" value={m.id} />
            <button type="submit" className="text-rose-500 hover:text-rose-700 group-hover:text-rose-400 text-[10px] font-['DM_Mono'] uppercase tracking-widest transition-colors">
              Scrub Data
            </button>
          </form>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-xl font-['Bebas_Neue'] tracking-widest text-[#10B981] mb-4 border-b border-neutral-200 pb-2">
            {category}
          </h2>
          <DraggableTable items={items} columns={columns} onReorder={handleReorder} />
        </div>
      ))}
    </div>
  )
}
