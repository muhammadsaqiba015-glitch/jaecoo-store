import Link from "next/link";
import Image from "next/image";
import { formatPkr } from "@/lib/money";

export interface CardProduct {
  slug: string;
  title: string;
  subtitle: string | null;
  fitLabel: string;
  coverPath: string | null;
  fromPaisa: number;
  hasRange: boolean;
  /** Reference price for the struck-through figure. Null when we have none. */
  compareAtPaisa?: number | null;
  freeDelivery?: boolean;
}

/**
 * Dense marketplace card: image, two-line title, price doing the shouting.
 *
 * There is deliberately no rating or "units sold" here. Those are the strongest
 * signals on a marketplace card and the store has neither yet — inventing them
 * would be a lie the customer cannot check, and a fast way to lose a payment
 * processor. They can be added the day real numbers exist.
 */
export function ProductCard({ p }: { p: CardProduct }) {
  const discount =
    p.compareAtPaisa && p.compareAtPaisa > p.fromPaisa
      ? Math.round(((p.compareAtPaisa - p.fromPaisa) / p.compareAtPaisa) * 100)
      : null;

  return (
    <Link
      href={`/product/${p.slug}`}
      className="group flex flex-col overflow-hidden bg-surface transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
    >
      <div className="relative aspect-square bg-sunk">
        {p.coverPath ? (
          <Image
            src={p.coverPath}
            alt={p.title}
            fill
            sizes="(min-width: 1024px) 17vw, 45vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" />
              <path d="M3 15l5-4 4 3 3-2 6 4" />
            </svg>
          </div>
        )}

        {discount !== null && (
          <span className="absolute left-0 top-0 bg-flame px-1.5 py-0.5 text-[11px] font-bold text-white">
            −{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2 sm:p-2.5">
        <span className="clamp-2 min-h-[34px] text-[12.5px] leading-[1.35] text-ink sm:text-[13px]">
          {p.title}
        </span>

        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="tnum text-[16px] font-bold leading-none text-flame sm:text-[17px]">
            {formatPkr(p.fromPaisa)}
          </span>
          {p.hasRange && <span className="text-[11px] text-muted">+</span>}
        </div>

        {p.compareAtPaisa && p.compareAtPaisa > p.fromPaisa && (
          <span className="tnum text-[11.5px] text-faint line-through">
            {formatPkr(p.compareAtPaisa)}
          </span>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1 pt-1.5">
          <span className="bg-flame-soft px-1.5 py-0.5 text-[10px] font-semibold text-flame">
            {p.fitLabel}
          </span>
          {p.freeDelivery && (
            <span className="text-[10.5px] font-medium text-good">Free delivery</span>
          )}
        </div>
      </div>
    </Link>
  );
}
