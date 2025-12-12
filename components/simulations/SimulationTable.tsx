"use client";

import { useMemo, useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSimulationStore } from "@/lib/store/simulationStore";
import { STATUT_LABELS, STATUT_COLORS } from "@/lib/utils/constants";
import { PRODUIT_LABELS, type Simulation } from "@/types";
import { formatDateShort, formatDateTime } from "@/lib/utils/date";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Trash2, Calendar, User, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { DeleteSimulationDialog } from "./DeleteSimulationDialog";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<Simulation>();

export function SimulationTable() {
  const router = useSafeRouter();
  const { simulations, totalCount, filters, setFilters, fetchSimulations, isLoading, deleteSimulation } =
    useSimulationStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [simulationToDelete, setSimulationToDelete] = useState<Simulation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers defined BEFORE columns
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
      toast.success("Simulation supprimée avec succès");
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage + 1 };
    setFilters(newFilters);
    fetchSimulations(newFilters);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("reference", {
        header: "Référence",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-mono text-sm font-medium text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-500">{formatDateShort(info.row.original.created_at)}</span>
          </div>
        ),
      }),
      columnHelper.accessor(
        (row) => `${row.prenom_client || ""} ${row.nom_client || ""}`.trim() || "Client inconnu",
        {
          id: "client",
          header: "Client",
          cell: (info) => (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs ring-2 ring-white">
                {info.row.original.prenom_client?.charAt(0)}{info.row.original.nom_client?.charAt(0)}
              </div>
              <span className="font-medium text-gray-700">{info.getValue()}</span>
            </div>
          ),
        }
      ),
      columnHelper.accessor("produit", {
        header: "Produit",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-50 text-slate-700 font-normal">
              {PRODUIT_LABELS[info.getValue()] || info.getValue()}
            </Badge>
          </div>
        )
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
          header: "Montant",
          cell: (info) => {
            const value = info.getValue();
            if (!value) return <span className="text-gray-400">-</span>;
            const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
            return isNaN(numValue) ? "-" : <span className="font-semibold text-gray-900">{numValue.toLocaleString("fr-FR")} FCFA</span>;
          },
        }
      ),
      columnHelper.accessor("statut", {
        header: "Statut",
        cell: (info) => {
          const statut = info.getValue();
          return (
            <Badge className={`${STATUT_COLORS[statut] || "bg-gray-100 text-gray-800"} shadow-sm`}>
              {STATUT_LABELS[statut] || statut}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const simulation = info.row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="sr-only">Ouvrir menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/simulations/${simulation.id}`);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4 text-gray-500" />
                    Voir détails
                  </DropdownMenuItem>
                  {simulation.statut === "brouillon" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(simulation);
                        }}
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      }),
    ] as ColumnDef<Simulation>[],
    [router] // handleDeleteClick is stable as it uses state setters, but technically strictly speaking if we want to be pure we could include it, but setters are stable.
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-700 uppercase tracking-wider text-xs font-semibold">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-lg font-medium text-gray-900">Aucune simulation trouvée</p>
                    <p className="text-sm">Essayez de modifier vos filtres ou créez une nouvelle simulation.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    onClick={() => router.push(`/simulations/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
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
        <div className="border-t px-6 py-4 flex items-center justify-between bg-slate-50/50">
          <div className="text-sm text-gray-500">
            {totalCount > 0 ? (
              <>
                Affichage de <span className="font-medium text-gray-900">{table.getState().pagination.pageIndex * 10 + 1}</span> à{" "}
                <span className="font-medium text-gray-900">{Math.min((table.getState().pagination.pageIndex + 1) * 10, totalCount)}</span>{" "}
                sur <span className="font-medium text-gray-900">{totalCount}</span> résultats
              </>
            ) : "0 résultat"}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(table.getState().pagination.pageIndex - 1)}
              disabled={!table.getCanPreviousPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(table.getState().pagination.pageIndex + 1)}
              disabled={!table.getCanNextPage()}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

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

