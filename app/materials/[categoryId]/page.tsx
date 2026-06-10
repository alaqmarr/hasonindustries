import { prisma } from "@/lib/db"
import Link from "next/link"
import { Metadata } from "next"

export const dynamic = "force-static" // SSG route
export const fetchCache = "force-cache"
export const revalidate = 3600 // Regenerate every 1 hour

type Params = Promise<{ categoryId: string }>

export async function generateStaticParams() {
    const categories = await prisma.materialCategory.findMany({ select: { slug: true } })
    const params = categories.map((cat) => ({ categoryId: cat.slug }))

    // Add the uncategorized route
    params.push({ categoryId: "uncategorized" })

    return params
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { categoryId } = await params
    if (categoryId === "uncategorized") {
        return { title: `Uncategorized Materials | Hason Industries` }
    }
    const category = await prisma.materialCategory.findUnique({ where: { slug: categoryId } })
    if (!category) return {}
    return {
        title: `${category.name} Materials | Hason Industries`,
    }
}

export default async function MaterialCategoryPage({ params }: { params: Params }) {
    const { categoryId } = await params

    const materials = await prisma.material.findMany({
        where: categoryId === "uncategorized"
            ? { categoryId: null }
            : { parentCat: { slug: categoryId } },
        include: { parentCat: true },
        orderBy: [
            { order: "asc" },
            { createdAt: "desc" }
        ]
    })

    // We only have one category group to show on this page
    const categoryName = materials.length > 0 && materials[0].parentCat?.name
        ? materials[0].parentCat.name
        : (categoryId === "uncategorized" ? "Uncategorized" : "Category")

    return (
        <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
            <div className="pt-8 md:pt-10 px-4 sm:px-6 max-w-7xl mx-auto w-full pb-16 md:pb-24">

                <Link href="/materials" className="text-[#52525B] font-['DM_Mono'] text-[10px] md:text-xs uppercase tracking-widest hover:text-[#10B981] transition-colors mb-6 md:mb-8 inline-block select-none">
                    ← Return to All Materials
                </Link>
                <h1 className="text-5xl sm:text-6xl md:text-8xl font-['Bebas_Neue'] tracking-widest text-[#09090B] mb-4 md:mb-6 leading-none">
                    {categoryName}<span className="text-[#10B981]">.</span>
                </h1>
                <p className="font-['Lora'] text-[#52525B] max-w-2xl text-sm md:text-lg mb-10 md:mb-16 leading-relaxed">
                    At Hason Industries, we specialize in a complete range of industrial grade plastics and insulating materials.
                </p>

                {materials.length === 0 ? (
                    <div className="text-center py-16 md:py-20 text-[#52525B] border border-neutral-200 rounded-lg">
                        No materials cataloged in this category yet.
                    </div>
                ) : (
                    <div className="space-y-16 md:space-y-24">
                        <section>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {materials.map(m => (
                                    <Link href={`/materials/${categoryId}/${m.slug}`} key={m.id} className="group flex flex-col h-full bg-[#FFFFFF] border border-neutral-200 hover:border-[#10B981] transition-colors relative overflow-hidden">
                                        {m.imageKeys && m.imageKeys.length > 0 && (
                                            <div className="w-full aspect-[4/3] bg-[#FAFAFA] border-b border-neutral-200 overflow-x-auto flex snap-x snap-mandatory scrollbar-hide relative">
                                                {m.imageKeys.map((key, idx) => (
                                                    <img key={key} src={`https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev/${key}`} alt={`${m.name} ${idx + 1}`} className="w-full h-full object-cover shrink-0 snap-center group-hover:scale-105 transition-transform duration-500" />
                                                ))}
                                            </div>
                                        )}
                                        <div className="p-5 md:p-6 flex flex-col flex-1 relative z-10 w-full">
                                            <h3 className="text-lg md:text-xl font-bold font-['DM_Mono'] text-[#09090B] uppercase tracking-wide mb-2 group-hover:text-[#10B981] transition-colors">{m.name}</h3>
                                            <div className="text-xs text-[#52525B] line-clamp-3 mb-6 relative z-10 w-full [&>p]:mb-1 [&>h1]:text-sm [&>h2]:text-sm [&>ul]:list-disc [&>ul]:ml-4" dangerouslySetInnerHTML={{ __html: m.description || "Specifications available for industrial deployment." }} />

                                            <div className="mt-auto flex items-center justify-between z-10">
                                                <span className="text-[9px] md:text-[10px] uppercase font-['DM_Mono'] tracking-widest text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity">View Spec</span>
                                                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-[#10B981] group-hover:bg-[#10B981] shrink-0 transition-colors">
                                                    <span className="w-1.5 h-1.5 bg-[#52525B] rounded-full group-hover:bg-[#FAFAFA]"></span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    )
}
