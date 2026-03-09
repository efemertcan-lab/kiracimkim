"use client";

import { useEffect, useRef, useState } from "react";
import { UserCheck, Link2, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserCheck,
    title: "Kayıt Ol",
    description:
      "Dakikalar içinde ücretsiz hesabınızı açın ve kiracı profilinizi oluşturun.",
    color: "indigo",
  },
  {
    number: "02",
    icon: Link2,
    title: "Link Oluştur ve Paylaş",
    description:
      "Benzersiz profil linkinizi oluşturun, eski ev sahiplerinize referans isteği gönderin.",
    color: "violet",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Referans Topla",
    description:
      "Ev sahipleri değerlendirmelerini tamamlar, siz güvenilir kiracı profilinizi kazanırsınız.",
    color: "emerald",
  },
];

const colorMap: Record<
  string,
  { bg: string; icon: string; badge: string; border: string; ring: string }
> = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    badge: "text-indigo-400",
    border: "border-indigo-100",
    ring: "ring-indigo-200",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-100 text-violet-600",
    badge: "text-violet-400",
    border: "border-violet-100",
    ring: "ring-violet-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "text-emerald-400",
    border: "border-emerald-100",
    ring: "ring-emerald-200",
  },
};

export default function HowItWorks() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="nasil-calisir" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(-16px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span className="inline-block text-indigo-600 text-sm font-semibold tracking-widest uppercase mb-4">
            Nasıl Çalışır?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            3 Adımda Güvenilir Kiracı Profilinizi Oluşturun
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Basit, hızlı ve tamamen ücretsiz. Birkaç dakika içinde profesyonel
            kiracı profilinizi oluşturun.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={sectionRef}
          className="flex flex-col md:flex-row items-stretch md:items-start gap-6 md:gap-0"
        >
          {steps.map((step, index) => {
            const c = colorMap[step.color];
            const Icon = step.icon;
            const delay = index * 0.18;

            return (
              <div key={step.number} className="flex md:flex-row flex-1 items-stretch">
                {/* Step card */}
                <div
                  className={`flex-1 relative ${c.bg} border ${c.border} rounded-2xl p-8 hover:shadow-lg transition-shadow ring-1 ${c.ring} ring-offset-0`}
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateX(0)" : "translateX(-28px)",
                    transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s, box-shadow 0.2s ease`,
                  }}
                >
                  {/* Step number */}
                  <div
                    className={`text-5xl font-black ${c.badge} mb-4 leading-none select-none`}
                  >
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 ${c.icon} rounded-xl flex items-center justify-center mb-5 shadow-sm`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Arrow connector between steps */}
                {index < steps.length - 1 && (
                  <div
                    className="hidden md:flex items-center justify-center px-3 flex-shrink-0 pt-16"
                    style={{
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.4s ease ${delay + 0.28}s`,
                    }}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-6 h-px bg-gradient-to-r from-indigo-200 to-violet-200" />
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  </div>
                )}

                {/* Mobile vertical arrow */}
                {index < steps.length - 1 && (
                  <div
                    className="flex md:hidden justify-center py-1 self-center ml-4"
                    style={{
                      opacity: visible ? 1 : 0,
                      transition: `opacity 0.4s ease ${delay + 0.28}s`,
                    }}
                  >
                    <div className="w-px h-6 bg-gradient-to-b from-indigo-200 to-violet-200" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
