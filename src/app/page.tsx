import Link from "next/link";
import { getFeatured, getAll, getModelsWithCounts } from "@/lib/catalogue";
import { ProductCard } from "@/components/product-card";
import { getSettings } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, all, models, settings] = await Promise.all([
    getFeatured(12),
    getAll(60),
    getModelsWithCounts(),
    getSettings(),
  ]);

  // Featured items already appear in the main feed; showing them twice on a
  // small catalogue makes it look emptier, not fuller.
  const rest = all.filter((p) => !featured.some((f) => f.slug === p.slug));

  return (
    <div className="mx-auto max-w-[1400px] px-2 py-2.5 lg:px-6 lg:py-4">
      {/* promo strip — compact, because a full-bleed hero pushes the catalogue
          below the fold, and on a marketplace the catalogue is the point */}
      <section className="flame-gradient mb-2.5 flex flex-col gap-2 px-4 py-5 text-white sm:flex-row sm:items-center sm:justify-between lg:px-8 lg:py-7">
        <div>
          <h1 className="text-[20px] font-extrabold leading-tight lg:text-[28px]">
            Genuine-fit accessories for your Jaecoo
          </h1>
          <p className="mt-1 text-[13px] text-white/90 lg:text-[14.5px]">
            Mats, covers, trim and protection — sourced direct, delivered across Pakistan in{" "}
            {settings.leadTimeMinDays}–{settings.leadTimeMaxDays} days.
          </p>
        </div>
        <Link
          href="/shop"
          className="w-fit shrink-0 bg-white px-5 py-2.5 text-[13.5px] font-bold text-flame hover:bg-white/90"
        >
          Shop all
        </Link>
      </section>

      {/* shop by model */}
      <section className="mb-2.5 bg-surface p-3 lg:p-4">
        <h2 className="mb-2.5 text-[14px] font-bold text-ink">Shop by model</h2>
        <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">
          {models.map((m) => (
            <Link
              key={m.slug}
              href={`/shop/${m.slug}`}
              className="flex flex-col items-center gap-1.5 py-2 hover:bg-sunk"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-flame-soft text-[14px] font-extrabold text-flame">
                {m.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 3)}
              </span>
              <span className="text-center text-[11.5px] leading-tight text-body">{m.name}</span>
              <span className="text-[10px] text-faint">{m._count.products}</span>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mb-2.5 bg-surface p-3 lg:p-4">
          <div className="mb-2.5 flex items-baseline justify-between gap-4">
            <h2 className="text-[14px] font-bold text-ink lg:text-[16px]">Featured</h2>
            <Link href="/shop" className="text-[12.5px] font-semibold text-flame">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-2">
            {featured.map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-surface p-3 lg:p-4">
        <h2 className="mb-2.5 text-[14px] font-bold text-ink lg:text-[16px]">All accessories</h2>
        {rest.length === 0 && featured.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-muted">
            Nothing published yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-2">
            {(rest.length > 0 ? rest : all).map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-2.5 grid gap-1.5 sm:grid-cols-3">
        {[
          ["Fitment checked", "Every listing states the model and trim it fits."],
          ["Sourced direct", "No middleman markup between the factory and you."],
          ["Pay in full or reserve", `${settings.depositPercent}% deposit holds your order.`],
        ].map(([title, body]) => (
          <div key={title} className="bg-surface p-3.5">
            <div className="text-[13px] font-bold text-ink">{title}</div>
            <div className="mt-0.5 text-[12.5px] leading-relaxed text-muted">{body}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
