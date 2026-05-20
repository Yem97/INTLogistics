"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Bell, Menu, X, PawPrint } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const user = session?.user as { role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!session) return;
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data: { read: boolean }[]) => {
        if (Array.isArray(data)) {
          setUnread(data.filter((n) => !n.read).length);
        }
      });
  }, [session]);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-700">
            <PawPrint className="w-6 h-6" />
            INT Logistics
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/pets" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
              Available Pets
            </Link>
            {session ? (
              <>
                {isAdmin ? (
                  <Link href="/admin" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link href="/dashboard" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
                    My Orders
                  </Link>
                )}
                <Link href="/notifications" className="relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-600 hover:text-emerald-700 font-medium">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-3">
          <Link href="/pets" className="block text-gray-600 text-sm">Available Pets</Link>
          {session ? (
            <>
              <Link href={isAdmin ? "/admin" : "/dashboard"} className="block text-gray-600 text-sm">
                {isAdmin ? "Admin Dashboard" : "My Orders"}
              </Link>
              <Link href="/notifications" className="block text-gray-600 text-sm">
                Notifications {unread > 0 && <span className="text-red-500">({unread})</span>}
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="block text-red-600 text-sm">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-gray-600 text-sm">Login</Link>
              <Link href="/register" className="block text-emerald-600 text-sm font-medium">Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
