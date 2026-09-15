import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { News } from "@/types/api";
import { SmartImage } from "@/components/ui/smart-image";
import { readTimeLabel } from "@/lib/format";
import { authorName, categoryOf, excerptOf, imageOf, newsHref, readTimeOf } from "@/lib/news";

/** Inverted band that gives one story room to breathe. */
export function LongRead({ news }: { news: News }) {
  const image = imageOf(news);
  const href = newsHref(news);

  return (
    <section className="group bg-ink px-6 py-9 sm:px-10 sm:py-11">
      <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="eyebrow-accent">The long read</p>
          <h2 className="headline mt-3 text-[30px] text-canvas sm:text-[40px]">
            <Link href={href} className="transition-colors hover:text-brand-300">
              {news.title}
            </Link>
          </h2>
          <p className="clamp-3 mt-4 max-w-xl text-[15px] leading-relaxed text-canvas/60">{excerptOf(news, 210)}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href={href} className="btn h-10 bg-accent px-5 text-white hover:bg-white hover:text-ink">
              Read the story <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <p className="meta text-canvas/45">
              {authorName(news)} / {categoryOf(news)?.name || "News"} / {readTimeLabel(readTimeOf(news))}
            </p>
          </div>
        </div>
        <Link href={href} tabIndex={-1} aria-hidden="true" className="block lg:col-span-5">
          <SmartImage
            src={image?.url}
            alt=""
            width={560}
            imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
          />
        </Link>
      </div>
    </section>
  );
}
