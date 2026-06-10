"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateMaterialOrder(items: { id: string, order: number }[]) {
  try {
    // Run all updates in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.material.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )
    revalidatePath("/admin/materials")
    revalidatePath("/materials")
    revalidatePath("/") // To catch the mega menu layout
    return { success: true }
  } catch (error) {
    console.error("Failed to update material order", error)
    return { success: false, error: "Failed to update order" }
  }
}

export async function updateProductOrder(items: { id: string, order: number }[]) {
  try {
    // Run all updates in a transaction
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )
    revalidatePath("/admin/products")
    revalidatePath("/products")
    return { success: true }
  } catch (error) {
    console.error("Failed to update product order", error)
    return { success: false, error: "Failed to update order" }
  }
}
