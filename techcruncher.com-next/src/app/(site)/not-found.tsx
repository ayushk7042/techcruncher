import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow-accent">Error 404</p>
      <h1 className="headline mt-5 max-w-lg text-[34px] sm:text-[44px]">This page went off the record</h1>
      <p className="mt-4 max-w-md text-[14px] leading-relaxed text-ink-soft">
        The link may be broken, or the page may have been moved or unpublished.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary h-11 px-6">
          Back to the homepage
        </Link>
        <Link href="/latest" className="btn-outline h-11 px-6">
          Browse the latest
        </Link>
      </div>
    </div>
  );
}
