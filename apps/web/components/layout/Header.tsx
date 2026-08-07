"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface User {
  id: string;
  email?: string;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user as User | null);
      setLoading(false);
    };

    checkAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user as User | null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { label: "Game", href: "/" },
    { label: "Stats", href: "/stats" },
    { label: "Forum", href: "/forum" },
  ];

  return (
    <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Countdown-dle
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-300 hover:text-white transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!loading && user ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4"
            >
              <Link
                href="/account"
                className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-all"
              >
                Account
              </Link>
            </motion.div>
          ) : !loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <Link
                href="/auth"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all"
              >
                Sign In
              </Link>
            </motion.div>
          ) : null}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <div className="h-0.5 w-6 bg-slate-300" />
              <div className="h-0.5 w-6 bg-slate-300" />
              <div className="h-0.5 w-6 bg-slate-300" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-slate-800 border-t border-slate-700 px-4 py-4 space-y-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2 rounded-lg bg-slate-700 text-slate-200 font-medium"
            >
              Account
            </Link>
          )}
        </motion.div>
      )}
    </header>
  );
}
