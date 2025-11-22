"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS, STATUTS } from "@/lib/utils/constants";
import { PRODUIT_LABELS, ProduitType } from "@/types";
import { Search, X } from "lucide-react";

interface FilterFormData {
  search: string;
  statut: string;
  produit: string;
}

export function SimulationFilters() {
  const { filters, setFilters, fetchSimulations } = useSimulationStore();
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleFilterChange = (key: string, value: string) => {
    // "all" est utilisé pour réinitialiser le filtre
    const filterValue = value === "all" ? undefined : value;
    const newFilters = { ...filters, [key]: filterValue, page: 1 };
    setFilters(newFilters);
    fetchSimulations(newFilters);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const newFilters = { ...filters, search: value || undefined, page: 1 };
    setFilters(newFilters);
    fetchSimulations(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 1 };
    setFilters(clearedFilters);
    setSearchValue("");
    // Les Select seront automatiquement réinitialisés à "all" car filters.statut et filters.produit seront undefined
    fetchSimulations(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.statut || filters.produit;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.statut || "all"}
            onValueChange={(value) => handleFilterChange("statut", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.produit || "all"}
            onValueChange={(value) => handleFilterChange("produit", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les produits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les produits</SelectItem>
              {Object.entries(PRODUIT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

