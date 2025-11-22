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
import { Plus, Download, BarChart3 } from "lucide-react";
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
    fetchSimulations();
    fetchUsers();
  }, [fetchBanques, fetchSimulations, fetchUsers]);

  // Calculer les statistiques pour chaque banque
  const banquesWithStats = useMemo(() => {
    return banques.map((banque) => {
      const banqueSimulations = simulations.filter((s) => s.banque === banque.id);
      const banqueUsers = users.filter((u) => u.banque.id === banque.id);
      
      const montantTotal = banqueSimulations.reduce((sum, sim) => {
        const prime = parseFloat(sim.prime_totale || "0");
        return sum + prime;
      }, 0);

      return {
        banque,
        stats: {
          totalSimulations: banqueSimulations.length,
          totalUsers: banqueUsers.length,
          montantTotal,
          evolution: 0, // TODO: Calculer l'évolution
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Banques Partenaires
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les banques partenaires, leurs produits et consultez leurs statistiques
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={() => {
              setEditingBanque(undefined);
              setIsFormOpen(true);
            }} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Banque
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100 text-sm font-medium">Total Banques</span>
              <BarChart3 className="h-5 w-5 text-blue-200" />
            </div>
            <div className="text-3xl font-bold">{banques.length}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100 text-sm font-medium">Total Simulations</span>
              <BarChart3 className="h-5 w-5 text-green-200" />
            </div>
            <div className="text-3xl font-bold">{simulations.length}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100 text-sm font-medium">Total Utilisateurs</span>
              <BarChart3 className="h-5 w-5 text-purple-200" />
            </div>
            <div className="text-3xl font-bold">{users.length}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100 text-sm font-medium">Montant Total</span>
              <BarChart3 className="h-5 w-5 text-orange-200" />
            </div>
            <div className="text-2xl font-bold">
              {(
                simulations.reduce((sum, sim) => {
                  return sum + parseFloat(sim.prime_totale || "0");
                }, 0) / 1000000
              ).toFixed(1)}M
            </div>
            <div className="text-xs text-orange-100">FCFA</div>
          </div>
        </div>

        {/* Filtres */}
        <BanqueFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onReset={() => setSearchValue("")}
        />

        {/* Liste des banques */}
        {isLoading ? (
          <div className="text-center py-12 text-gray-500">Chargement des banques...</div>
        ) : filteredBanques.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucune banque trouvée</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

