"use client";

import { ReactNode } from "react";
import Image from "next/image";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg flex items-center justify-center">
                {/* Placeholder pour le logo - remplacez par votre logo */}
                {/* Décommentez et utilisez ceci quand vous aurez le logo */}
                <Image
                  src="/nsia.png"
                  alt="NSIA Vie Assurances"
                  width={120}
                  height={120}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NSIA Vie Assurances
            </h1>
            <p className="text-gray-600 text-lg">
              Plateforme Banques Partenaires
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 sm:p-10">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} NSIA Vie Assurances. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">
              Bienvenue sur la plateforme NSIA
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Gérez vos simulations d'assurance et souscriptions en toute simplicité
              pour vos clients des banques partenaires.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Gestion simplifiée</h3>
                  <p className="text-blue-100 text-sm">
                    Créez et gérez vos simulations en quelques clics
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sécurité renforcée</h3>
                  <p className="text-blue-100 text-sm">
                    Vos données sont protégées avec les meilleurs standards
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Performance optimale</h3>
                  <p className="text-blue-100 text-sm">
                    Interface rapide et réactive pour une expérience fluide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

