"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import type { SouscriptionFilters } from "@/lib/api/simulations";

interface SouscriptionFiltersProps {
  filters: SouscriptionFilters;
  onFiltersChange: (filters: SouscriptionFilters) => void;
}

const STATUT_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "validee", label: "Validée" },
  { value: "rejetee", label: "Rejetée" },
];

export function SouscriptionFilters({ filters, onFiltersChange }: SouscriptionFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    onFiltersChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleFilterChange = (key: keyof SouscriptionFilters, value: string) => {
    if (value === "all") {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange({ ...newFilters, page: 1 });
    } else {
      onFiltersChange({ ...filters, [key]: value, page: 1 });
    }
  };

  const clearFilters = () => {
    const clearedFilters: SouscriptionFilters = { page: 1, page_size: filters.page_size };
    setSearchValue("");
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.statut;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher (nom, email, téléphone)..."
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
              {STATUT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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

