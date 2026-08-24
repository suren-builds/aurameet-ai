import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-card-border mt-auto">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground/60">
          © {new Date().getFullYear()} AuraMeet AI | A Suren&apos;s Build. All rights reserved.
        </p>
        
        <div className="flex items-center gap-4 text-sm text-foreground/60">
          <Link href="/about-platform" className="hover:text-primary transition-colors">
            About Platform
          </Link>
          <Link href="/suren-builds" className="hover:text-primary transition-colors">
            Suren&apos;s Builds
          </Link>
        </div>
      </div>
    </footer>
  );
}
