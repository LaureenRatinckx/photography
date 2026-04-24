import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, Mail, Menu, X, Plus, ChevronRight, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Pages (will define them below or in separate files)
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import AlbumDetail from './pages/AlbumDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Over mij', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-brand-offwhite/80 backdrop-blur-sm border-b border-brand-ink/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl serif font-semibold tracking-wider uppercase">
          Laureen Ratinckx
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-xs uppercase tracking-[0.2em] transition-colors hover:text-brand-ink",
                location.pathname === link.path ? "text-brand-ink font-medium" : "text-brand-ink/50"
              )}
            >
              {link.name}
            </Link>
          ))}
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-brand-ink/50 hover:text-brand-ink">
            <Instagram size={18} />
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-brand-offwhite border-b border-brand-ink/5 flex flex-col items-center py-10 space-y-8 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-sm uppercase tracking-widest"
              >
                {link.name}
              </Link>
            ))}
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center space-x-2 text-sm uppercase tracking-widest">
              <Instagram size={18} />
              <span>Instagram</span>
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = () => (
  <footer className="py-20 border-t border-brand-ink/5 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      <div>
        <h3 className="serif text-2xl mb-6">Laureen Ratinckx</h3>
        <p className="text-sm text-brand-ink/60 leading-relaxed max-w-xs">
          Specialized in lifestyle and reportage photography that captures the raw, honest beauty of moments.
        </p>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-brand-ink/40 mb-6">Navigation</h4>
        <div className="flex flex-col space-y-4 text-sm">
          <Link to="/portfolio" className="hover:underline">Portfolio</Link>
          <Link to="/about" className="hover:underline">Over mij</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          <Link to="/admin" className="text-xs text-brand-ink/20 hover:text-brand-ink/100">Admin</Link>
        </div>
      </div>
      <div>
        <h4 className="text-xs uppercase tracking-widest text-brand-ink/40 mb-6">Social</h4>
        <div className="flex items-center space-x-6">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity">
            <Instagram size={20} />
          </a>
          <a href="mailto:contact@laureenratinckx.be" className="hover:opacity-70 transition-opacity">
            <Mail size={20} />
          </a>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-brand-ink/5 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-brand-ink/40">
      <span>© {new Date().getFullYear()} Laureen Ratinckx Photography</span>
      <span className="mt-4 md:mt-0 italic">Designed with intention</span>
    </div>
  </footer>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col selection:bg-brand-ink selection:text-brand-offwhite">
        <Navbar />
        <main className="flex-grow pt-20">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/album/:id" element={<AlbumDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
