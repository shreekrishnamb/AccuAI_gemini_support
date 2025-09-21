
import Link from 'next/link';
import { Logo } from '@/components/icons';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto max-w-4xl py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h2 className="text-lg font-bold font-headline">AccuAI</h2>
              <p className="text-xs text-muted-foreground">AI Translator</p>
            </div>
          </div>
          <nav className="flex gap-4 md:gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} AccuAI. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
