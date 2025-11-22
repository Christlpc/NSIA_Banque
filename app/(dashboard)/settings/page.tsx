"use client";

import { ProfileForm } from "@/components/settings/ProfileForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { LoginHistory } from "@/components/settings/LoginHistory";
import { ActiveSessions } from "@/components/settings/ActiveSessions";
import { AccountInfo } from "@/components/settings/AccountInfo";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-50">
            <SettingsIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Paramètres</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos préférences, votre profil et vos sessions
            </p>
          </div>
        </div>
      </div>

      {/* Informations du compte (lecture seule) */}
      <AccountInfo />

      {/* Formulaire de profil */}
      <ProfileForm />

      {/* Changement de mot de passe */}
      <PasswordForm />

      {/* Préférences de notification */}
      <NotificationPreferences />

      {/* Grille pour historique et sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoginHistory />
        <ActiveSessions />
      </div>
    </div>
  );
}

