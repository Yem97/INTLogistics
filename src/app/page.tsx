import Link from "next/link";
import { PawPrint, MapPin, Bell, MessageCircle, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-4 rounded-full">
              <PawPrint className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Pet&apos;s Journey,<br />Every Step of the Way
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Track your new companion&apos;s journey across the United States in real time.
            From breeder to your front door — we keep you informed every mile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/track"
              className="bg-white text-emerald-700 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition"
            >
              Track a Shipment
            </Link>
            <Link
              href="/pets"
              className="border border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition"
            >
              Browse Available Pets
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need to stay connected
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <MapPin className="w-8 h-8 text-emerald-600" />,
                title: "Live Tracking",
                desc: "Follow your pet's journey with real-time status updates from pickup to delivery.",
              },
              {
                icon: <Bell className="w-8 h-8 text-emerald-600" />,
                title: "Instant Notifications",
                desc: "Get notified the moment your pet's status changes — so you never miss a beat.",
              },
              {
                icon: <MessageCircle className="w-8 h-8 text-emerald-600" />,
                title: "Direct Messaging",
                desc: "Chat directly with the breeder through your order page at any time.",
              },
              {
                icon: <Shield className="w-8 h-8 text-emerald-600" />,
                title: "Safe & Trusted",
                desc: "Every shipment is handled with the utmost care for the safety of your pet.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center"
              >
                <div className="flex justify-center mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-emerald-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to welcome your new companion?
          </h2>
          <p className="text-gray-600 mb-8">
            Browse our available pets or create an account to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pets"
              className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition"
            >
              Browse Pets
            </Link>
            <Link
              href="/register"
              className="border border-emerald-600 text-emerald-700 px-8 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
