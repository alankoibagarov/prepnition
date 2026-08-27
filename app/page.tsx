import CTA from "./components/CTA";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Pricing from "./components/Pricing";
import Testimonials from "./components/Testimonials";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <Hero />

        <section id="features" className="py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">Features</h2>
            <p className="mb-8 text-sm text-muted-foreground">
              Everything you need to run structured interviews and hire with
              confidence.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <Features />
          </div>
        </section>

        <section id="gallery" className="py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">Product gallery</h2>
            <p className="mb-8 text-sm text-muted-foreground">
              A few screenshots and mockups to illustrate the product.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <Gallery />
          </div>
        </section>

        <section id="testimonials" className="py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">What customers say</h2>
          </div>
          <div className="mx-auto max-w-5xl">
            <Testimonials />
          </div>
        </section>

        <section id="pricing" className="py-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-6 text-2xl font-semibold">Pricing</h2>
          </div>
          <div className="mx-auto max-w-5xl">
            <Pricing />
          </div>
        </section>

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
