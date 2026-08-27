import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-background/50 py-8">
      <div className="mx-auto max-w-7xl px-6 text-sm text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            © {new Date().getFullYear()} Prepnition. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
