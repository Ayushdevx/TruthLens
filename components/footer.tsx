"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Facebook, Linkedin, Instagram, Mail, Phone, MapPin, ArrowUpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

interface SocialIconProps {
  href: string;
  icon: React.ElementType;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children }) => (
  <Link 
    href={href}
    className="block text-muted-foreground hover:text-primary transition-colors duration-200 hover:translate-x-1 transform"
  >
    {children}
  </Link>
);

const SocialIcon: React.FC<SocialIconProps> = ({ href, icon: Icon }) => (
  <Link 
    href={href}
    className="p-2 rounded-full hover:bg-primary/10 transition-all duration-300 hover:scale-110 transform"
  >
    <Icon className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors duration-200" />
  </Link>
);

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`fixed bottom-4 right-4 p-2 rounded-full bg-primary/90 text-white shadow-lg transition-all duration-300 hover:scale-110 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      onClick={scrollToTop}
      aria-label="Scroll to top"
    >
      <ArrowUpCircle className="h-6 w-6" />
    </button>
  );
};

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('subscribed');
    setEmail('');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="px-4 py-2 rounded-lg bg-background border focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200"
        >
          Subscribe
        </button>
        {status === 'subscribed' && (
          <p className="text-green-500 text-sm animate-fade-in">Thanks for subscribing!</p>
        )}
      </form>
    </div>
  );
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">About TruthLens</h3>
            <p className="text-muted-foreground mb-6">
              Your trusted platform for verified news and content, powered by cutting-edge AI technology. We bring you accurate, unbiased information you can rely on.
            </p>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>ayushdevxai@gmail.com</span>
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground mt-2">
              <Phone className="h-4 w-4" />
              <span>+91 9305183418</span>
            </div>
            <div className="flex items-center space-x-4 text-muted-foreground mt-2">
              <MapPin className="h-4 w-4" />
              <span>Vellore Institute of Technology ,Chennai</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/news">Latest News</FooterLink></li>
              <li><FooterLink href="/weather">Weather Updates</FooterLink></li>
              <li><FooterLink href="/blog">Our Blog</FooterLink></li>
              <li><FooterLink href="/chat">AI Assistant</FooterLink></li>
              <li><FooterLink href="/fact-check">Fact Checking</FooterLink></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><FooterLink href="/faq">FAQ</FooterLink></li>
              <li><FooterLink href="/contact">Contact Us</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
              <li><FooterLink href="/help">Help Center</FooterLink></li>
            </ul>
          </div>
          
          <div>
            <Newsletter />
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex flex-wrap gap-2">
                <SocialIcon href="https://portfolio-eosin-nine-49.vercel.app/" icon={Github} />
                <SocialIcon href="https://ayushupadhyay.carrd.co/" icon={Twitter} />
                <SocialIcon href="https://ayushupadhyay.carrd.co/" icon={Facebook} />
                <SocialIcon href="https://www.linkedin.com/in/ayushdevai/" icon={Linkedin} />
                <SocialIcon href="https://ayushupadhyay.carrd.co/" icon={Instagram} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TruthLens. All rights reserved.</p>
          <p className="mt-2 text-sm">
            Powered by cutting-edge AI technology for accurate and reliable information
          </p>
        </div>
      </div>
      <ScrollToTop />
    </footer>
  );
};

export default Footer;