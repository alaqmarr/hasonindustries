import { prisma } from "@/lib/db"
import Link from "next/link"
import { CTA } from "@/components/home/CTA"
import type { Metadata } from "next"

export const dynamic = "force-static" // SSG route
export const fetchCache = "force-cache"
export const revalidate = 3600 // Regenerate every 1 hour

type Params = Promise<{ categoryId: string }>

export async function generateStaticParams() {
    const categories = await prisma.productCategory.findMany({ select: { slug: true } })
    const params = categories.map((cat) => ({ categoryId: cat.slug }))

    // Add the uncategorized route
    params.push({ categoryId: "uncategorized" })

    return params
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { categoryId } = await params
    if (categoryId === "uncategorized") {
        return { title: `Uncategorized Products | Hason Industries` }
    }
    const category = await prisma.productCategory.findUnique({ where: { slug: categoryId } })
    if (!category) return {}
    return {
        title: `${category.name} Components | Hason Industries`,
    }
}

export default async function ProductCategoryPage({ params }: { params: Params }) {
    const { categoryId } = await params

    const products = await prisma.product.findMany({
        where: categoryId === "uncategorized"
            ? { categoryId: null }
            : { parentCat: { slug: categoryId } },
        include: { parentCat: true },
        orderBy: [
            { order: 'asc' },
            { createdAt: 'desc' }
        ]
    })

    const dbCategories = await prisma.productCategory.findMany({
        orderBy: { name: 'asc' }
    })

    const categories = [
        { id: "", label: "All Assets" },
        ...dbCategories.map(c => ({ id: c.slug, label: c.name }))
    ]

    return (
        <div className="flex flex-col min-h-screen">
            <div className="pt-10 md:pt-16 pb-16 md:pb-20 px-4 sm:px-6 bg-[#FAFAFA] border-b border-neutral-300 border-opacity-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#FFFFFF] via-transparent to-transparent pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <h1 className="text-5xl sm:text-6xl md:text-8xl font-['Bebas_Neue'] tracking-widest text-[#09090B] mb-3 md:mb-4">
                        COMPONENT <span className="text-[#10B981]">MATRIX</span>
                    </h1>
                    <p className="font-['Lora'] text-[#52525B] max-w-xl text-sm md:text-base leading-relaxed">
                        Browse our full catalog of structurally and thermally resistant materials engineered for global industrial infrastructure.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16 w-full flex flex-col md:flex-row gap-8 md:gap-16 flex-1">
                {/* Sidebar Filter */}
                <aside className="w-full md:w-64 shrink-0">
                    <h3 className="font-['Bebas_Neue'] tracking-widest text-xl md:text-2xl text-[#09090B] mb-4 md:mb-6 border-b border-neutral-200 pb-3 md:pb-4">
                        Filter Parameters
                    </h3>
                    <nav className="flex flex-row md:flex-col gap-2 md:gap-3 font-['DM_Mono'] text-[10px] md:text-xs uppercase tracking-widest overflow-x-auto pb-4 md:pb-0 scrollbar-hide whitespace-nowrap md:whitespace-normal">
                        {categories.map(c => {
                            const isActive = categoryId === c.id || (categoryId === "uncategorized" && c.id === "uncategorized")
                            const href = c.id ? `/products/${c.id}` : "/products"
                            return (
                                <Link
                                    key={c.id || "all"}
                                    href={href}
                                    className={`transition-colors py-2 md:py-3 px-4 md:px-0 md:border-l-2 md:border-b-0 border-b-2 md:pl-4 inline-block md:block ${isActive ? 'text-[#10B981] border-[#10B981] bg-[#FFFFFF] shadow-sm md:shadow-none' : 'text-[#52525B] border-transparent hover:border-neutral-300 md:hover:text-[#09090B]'}`}
                                >
                                    {c.label}
                                </Link>
                            )
                        })}
                    </nav>
                </aside>

                {/* Product Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.length === 0 ? (
                        <div className="col-span-full py-24 flex items-center justify-center border border-neutral-200 text-[#52525B] font-['DM_Mono'] text-sm tracking-widest uppercase bg-[#FFFFFF]">
                            No components match the selected parameters.
                        </div>
                    ) : (
                        products.map((product) => (
                            <Link
                                href={`/products/${categoryId}/${product.slug}`}
                                key={product.id}
                                className="group border border-neutral-200 bg-[#FFFFFF] flex flex-col hover:border-[#10B981] transition-colors relative"
                            >
                                <div className="aspect-square bg-[#FAFAFA] relative overflow-hidden flex items-center justify-center p-4">
                                    {product.imageKeys && product.imageKeys.length > 0 ? (
                                        <div className="w-full h-full text-center text-[#52525B] font-['DM_Mono'] text-[8px] flex items-center justify-center p-2 break-all opacity-30 group-hover:opacity-100 transition-opacity">
                                            Linked R2 Asset: <br />{product.imageKeys[0]}
                                        </div>
                                    ) : (
                                        <div className="text-[#52525B] font-['DM_Mono'] text-[10px] uppercase border border-neutral-200 p-2">No Visual Asset</div>
                                    )}
                                    <div className="absolute inset-0 bg-[#10B981] opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500 pointer-events-none" />
                                </div>

                                <div className="p-6 flex flex-col border-t border-neutral-200 group-hover:border-[#10B981] transition-colors">
                                    <p className="font-['DM_Mono'] text-[10px] text-[#10B981] uppercase tracking-widest mb-3">{product.parentCat?.name || "Uncategorized"}</p>
                                    <h2 className="font-['Bebas_Neue'] text-3xl tracking-widest text-[#09090B] mb-2">{product.name}</h2>
                                    <div className="font-['DM_Mono'] text-[10px] text-[#52525B] uppercase tracking-widest mt-6 flex items-center gap-2">
                                        Inspect Blueprint <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <CTA />
        </div>
    )
}
