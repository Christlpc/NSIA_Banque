"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getBankTheme } from "@/lib/utils/theme";
import { PRODUIT_LABELS } from "@/types";
import type { Banque } from "@/types";
import { Edit, TrendingUp, Users, FileText, DollarSign, ArrowRight } from "lucide-react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import { formatDateMonthYear } from "@/lib/utils/date";

interface BanqueCardProps {
  banque: Banque;
  stats?: {
    totalSimulations: number;
    totalUsers: number;
    montantTotal: number;
    evolution: number;
  };
  onEdit?: (banque: Banque) => void;
}

export function BanqueCard({ banque, stats, onEdit }: BanqueCardProps) {
  const router = useSafeRouter();
  const theme = getBankTheme(banque);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Header avec gradient */}
      <div className={`h-2 ${theme.gradient}`} />
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{banque.nom}</h3>
            <p className="text-sm text-gray-500">Code: {banque.code}</p>
            {banque.email && (
              <p className="text-xs text-gray-400 mt-1">{banque.email}</p>
            )}
            {banque.date_partenariat && (
              <p className="text-xs text-gray-400 mt-1">
                Partenaire depuis {formatDateMonthYear(banque.date_partenariat)}
              </p>
            )}
          </div>
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(banque)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-blue-50">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSimulations}</div>
              <div className="text-xs text-gray-500">Simulations</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-green-50">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
              <div className="text-xs text-gray-500">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 rounded-lg bg-purple-50">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {stats.montantTotal > 0
                  ? `${(stats.montantTotal / 1000000).toFixed(1)}M`
                  : "0"}
              </div>
              <div className="text-xs text-gray-500">FCFA</div>
            </div>
          </div>
        )}

        {/* Produits disponibles */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Produits disponibles ({banque.produits_disponibles.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {banque.produits_disponibles.map((produit) => (
              <Badge
                key={produit}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {PRODUIT_LABELS[produit]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Action */}
        <Button
          variant="outline"
          className="w-full group/btn"
          onClick={() => router.push(`/banques/${banque.id}`)}
        >
          Voir les détails
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}

