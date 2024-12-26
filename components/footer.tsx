import Link from 'next/link';
import { Github, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About TruthLens</h3>
            <p className="text-muted-foreground">
              Your trusted platform for verified news and content, powered by AI technology.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/news">News</Link></li>
              <li><Link href="/weather">Weather</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/chat">AI Chat</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <Link href="https://github.com" className="hover:text-primary">
                <Github className="h-6 w-6" />
              </Link>
              <Link href="https://twitter.com" className="hover:text-primary">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="https://facebook.com" className="hover:text-primary">
                <Facebook className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TruthLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}