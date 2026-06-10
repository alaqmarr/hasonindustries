import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/db"
import { MobileNav } from "./MobileNav"
import { getSetting } from "@/lib/settings"

export async function Navbar() {
  const rawCategories = await prisma.materialCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      materials: {
        select: { name: true, slug: true },
        orderBy: [
          { order: "asc" },
          { name: "asc" }
        ]
      }
    }
  })

  const contactInfo = await getSetting("contact_info", { phone1: "+91-9533220698" }) as any
  const contactPhone = contactInfo?.phone1 || "+91-9533220698"

  return (
    <nav className="w-full bg-[#0F9D58] z-40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo — visible only on mobile (TopBar hidden on mobile) */}
        <Link href="/" className="lg:hidden shrink-0">
          <Image
            src="/Hason-Industries-Logo.png"
            alt="Hason Industries"
            width={140}
            height={35}
            className="h-8 w-auto object-contain brightness-0 invert"
            priority
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8 font-['DM_Mono'] text-[12px] xl:text-[13px] tracking-widest uppercase font-bold text-[#FAFAFA]">
          <Link href="/" className="hover:text-white/80 transition-colors whitespace-nowrap">Home</Link>
          <Link href="/about" className="hover:text-white/80 transition-colors whitespace-nowrap">About Us</Link>

          {/* Materials mega-menu */}
          <div className="relative group h-14 flex items-center z-50">
            <Link href="/materials" className="hover:text-white/80 transition-colors flex items-center gap-1 whitespace-nowrap">
              Materials
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {rawCategories.length > 0 && (
              <div className="absolute top-14 left-0 w-[700px] xl:w-[800px] bg-[#FFFFFF] shadow-xl border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 origin-top py-6 px-8 grid grid-cols-3 gap-10 font-['DM_Mono'] text-xs normal-case tracking-normal z-50">
                {rawCategories.map(cat => (
                  <div key={cat.id}>
                    <h3 className="uppercase font-bold tracking-widest text-[#09090B] mb-3 border-b border-neutral-200 pb-2 flex justify-between items-end text-[11px]">
                      {cat.name}
                      <Link href={`/materials/${cat.slug}`} className="text-[9px] text-[#10B981] opacity-70 hover:opacity-100 font-normal">VIEW ALL</Link>
                    </h3>
                    <ul className="space-y-2 text-[#52525B]">
                      {cat.materials.map(m => (
                        <li key={m.slug}>
                          <Link href={`/materials/${cat.slug}/${m.slug}`} className="hover:text-[#0F9D58] transition-colors text-[11px]">{m.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/products" className="hover:text-white/80 transition-colors whitespace-nowrap">Products</Link>
          <Link href="/certificates" className="hover:text-white/80 transition-colors whitespace-nowrap">Certifications</Link>
          <Link href="/gallery" className="hover:text-white/80 transition-colors whitespace-nowrap">Gallery</Link>
          <Link href="/contact" className="hover:text-white/80 transition-colors whitespace-nowrap">Contact</Link>
        </div>

        {/* Desktop: search icon */}
        <button className="hidden lg:flex text-[#FAFAFA] hover:text-white/80 cursor-pointer p-2" aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        {/* Mobile: hamburger (client component) */}
        <MobileNav categories={rawCategories} contactPhone={contactPhone} />
      </div>
    </nav>
  )
}
