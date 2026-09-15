import Link from "next/link";

/** Fallback for URLs outside the (site) group, e.g. unknown /admin paths. */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <p className="eyebrow-accent">Error 404</p>
      <h1 className="headline mt-5 max-w-lg text-[34px] sm:text-[44px]">This page went off the record</h1>
      <Link href="/" className="btn-primary mt-9 h-11 px-6">
        Back to the homepage
      </Link>
    </div>
  );
}
