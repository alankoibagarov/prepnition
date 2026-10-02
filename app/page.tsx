import CTA from "../components/landing/CTA";
import Features from "../components/landing/Features";
import Footer from "../components/landing/Footer";
import Gallery from "../components/landing/Gallery";
import Hero from "../components/landing/Hero";
import Navbar from "../components/landing/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#08090d] font-sans text-slate-100 selection:bg-cyan-300/30">
      <Navbar />

      <main className="mx-auto max-w-7xl px-5 sm:px-8">
        <Hero />

        <section id="features" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Built for your next career move
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Prepare, apply, and track your progress
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Keep your job search organized, prepare for interviews, and make
              your next move with confidence.
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <Features />
          </div>
        </section>

        <section id="gallery" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Your job search at a glance
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Every opportunity, all in one place
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Track applications, upcoming interviews, and outcomes in one clear
              view.
            </p>
          </div>

          <div className="mx-auto max-w-6xl">
            <Gallery />
          </div>
        </section>

        <section id="for-specialists" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Made for specialists
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your search, on your terms
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Whether you&apos;re exploring new roles or actively interviewing,
              keep the details and momentum in your hands.
            </p>
          </div>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Stay organized",
                  description:
                    "Keep company details, roles, and application status together.",
                },
                {
                  title: "Feel prepared",
                  description:
                    "Plan for interviews and keep your notes close at hand.",
                },
                {
                  title: "See your progress",
                  description:
                    "Use your application history to understand how your search is going.",
                },
              ].map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 sm:p-7"
                >
                  <h3 className="text-base font-semibold text-white">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="open-source" className="scroll-mt-24 py-20 sm:py-28">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              Free and open source
            </p>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Open tools for your job search
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Prepnition is open source under the MIT License. Use it freely,
              explore how it works, and help shape what comes next.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 sm:p-8">
              <p className="text-sm font-semibold text-white">Always free</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Get started with the full project without subscriptions or paid
                tiers.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-6 sm:p-8">
              <p className="text-sm font-semibold text-white">
                Open source · MIT
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Read, run, and adapt the source under the terms of the MIT
                License.
              </p>
            </div>
          </div>
        </section>

        <div className="pb-20 sm:pb-28">
          <CTA />
        </div>
      </main>

      <Footer />
    </div>
  );
}
