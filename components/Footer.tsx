import { Home } from "lucide-react";

export default function Footer() {
  return (
    <footer id="iletisim" className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Home className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-base">
              Kiracım<span className="text-indigo-400">kim</span>
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-white transition-colors">Kullanım Koşulları</a>
            <a href="#" className="hover:text-white transition-colors">İletişim</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Kiracımkim. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
