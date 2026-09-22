"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToCart } from "@/app/cart/actions";
import { formatPkr } from "@/lib/money";

export interface BuyVariant {
  id: string;
  name: string;
  pricePaisa: number;
  compareAtPaisa: number | null;
  depositPaisa: number;
  /** Index into `gallery` to show for this finish; -1 when there is none. */
  imageIndex: number;
}

/**
 * Gallery, variant picker and price, which all move together — so they live in
 * one client component rather than three that have to stay in sync.
 *
 * Stock is deliberately not shown. The numbers we hold are the supplier's
 * availability, not ours, and printing "2,000 in stock" beside a 20-day lead
 * time reads as a lie.
 */
export function ProductBuy({
  title,
  variants,
  gallery,
  depositPercent,
}: {
  title: string;
  variants: BuyVariant[];
  gallery: string[];
  depositPercent: number;
}) {
  const [picked, setPicked] = useState(variants[0]?.id ?? "");
  const [shown, setShown] = useState(Math.max(0, variants[0]?.imageIndex ?? 0));
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function add() {
    if (!current) return;
    setError(null);
    start(async () => {
      const res = await addToCart(current.id, qty);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setAdded(true);
      router.refresh();          // update the header count
      setTimeout(() => setAdded(false), 2500);
    });
  }

  /**
   * Picking a finish moves the gallery to that finish's photo — the two
   * controls describe the same thing, so they move together.
   */
  function pick(v: BuyVariant) {
    setPicked(v.id);
    if (v.imageIndex >= 0) setShown(v.imageIndex);
  }

  const current = variants.find((v) => v.id === picked) ?? variants[0];
  const discount =
    current?.compareAtPaisa && current.compareAtPaisa > current.pricePaisa
      ? Math.round(((current.compareAtPaisa - current.pricePaisa) / current.compareAtPaisa) * 100)
      : null;
  const images = gallery.length ? gallery : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-14">
      {/* gallery */}
      <div className="flex flex-col-reverse gap-2.5 lg:flex-row lg:gap-3">
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto lg:max-h-[520px] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                onClick={() => {
                  setShown(i);
                  // Clicking a thumbnail that belongs to a finish selects it,
                  // so the price never disagrees with the photo on screen.
                  const owner = variants.find((v) => v.imageIndex === i);
                  if (owner) setPicked(owner.id);
                }}
                aria-label={
                  variants.find((v) => v.imageIndex === i)?.name ?? `View image ${i + 1}`
                }
                aria-current={i === shown}
                className={`relative aspect-square w-16 shrink-0 bg-surface lg:w-[86px] ${
                  i === shown ? "border-2 border-ink" : "border border-line"
                }`}
              >
                <Image src={src} alt="" fill sizes="86px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="relative aspect-square flex-1 border border-line bg-surface">
          {images[shown] ? (
            <Image
              src={images[shown]}
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">No image</div>
          )}
        </div>
      </div>

      {/* buy column */}
      <div className="flex flex-col">
        <div className="bg-flame-soft px-3.5 py-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="tnum text-[30px] font-extrabold leading-none text-flame lg:text-[38px]">
              {formatPkr(current?.pricePaisa ?? 0)}
            </span>
            {discount !== null && (
              <>
                <span className="tnum text-[15px] text-faint line-through">
                  {formatPkr(current!.compareAtPaisa!)}
                </span>
                <span className="bg-flame px-1.5 py-0.5 text-[12px] font-bold text-white">
                  −{discount}%
                </span>
              </>
            )}
          </div>
          <div className="mt-1 text-[12.5px] text-body">{current?.name}</div>
        </div>

        <div className="label mt-6 text-[13px] text-ink">Choose your finish</div>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {variants.map((v) => {
            const on = v.id === picked;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => pick(v)}
                aria-pressed={on}
                className={`flex items-center justify-between gap-3 bg-surface px-3.5 py-3 text-left ${
                  on ? "border-2 border-ink" : "border border-line hover:border-muted"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className={`h-[15px] w-[15px] shrink-0 rounded-full bg-surface ${
                      on ? "border-[5px] border-ink" : "border border-[#cdcdca]"
                    }`}
                  />
                  <span className="truncate text-[14px] font-medium text-ink">{v.name}</span>
                </span>
                <span className="tnum shrink-0 font-tech text-[14px] font-bold text-ink">
                  {formatPkr(v.pricePaisa)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-stretch gap-3">
          <div className="flex items-center border border-[#cdcdca] bg-surface">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="flex h-[52px] w-11 items-center justify-center text-[20px] text-body hover:text-ink"
            >
              −
            </button>
            <span className="tnum w-9 text-center font-tech text-[15px] font-bold text-ink">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Increase quantity"
              className="flex h-[52px] w-11 items-center justify-center text-[18px] text-body hover:text-ink"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={pending || !current}
            className="h-[52px] flex-1 bg-flame text-[15px] font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-3 border border-danger bg-[#fbeae7] px-3 py-2 text-[13px] text-danger">
            {error}
          </p>
        )}
        {added && (
          <a href="/cart" className="label mt-3 block border border-ink bg-surface px-4 py-2.5 text-center text-[12.5px] text-ink hover:bg-sunk">
            View cart →
          </a>
        )}

        {/* On a phone the buy button scrolls off long before the customer has
            finished reading, so it is pinned to the bottom of the viewport. */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-surface px-3 py-2.5 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="min-w-0 flex-1">
            <div className="tnum text-[18px] font-extrabold leading-none text-flame">
              {formatPkr((current?.pricePaisa ?? 0) * qty)}
            </div>
            <div className="truncate text-[11px] text-muted">{current?.name}</div>
          </div>
          <button
            type="button"
            onClick={add}
            disabled={pending || !current}
            className="shrink-0 bg-flame px-6 py-3 text-[14px] font-bold uppercase text-white disabled:opacity-50"
          >
            {pending ? "Adding…" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="border border-line bg-surface p-3.5">
            <div className="label text-[10px] text-muted">Pay in full</div>
            <div className="tnum mt-1 font-tech text-[17px] font-bold text-ink">
              {formatPkr((current?.pricePaisa ?? 0) * qty)}
            </div>
          </div>
          <div className="border border-ink bg-surface p-3.5">
            <div className="label text-[10px] text-ink">
              Reserve with {depositPercent}% deposit
            </div>
            <div className="tnum mt-1 font-tech text-[17px] font-bold text-ink">
              {formatPkr((current?.depositPaisa ?? 0) * qty)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
