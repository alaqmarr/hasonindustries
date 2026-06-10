import { prisma } from "@/lib/db"
import Link from "next/link"
import { Metadata } from "next"

export const dynamic = "force-static" // SSG route
export const fetchCache = "force-cache"
export const revalidate = 3600 // Regenerate every 1 hour

export const metadata: Metadata = {
  title: "Industrial Materials | Hason Industries",
  description: "Advanced electrical insulation materials and engineering plastics.",
}

export default async function Materials() {
  const materials = await prisma.material.findMany({
    include: { parentCat: true },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ]
  })

  // Group by category
  const grouped: Record<string, typeof materials> = {}
  materials.forEach(m => {
    const catName = m.parentCat?.name || "Uncategorized"
    if (!grouped[catName]) grouped[catName] = []
    grouped[catName].push(m)
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      <div className="pt-10 md:pt-16 px-4 sm:px-6 max-w-7xl mx-auto w-full pb-16 md:pb-24">
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-['Bebas_Neue'] tracking-widest text-[#09090B] mb-4 md:mb-6 leading-none">
          MATERIALS<span className="text-[#10B981]">.</span>
        </h1>
        <p className="font-['Lora'] text-[#52525B] max-w-2xl text-sm md:text-lg mb-10 md:mb-16 leading-relaxed">
          At Hason Industries, we specialize in a complete range of industrial grade plastics and insulating materials, combining excellent dielectric strength, high mechanical stability, and superior flame resistance.
        </p>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 md:py-20 text-[#52525B] border border-neutral-200 rounded-lg">
            No materials cataloged yet.
          </div>
        ) : (
          <div className="space-y-16 md:space-y-24">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-2xl md:text-3xl font-['Bebas_Neue'] text-[#10B981] mb-6 md:mb-8 border-b border-neutral-200 pb-3 md:pb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {items.map(m => (
                    <Link href={`/materials/${m.parentCat?.slug || "uncategorized"}/${m.slug}`} key={m.id} className="group flex flex-col h-full bg-[#FFFFFF] border border-neutral-200 hover:border-[#10B981] transition-colors relative overflow-hidden">
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
