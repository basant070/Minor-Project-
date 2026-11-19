/** Purpose: Provide the shared contact and social-links footer for site pages. */
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

export default function SiteFooter() {
  return (
    <footer
      className="scroll-mt-[88px] bg-slate-950 px-6 py-12 text-white sm:px-10"
      id="contact"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Product name and short community description. */}
          <div>
            <p className="text-lg font-extrabold tracking-tight">
              Alumni-Student Connect
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-white/60">
              Stronger connections today. More possibilities tomorrow.
            </p>
          </div>
          {/* External social profiles. */}
          <div>
            <h3 className="text-sm font-bold text-white">Contact</h3>
            <div className="mt-3 flex gap-3">
              <a
                aria-label="Facebook"
                className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
                href="https://www.facebook.com/profile.php?id=100075369985975"
                rel="noreferrer"
                target="_blank"
              >
                <FaFacebookF aria-hidden="true" className="h-5 w-5" />
              </a>
              <a
                aria-label="Instagram"
                className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
                href="https://www.instagram.com/basantbhat70/"
                rel="noreferrer"
                target="_blank"
              >
                <FaInstagram aria-hidden="true" className="h-5 w-5" />
              </a>
              <a
                aria-label="WhatsApp"
                className="rounded-full bg-white/10 p-2 text-white/70 transition hover:bg-white/20 hover:text-white"
                href="https://wa.me/"
                rel="noreferrer"
                target="_blank"
              >
                <FaWhatsapp aria-hidden="true" className="h-5 w-5" />
              </a>
            </div>
          </div>
          {/* Email contact method. */}
          <div>
            <h3 className="text-sm font-bold text-white">Email</h3>
            <a
              className="mt-3 inline-block text-sm text-indigo-300 transition hover:text-white"
              href="mailto:hello@example.org"
            >
              basantbhat70@gmail.com
            </a>
          </div>
          {/* Phone and physical address. */}
          <div>
            <h3 className="text-sm font-bold text-white">Phone</h3>
            <a
              className="mt-3 inline-block text-sm text-indigo-300 transition hover:text-white"
              href="tel:+12025550147"
            >
              +977 9868766278
            </a>
            <p className="mt-2 text-xs text-white/60">
              17 Bhimdatta, Kanchanpur, Sudurpaschim, Nepal
            </p>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Alumni-Student Connect. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
