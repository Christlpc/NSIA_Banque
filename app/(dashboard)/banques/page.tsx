"use client";

import { useEffect, useState, useMemo } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ROLES } from "@/lib/utils/constants";
import { useBanqueStore } from "@/lib/store/banqueStore";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { useUserStore } from "@/lib/store/userStore";
import { BanqueCard } from "@/components/banques/BanqueCard";
import { BanqueFilters } from "@/components/banques/BanqueFilters";
import { BanqueForm } from "@/components/banques/BanqueForm";
import { Button } from "@/components/ui/button";
import { Plus, Download, BarChart3, FileText, Users } from "lucide-react";
import type { Banque } from "@/types";
import toast from "react-hot-toast";

export default function BanquesPage() {
  const { banques, fetchBanques, isLoading } = useBanqueStore();
  const { simulations, fetchSimulations } = useSimulationStore();
  const { users, fetchUsers } = useUserStore();

  const [searchValue, setSearchValue] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBanque, setEditingBanque] = useState<Banque | undefined>(undefined);

  useEffect(() => {
    fetchBanques();
    // Charger un nombre raisonnable de simulations et utilisateurs pour les stats
    fetchSimulations({ page_size: 200 });
    fetchUsers({ page_size: 200 });
  }, [fetchBanques, fetchSimulations, fetchUsers]);

  // Calculer les statistiques pour chaque banque
  const banquesWithStats = useMemo(() => {
    return banques.map((banque) => {
      // Robust comparison: handle string/number mismatch and check both nested object and direct ID references
      const banqueSimulations = simulations.filter((s) => {
        const sBanqueId = typeof s.banque === 'object' ? (s.banque as any).id : s.banque;
        return String(sBanqueId) === String(banque.id);
      });

      const banqueUsers = users.filter((u) => {
        if (!u.banque) return false;
        // Check if u.banque is an object with id (populated) or just an ID (if API changes)
        const uBanqueId = typeof u.banque === 'object' ? u.banque.id : u.banque;
        return String(uBanqueId) === String(banque.id);
      });

      return {
        banque,
        stats: {
          totalSimulations: banqueSimulations.length,
          totalUsers: banqueUsers.length,
          evolution: 0,
        },
      };
    });
  }, [banques, simulations, users]);

  // Filtrer les banques selon la recherche
  const filteredBanques = useMemo(() => {
    if (!searchValue) return banquesWithStats;

    const search = searchValue.toLowerCase();
    return banquesWithStats.filter(({ banque }) =>
      banque.nom.toLowerCase().includes(search) ||
      banque.code.toLowerCase().includes(search)
    );
  }, [banquesWithStats, searchValue]);

  const handleEdit = (banque: Banque) => {
    setEditingBanque(banque);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    toast.success("Export en cours de développement");
    // TODO: Implémenter l'export CSV/Excel
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN_NSIA, ROLES.ADMIN_NSIA]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
              <span className="bg-blue-600 h-8 w-2 rounded-r-full block"></span>
              Banques Partenaires
            </h1>
            <p className="text-gray-500 mt-2 ml-5">
              Administrez les {banques.length} établissements connectés à la plateforme
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport} className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={() => {
              setEditingBanque(undefined);
              setIsFormOpen(true);
            }} className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Banque
            </Button>
          </div>
        </div>

        {/* Statistiques globales - Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart3 className="h-24 w-24 text-blue-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BarChart3 className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Banques Actives</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{banques.filter(b => b.est_active !== false).length}</span>
              <span className="text-sm text-gray-400 mb-1">/ {banques.length}</span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileText className="h-24 w-24 text-green-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <FileText className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Total Simulations</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{simulations.length}</span>
              <span className="text-sm text-green-600 mb-1 font-medium bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="h-24 w-24 text-purple-600" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-gray-500">Utilisateurs Connectés</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-gray-900">{users.length}</span>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <BanqueFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            onReset={() => setSearchValue("")}
          />
        </div>

        {/* Liste des banques */}
        {isLoading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Chargement des données...</p>
          </div>
        ) : filteredBanques.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-900">Aucune banque trouvée</p>
            <p className="text-gray-500 mt-1">Essayez de modifier vos filtres de recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBanques.map(({ banque, stats }) => (
              <BanqueCard
                key={banque.id}
                banque={banque}
                stats={stats}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}

        {/* Form Dialog */}
        <BanqueForm
          banque={editingBanque}
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setEditingBanque(undefined);
            }
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
