"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface BanqueFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

// Note: onSearchChange prop is now called only after debounce
export function BanqueFilters({ searchValue, onSearchChange, onReset }: BanqueFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, 300); // 300ms for client-side filtering feels snappier

  // Sync prop -> local (e.g. reset button from parent)
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Sync debounce -> prop
  useEffect(() => {
    if (debouncedSearch !== searchValue) {
      onSearchChange(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Handle Input Change
  const handleInputChange = (value: string) => {
    setLocalSearch(value);
  };

  const hasActiveFilters = localSearch.length > 0;

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher une banque..."
              value={localSearch}
              onChange={(e) => handleInputChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {hasActiveFilters && (
            <Button variant="outline" onClick={onReset} className="w-full sm:w-auto">
              <X className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




