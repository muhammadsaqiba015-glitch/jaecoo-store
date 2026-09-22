import Link from "next/link";
import { db } from "@/lib/db";
import { CartBadge } from "./cart-badge";

/**
 * Marketplace header: the search field is the largest thing in it, because on
 * a catalogue site search is the primary navigation, not a fallback.
 */
export async function SiteHeader() {
  const models = await db.vehicleModel.findMany({ orderBy: { position: "asc" } });

  return (
    <header className="sticky top-0 z-40">
      <div className="flex h-7 items-center justify-center bg-[#1f1f1f] px-4 text-center">
        <span className="text-[11px] text-white/85">
          Free delivery on orders over Rs 5,000 &middot; imported to order, 18&ndash;25 days
        </span>
      </div>

      <div className="flame-gradient">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2.5 lg:gap-6 lg:px-6">
          <Link href="/" className="shrink-0 leading-none" aria-label="Jaecoo Accessories — home">
            <span className="block text-[17px] font-extrabold tracking-tight text-white lg:text-[21px]">
              JAECOO
            </span>
            <span className="block text-[8.5px] font-semibold tracking-[0.3em] text-white/75">
              ACCESSORIES
            </span>
          </Link>

          <form action="/shop" className="flex min-w-0 flex-1 items-center bg-white">
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Search mats, covers, trim…"
              className="min-w-0 flex-1 px-3 py-2 text-[13.5px] text-ink outline-none placeholder:text-faint"
            />
            <button type="submit" aria-label="Search" className="bg-flame-deep px-4 py-2 text-white">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          </form>

          <div className="flex shrink-0 items-center gap-4 text-white">
            <CartBadge />
          </div>
        </div>

        <nav className="mx-auto flex max-w-[1400px] gap-4 overflow-x-auto px-3 pb-2 lg:px-6">
          <Link href="/shop" className="whitespace-nowrap text-[12.5px] font-semibold text-white">
            All
          </Link>
          {models.map((m) => (
            <Link
              key={m.id}
              href={`/shop/${m.slug}`}
              className="whitespace-nowrap text-[12.5px] text-white/85 hover:text-white"
            >
              {m.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
