"use client"

import React, { useTransition } from "react"
import { DraggableTable } from "@/components/admin/DraggableTable"
import { updateProductOrder } from "@/app/admin/actions/sort"
import Link from "next/link"
import toast from "react-hot-toast"

export function ProductListClient({ products, deleteProductAction }: { products: any[], deleteProductAction: (formData: FormData) => void }) {
  const [isPending, startTransition] = useTransition()

  // Group products by category
  const grouped: Record<string, any[]> = {}
  products.forEach(p => {
    const catName = p.parentCat?.name || "Uncategorized"
    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push(p)
  })

  const handleReorder = async (newItems: any[]) => {
    const updates = newItems.map(item => ({ id: item.id, order: item.order }))
    
    startTransition(async () => {
      const res = await updateProductOrder(updates)
      if (res.success) {
        toast.success("Order updated")
      } else {
        toast.error("Failed to update order")
      }
    })
  }

  const columns = [
    {
      header: "Name",
      render: (p: any) => <span className="font-bold text-[#09090B] group-hover:text-white transition-colors">{p.name}</span>
    },
    {
      header: "Category",
      className: "text-[#52525B] group-hover:text-white transition-colors",
      render: (p: any) => <span>{p.parentCat?.name || "Uncategorized"}</span>
    },
    {
      header: "Feature Status",
      className: "text-[#52525B] group-hover:text-white transition-colors",
      render: (p: any) => <span>{p.featured ? <span className="text-[#10B981]">Featured</span> : "Standard"}</span>
    },
    {
      header: "Actions",
      className: "text-right",
      render: (p: any) => (
        <div className="flex items-center justify-end gap-4">
          <Link href={`/admin/products/${p.id}`} className="text-[#52525B] hover:text-[#10B981] group-hover:text-white hover:!text-[#10B981] text-[10px] font-['DM_Mono'] uppercase tracking-widest underline decoration-neutral-300 hover:decoration-[#10B981] underline-offset-4 transition-colors">
            Edit
          </Link>
          <form action={deleteProductAction}>
            <input type="hidden" name="id" value={p.id} />
            <button type="submit" className="text-rose-500 hover:text-rose-700 group-hover:text-rose-400 text-[10px] font-['DM_Mono'] uppercase tracking-widest transition-colors">
              Delete
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
