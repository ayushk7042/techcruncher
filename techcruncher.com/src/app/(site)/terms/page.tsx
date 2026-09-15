import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/headers";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "Terms of use" };

export default function TermsPage() {
  return (
    <>
      <PageHeader eyebrow="Legal" title="Terms of use" crumbs={[{ label: "Legal" }, { label: "Terms of use" }]} />
      <div className="container py-14">
        <div className="article-body">
          <p>By using {site.name} you agree to these terms.</p>
          <h2>Our content</h2>
          <p>
            Articles, photographs and graphics are owned by {site.name} or its contributors and licensors. You may share links
            and short quotations with attribution. Republishing full articles requires written permission.
          </p>
          <h2>Accuracy</h2>
          <p>
            We work to be accurate and correct errors promptly, but content is provided for general information and is not
            professional advice.
          </p>
          <h2>Links and advertising</h2>
          <p>
            We link to other websites and show labelled advertising. We are not responsible for the content or practices of
            third-party sites.
          </p>
          <h2>Changes</h2>
          <p>
            We may update these terms. Material changes will be noted on this page. Questions? <Link href="/contact">Contact us</Link>.
          </p>
        </div>
      </div>
    </>
  );
}
