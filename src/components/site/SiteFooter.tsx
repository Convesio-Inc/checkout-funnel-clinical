/**
 * SiteFooter
 * -----------------------------------------------------------------------------
 * Quiet AG1 storefront footer: a single centered line with copyright, address,
 * and policy links. Shared by the storefront pages (Checkout, Thank You).
 * -----------------------------------------------------------------------------
 */

export function SiteFooter() {
  return (
    <footer className="mt-8 pb-10">
      <div className="max-w-[720px] mx-auto px-6 text-center text-[11px] text-ink3">
        © 2026 Meridian Botanicals · 126 SE Stark Street, Portland, OR ·{" "}
        <a href="#" className="hover:text-ink">Privacy</a> ·{" "}
        <a href="#" className="hover:text-ink">Terms</a> ·{" "}
        <a href="#" className="hover:text-ink">Refunds</a>
      </div>
    </footer>
  );
}
