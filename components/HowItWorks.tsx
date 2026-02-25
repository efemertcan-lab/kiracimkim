import { UserPlus, Star, Share2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Profilinizi Oluşturun",
    description:
      "Dakikalar içinde ücretsiz hesabınızı açın. Kişisel bilgilerinizi girin ve kiracı profilinizi tamamlayın.",
    color: "indigo",
  },
  {
    number: "02",
    icon: Star,
    title: "Referans Toplayın",
    description:
      "Eski ev sahiplerinize referans isteği gönderin. Onlar da sisteme kolayca giriş yaparak değerlendirme yapabilir.",
    color: "violet",
  },
  {
    number: "03",
    icon: Share2,
    title: "Linkinizi Paylaşın",
    description:
      "Benzersiz profil linkinizi yeni ev sahiplerinizle paylaşın. Tek tıkla tüm referanslarınızı görebilirler.",
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; icon: string; badge: string; border: string }> = {
  indigo: {
    bg: "bg-indigo-50",
    icon: "bg-indigo-100 text-indigo-600",
    badge: "text-indigo-400",
    border: "border-indigo-100",
  },
  violet: {
    bg: "bg-violet-50",
    icon: "bg-violet-100 text-violet-600",
    badge: "text-violet-400",
    border: "border-violet-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "text-emerald-400",
    border: "border-emerald-100",
  },
};

export default function HowItWorks() {
  return (
    <section id="nasil-calisir" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-16">
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
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-emerald-200" />

          {steps.map((step) => {
            const c = colorMap[step.color];
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative ${c.bg} border ${c.border} rounded-2xl p-8 hover:shadow-lg transition-shadow`}
              >
                {/* Step number */}
                <div className={`text-5xl font-black ${c.badge} mb-4 leading-none`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 ${c.icon} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
