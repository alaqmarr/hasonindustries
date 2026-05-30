import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CTA } from "@/components/home/CTA"
import { JsonLd } from "@/components/seo/JsonLd"
import type { Metadata } from "next"

export const dynamic = "force-static" // Ensuring true SSG
export const fetchCache = "force-cache"
export const revalidate = 3600 // Revalidate every hour

type Params = Promise<{ categoryId: string; productId: string }>

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    select: { slug: true, categoryId: true, parentCat: { select: { slug: true } } }
  })

  return products.map((product) => ({
    categoryId: product.parentCat?.slug || "uncategorized",
    productId: product.slug,
  }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { productId } = await params
  const product = await prisma.product.findUnique({ where: { slug: productId }, include: { parentCat: true } })
  if (!product) return {}
  return {
    title: `${product.name} | Component Specs | Hason Industries`,
    description: product.description.substring(0, 160)
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { productId } = await params
  const product = await prisma.product.findUnique({
    where: { slug: productId },
    include: { parentCat: true }
  })

  if (!product) {
    notFound()
  }

  const specs = product.specs as Record<string, string>

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "category": product.parentCat?.name || "Uncategorized",
    "image": product.imageKeys && product.imageKeys.length > 0 ? `https://hason.com/assets/${product.imageKeys[0]}` : undefined
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] py-10 md:py-16 text-[#09090B]">
      <JsonLd data={productJsonLd} />

      {/* Datasheet Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6">
        <div className="bg-[#FFFFFF] border-2 border-neutral-800 shadow-xl overflow-hidden flex flex-col">
          
          {/* Header Block (Brochure Style) */}
          <div className="border-b-4 border-neutral-800 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative">
            <div className="absolute top-0 right-0 w-64 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#10B981]/20 to-transparent pointer-events-none" />
            <div className="flex flex-col z-10">
              <h2 className="font-['DM_Mono'] text-[#10B981] text-xs md:text-sm font-bold uppercase tracking-widest mb-1">
                {product.parentCat?.name || "Industrial Component"}
              </h2>
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-['Bebas_Neue'] tracking-widest text-[#09090B] leading-[0.9] uppercase break-words max-w-4xl">
                {product.name}
              </h1>
            </div>
            
            <div className="hidden md:flex flex-col text-right z-10 shrink-0">
              <div className="text-xl font-['Bebas_Neue'] tracking-widest text-[#09090B] border-b-2 border-[#10B981] pb-1 mb-2">PRECISION COMPONENTS</div>
              <p className="font-['DM_Mono'] text-[10px] text-[#52525B] uppercase tracking-widest">WELDED & FABRICATED PRODUCTS</p>
            </div>
          </div>
          
          {/* Tagline Strip */}
          <div className="bg-[#09090B] text-[#FAFAFA] py-2 md:py-3 px-6 md:px-10 font-['DM_Mono'] text-[10px] md:text-[11px] font-bold tracking-[0.2em] flex flex-wrap gap-4 md:gap-8 justify-center uppercase">
            <span>• Custom Dimensions</span>
            <span>• Expert Fabrication</span>
            <span>• Leak-Proof</span>
            <span>• Quality Assured</span>
          </div>

          <div className="flex flex-col lg:flex-row p-4 md:p-6 gap-6">
            
            {/* Left Column (About & Specs) */}
            <div className="flex-[3] flex flex-col gap-6 min-w-0">
              
              {/* About Section */}
              <div className="border border-neutral-800 flex flex-col">
                <div className="bg-[#09090B] text-white px-4 py-2 font-['DM_Mono'] text-sm md:text-base font-bold uppercase tracking-widest flex items-center justify-between">
                  <span>Product Details</span>
                </div>
                <div 
                  className="p-5 font-['Lora'] text-[#09090B] text-sm md:text-base leading-relaxed break-words overflow-hidden [&>p]:break-words [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-['Bebas_Neue'] [&>h1]:tracking-widest [&>h1]:text-[#09090B] [&>h1]:mb-3 [&>h1]:mt-6 [&>h2]:text-xl [&>h2]:font-['Bebas_Neue'] [&>h2]:tracking-widest [&>h2]:text-[#10B981] [&>h2]:mb-2 [&>h2]:mt-4 [&>ul]:list-none [&>ul]:pl-0 [&>ul]:mb-4 [&>ul>li]:relative [&>ul>li]:pl-6 [&>ul>li]:mb-3 [&>ul>li]:before:content-['✓'] [&>ul>li]:before:absolute [&>ul>li]:before:left-0 [&>ul>li]:before:top-0 [&>ul>li]:before:text-[#10B981] [&>ul>li]:before:font-bold"
                  dangerouslySetInnerHTML={{ __html: product.description || "" }}
                />
              </div>

              {/* Specs Table */}
              {specs && Object.keys(specs).length > 0 && (
                <div className="border border-neutral-800 flex flex-col">
                  <div className="bg-[#10B981] text-white px-4 py-2 font-['DM_Mono'] text-sm md:text-base font-bold uppercase tracking-widest">
                    Technical Specifications
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-100 border-b border-neutral-300 font-['DM_Mono'] text-[10px] md:text-xs text-[#09090B] tracking-widest uppercase">
                          <th className="p-3 border-r border-neutral-300">Parameter</th>
                          <th className="p-3 text-center border-r border-neutral-300">Unit</th>
                          <th className="p-3 text-center">Value</th>
                        </tr>
                      </thead>
                      <tbody className="font-['DM_Mono'] text-[10px] md:text-xs text-[#52525B]">
                        {Object.entries(specs).map(([key, val], idx) => (
                          <tr key={key} className={`border-b border-neutral-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'}`}>
                            <td className="p-3 border-r border-neutral-200 font-semibold text-[#09090B]">{key}</td>
                            <td className="p-3 border-r border-neutral-200 text-center">-</td>
                            <td className="p-3 text-center font-bold text-[#09090B] whitespace-pre-wrap">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-2 bg-neutral-100 text-[#52525B] text-[9px] font-['DM_Mono'] uppercase tracking-widest text-center border-t border-neutral-300">
                    * Parameters subject to custom client drawings and tolerances.
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Images) */}
            <div className="flex-[2] flex flex-col gap-6 min-w-0">
              <div className="border border-neutral-800 flex flex-col h-full">
                <div className="bg-[#09090B] text-white px-4 py-2 font-['DM_Mono'] text-sm md:text-base font-bold uppercase tracking-widest text-center">
                  Visual Assets / Product Forms
                </div>
                <div className="p-4 bg-neutral-100 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[800px] scrollbar-hide">
                  {product.imageKeys && product.imageKeys.length > 0 ? (
                    product.imageKeys.map((key, idx) => (
                      <div key={key} className="border-2 border-neutral-300 bg-[#FFFFFF] p-2 hover:border-[#10B981] transition-colors group">
                        <div className="aspect-square relative overflow-hidden bg-white flex items-center justify-center">
                          <img 
                            src={`https://pub-723d911c6a3442c78b2f69b731577d2b.r2.dev/${key}`} 
                            alt={`${product.name} visual ${idx+1}`} 
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
                          />
                        </div>
                        <div className="mt-2 text-center border-t border-neutral-200 pt-2 flex justify-between px-2">
                          <span className="font-['DM_Mono'] text-[9px] font-bold text-[#52525B] tracking-widest uppercase truncate max-w-[80%]">{key}</span>
                          <span className="font-['DM_Mono'] text-[9px] font-bold text-[#10B981] tracking-widest uppercase">Fig. 0{idx + 1}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-64 border-2 border-dashed border-neutral-300 bg-[#FFFFFF] flex items-center justify-center col-span-full">
                      <p className="text-[#52525B] font-['DM_Mono'] uppercase tracking-widest text-[10px] md:text-xs">No technical visual generated</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Footer Contact Strip */}
          <div className="bg-[#09090B] mt-auto border-t-4 border-[#10B981] p-6 text-[#FAFAFA] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#10B981] rounded-full flex items-center justify-center font-['Bebas_Neue'] text-2xl">H</div>
              <div>
                <p className="font-['Bebas_Neue'] text-2xl tracking-widest leading-none">HASON INDUSTRIES</p>
                <p className="font-['DM_Mono'] text-[10px] text-[#10B981] uppercase tracking-widest">Custom Fabrication Services</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <Link href="/contact" className="flex-1 md:flex-none border border-[#10B981] text-[#10B981] font-['DM_Mono'] text-[10px] md:text-xs tracking-widest font-bold uppercase px-6 py-3 text-center transition-colors hover:bg-[#10B981] hover:text-[#09090B]">
                Inquire Volume Order
              </Link>
              <Link href={`/products/${product.parentCat?.slug || "uncategorized"}`} className="flex-1 md:flex-none bg-[#FAFAFA] text-[#09090B] font-['DM_Mono'] text-[10px] md:text-xs tracking-widest font-bold uppercase px-6 py-3 text-center transition-colors hover:bg-[#10B981]">
                Back to Category
              </Link>
            </div>
          </div>

        </div>
      </div>
      
      <CTA />
    </div>
  )
}
