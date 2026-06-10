import { prisma } from "@/lib/db"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { ProductListClient } from "./ProductListClient"

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    include: { parentCat: true },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ]
  })

  async function updateOrder(formData: FormData) {
    "use server"
    const id = formData.get("id") as string
    const direction = formData.get("direction") as string
    const currentOrder = parseInt(formData.get("currentOrder") as string)
    
    // Simple increment/decrement strategy
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1
    
    await prisma.product.update({
      where: { id },
      data: { order: newOrder }
    })
    
    revalidatePath("/admin/products")
    revalidatePath("/products")
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-['Bebas_Neue'] tracking-wider">Product Catalog</h1>
        <Link 
          href="/admin/products/new" 
          className="bg-[#10B981] text-[#FAFAFA] font-['DM_Mono'] text-sm font-bold tracking-widest uppercase py-2 px-6 hover:bg-[#09090B] transition-colors"
        >
          [+] New Product
        </Link>
      </div>

      <div className="bg-[#FFFFFF] p-8 border border-neutral-200">
        <div className="mb-8">
          <h2 className="text-xl font-['Bebas_Neue'] tracking-widest text-[#09090B] mb-2">Component Matrix</h2>
          <p className="text-[#52525B] font-['Lora'] text-sm italic">Categorized product sorting interface.</p>
        </div>

        {products.length === 0 ? (
          <div className="p-8 text-center text-[#52525B] font-['DM_Mono'] text-sm uppercase bg-[#FAFAFA] border border-neutral-200">
            No products found in the database.
          </div>
        ) : (
          <ProductListClient products={products} deleteProductAction={deleteProduct} />
        )}
      </div>
    </div>
  )
}
