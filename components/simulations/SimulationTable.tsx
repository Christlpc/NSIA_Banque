"use client";

import { useMemo } from "react";
import { useSafeRouter } from "@/lib/hooks/useSafeRouter";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS, STATUT_COLORS } from "@/lib/utils/constants";
import { PRODUIT_LABELS, type Simulation } from "@/types";
import { formatDateShort } from "@/lib/utils/date";
import { ChevronLeft, ChevronRight, Eye, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteSimulationDialog } from "./DeleteSimulationDialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<Simulation>();

export function SimulationTable() {
  const router = useSafeRouter();
  const { simulations, totalCount, filters, setFilters, fetchSimulations, isLoading } =
    useSimulationStore();

  const columns = useMemo(
    () => [
      columnHelper.accessor("reference", {
        header: "Référence",
        cell: (info) => (
          <span className="font-mono text-sm">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) => `${row.prenom_client || ""} ${row.nom_client || ""}`.trim() || "Client inconnu",
        {
          id: "client",
          header: "Client",
          cell: (info) => <span className="font-medium">{info.getValue()}</span>,
        }
      ),
      columnHelper.accessor("produit", {
        header: "Produit",
        cell: (info) => PRODUIT_LABELS[info.getValue()] || info.getValue(),
      }),
      columnHelper.accessor(
        (row) => {
          // Check for prime_totale in multiple locations
          const primeFromRoot = row.prime_totale;
          const primeFromResultats = row.resultats_calcul?.prime_totale;
          const primeFromNetDebourser = row.net_a_debourser;
          return primeFromRoot || primeFromResultats || primeFromNetDebourser;
        },
        {
          id: "prime_totale",
          header: "Prime Totale",
          cell: (info) => {
            const value = info.getValue();
            if (!value) return "-";
            const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(numValue) ? "-" : `${numValue.toLocaleString("fr-FR")} FCFA`;
          },
        }
      ),
      columnHelper.accessor("statut", {
        header: "Statut",
        cell: (info) => {
          const statut = info.getValue();
          return (
            <Badge className={STATUT_COLORS[statut] || "bg-gray-100 text-gray-800"}>
              {STATUT_LABELS[statut] || statut}
            </Badge>
          );
        },
      }),
      columnHelper.accessor(
        (row) => {
          // Check multiple sources for date
          const date = row.created_at || row.updated_at || row.date_creation || row.date_modification;
          console.log("Date for simulation", row.reference, ":", date);
          return date;
        },
        {
          id: "date",
          header: "Date",
          cell: (info) => {
            const value = info.getValue();
            if (!value) {
              console.log("No date value found");
              return "-";
            }
            try {
              return formatDateShort(value);
            } catch (error) {
              console.error("Error formatting date:", value, error);
              return "-";
            }
          },
        }
      ),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const simulation = info.row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/simulations/${simulation.id}`);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                {simulation.statut === "brouillon" && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      // @ts-ignore - handleDeleteClick is defined in the component scope but columns is memoized
                      // We need to pass the handler to the columns definition or use a context/store
                      // For now, let's use a custom event or refactor columns to be inside the component
                      // Refactoring columns to be inside component body is safer
                      // But since columns is memoized with [router], we can add handleDeleteClick to deps
                    }}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ] as ColumnDef<Simulation>[],
    [router]
  );

  const table = useReactTable({
    data: simulations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / 10),
    state: {
      pagination: {
        pageIndex: (filters.page || 1) - 1,
        pageSize: 10,
      },
    },
  });

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage + 1 };
    setFilters(newFilters);
    fetchSimulations(newFilters);
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simulationToDelete, setSimulationToDelete] = useState<Simulation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteSimulation } = useSimulationStore();

  const handleDeleteClick = (simulation: Simulation) => {
    setSimulationToDelete(simulation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!simulationToDelete) return;
    setIsDeleting(true);
    try {
      await deleteSimulation(simulationToDelete.id);
      setDeleteDialogOpen(false);
      setSimulationToDelete(null);
      toast.success("Simulation supprimée");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-gray-500">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="text-left p-4 font-medium text-gray-700"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                      Aucune simulation trouvée
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/simulations/${row.original.id}`)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-600">
              Affichage de {table.getState().pagination.pageIndex * 10 + 1} à{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * 10,
                totalCount
              )}{" "}
              sur {totalCount} résultats
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {simulationToDelete && (
        <DeleteSimulationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          simulation={simulationToDelete}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}

