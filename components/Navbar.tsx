"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Menu, X } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              Kiracım<span className="text-indigo-600">kim</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#nasil-calisir"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#hakkinda"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Hakkında
            </a>
            <a
              href="#iletisim"
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              İletişim
            </a>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/giris" className="text-sm text-gray-600 hover:text-indigo-600 font-medium transition-colors">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Kayıt Ol
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          <a href="#nasil-calisir" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
            Nasıl Çalışır?
          </a>
          <a href="#hakkinda" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
            Hakkında
          </a>
          <a href="#iletisim" className="text-gray-700 font-medium" onClick={() => setMenuOpen(false)}>
            İletişim
          </a>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link href="/giris" className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg text-center">
              Giriş Yap
            </Link>
            <Link href="/kayit" className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-lg text-center">
              Kayıt Ol
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
