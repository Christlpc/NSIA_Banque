"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
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
import { useUserStore } from "@/lib/store/userStore";
import { ROLES } from "@/lib/utils/constants";
import { getRoleDisplayName } from "@/lib/utils/theme";
import { banqueApi } from "@/lib/api/banques";
import type { Banque } from "@/types";
import { Search, X } from "lucide-react";

export function UserFilters() {
  const { filters, setFilters, fetchUsers } = useUserStore();
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchValue, 500);
  const [banques, setBanques] = useState<Banque[]>([]);
  const lastAppliedSearch = useRef(filters.search || "");
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only trigger if the value actually changed from last applied
    if (debouncedSearch !== lastAppliedSearch.current) {
      lastAppliedSearch.current = debouncedSearch;
      const newFilters = { ...filters, search: debouncedSearch || undefined, page: 1 };
      setFilters(newFilters);
      fetchUsers(newFilters);
    }
  }, [debouncedSearch]); // Only depend on debouncedSearch

  useEffect(() => {
    const loadBanques = async () => {
      try {
        const response = await banqueApi.getBanques();
        setBanques(response.results);
      } catch (error) {
        console.error("Erreur lors du chargement des banques", error);
      }
    };
    loadBanques();
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    // La recherche sera déclenchée par l'effet debouncedSearch
  };

  const handleFilterChange = (key: string, value: string) => {
    let filterValue: any = value === "all" ? undefined : value;

    // Convertir banque en number si nécessaire
    if (key === "banque" && filterValue !== undefined) {
      filterValue = parseInt(filterValue, 10);
    }

    const newFilters = { ...filters, [key]: filterValue, page: 1 };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { page: 1, page_size: 10 };
    setFilters(clearedFilters);
    setSearchValue("");
    fetchUsers(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.role || filters.banque || filters.is_active !== undefined;

  const roleOptions = [
    { value: "all", label: "Tous les rôles" },
    { value: ROLES.SUPER_ADMIN_NSIA, label: getRoleDisplayName(ROLES.SUPER_ADMIN_NSIA) },
    { value: ROLES.ADMIN_NSIA, label: getRoleDisplayName(ROLES.ADMIN_NSIA) },
    { value: ROLES.RESPONSABLE_BANQUE, label: getRoleDisplayName(ROLES.RESPONSABLE_BANQUE) },
    { value: ROLES.GESTIONNAIRE, label: getRoleDisplayName(ROLES.GESTIONNAIRE) },
    { value: ROLES.SUPPORT, label: getRoleDisplayName(ROLES.SUPPORT) },
  ];

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par nom, prénom, email..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filters.role || "all"}
            onValueChange={(value) => handleFilterChange("role", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.banque ? String(filters.banque) : "all"}
            onValueChange={(value) => handleFilterChange("banque", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toutes les banques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les banques</SelectItem>
              {banques
                .filter((banque) => banque.id)
                .map((banque, index) => (
                  <SelectItem key={`banque-${banque.id}-${index}`} value={String(banque.id)}>
                    {banque.nom || `Banque ${banque.id}`}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select
            value={
              filters.is_active === undefined
                ? "all"
                : filters.is_active
                  ? "active"
                  : "inactive"
            }
            onValueChange={(value) => {
              if (value === "all") {
                const newFilters = { ...filters };
                delete newFilters.is_active;
                newFilters.page = 1;
                setFilters(newFilters);
                fetchUsers(newFilters);
              } else {
                const activeValue = value === "active";
                const newFilters = { ...filters, is_active: activeValue, page: 1 };
                setFilters(newFilters);
                fetchUsers(newFilters);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs uniquement</SelectItem>
              <SelectItem value="inactive">Inactifs uniquement</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="w-full md:w-auto">
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

