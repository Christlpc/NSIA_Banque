"use client";

import { useMemo, useState, useEffect } from "react";
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
import { souscriptionsApi, type Souscription, type SouscriptionFilters } from "@/lib/api/simulations";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Eye, MoreVertical, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ValidateSouscriptionDialog } from "./ValidateSouscriptionDialog";
import { RejectSouscriptionDialog } from "./RejectSouscriptionDialog";
import toast from "react-hot-toast";

const columnHelper = createColumnHelper<Souscription>();

const STATUT_LABELS: Record<string, string> = {
  en_attente: "En attente",
  validee: "Validée",
  rejetee: "Rejetée",
};

const STATUT_COLORS: Record<string, string> = {
  en_attente: "bg-yellow-100 text-yellow-800",
  validee: "bg-green-100 text-green-800",
  rejetee: "bg-red-100 text-red-800",
};

export function SouscriptionTable() {
  const router = useSafeRouter();
  const [souscriptions, setSouscriptions] = useState<Souscription[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<SouscriptionFilters>({ page: 1, page_size: 10 });
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSouscription, setSelectedSouscription] = useState<Souscription | null>(null);

  const fetchSouscriptions = async (newFilters?: SouscriptionFilters) => {
    setIsLoading(true);
    try {
      const response = await souscriptionsApi.getSouscriptions(newFilters || filters);
      setSouscriptions(response.results);
      setTotalCount(response.count);
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du chargement des souscriptions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSouscriptions();
  }, []);

  const handleValidate = async (id: string) => {
    try {
      await souscriptionsApi.validateSouscription(id);
      toast.success("Souscription validée avec succès");
      fetchSouscriptions();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors de la validation");
    }
  };

  const handleReject = async (id: string, raison: string) => {
    try {
      await souscriptionsApi.rejectSouscription(id, raison);
      toast.success("Souscription rejetée");
      fetchSouscriptions();
    } catch (error: any) {
      toast.error(error?.message || "Erreur lors du rejet");
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `SUB-${row.id.slice(0, 8).toUpperCase()}`,
        {
          id: "reference",
          header: "Référence",
          cell: (info) => (
            <span className="font-mono text-sm">{info.getValue()}</span>
          ),
        }
      ),
      columnHelper.accessor("nom", {
        header: "Nom",
        cell: (info) => (
          <div>
            <div className="font-medium">{info.row.original.prenom} {info.getValue()}</div>
            <div className="text-sm text-gray-500">{info.row.original.email}</div>
          </div>
        ),
      }),
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
      columnHelper.accessor("date_effet_contrat", {
        header: "Date d'effet",
        cell: (info) => {
          const date = info.getValue();
          return date ? format(new Date(date), "dd MMM yyyy") : "-";
        },
      }),
      columnHelper.accessor("created_at", {
        header: "Créée le",
        cell: (info) => format(new Date(info.getValue()), "dd MMM yyyy"),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const souscription = info.row.original;
          const canValidate = souscription.statut === "en_attente";
          const canReject = souscription.statut === "en_attente";

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/souscriptions/${souscription.id}`)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Voir les détails
                </DropdownMenuItem>
                {canValidate && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedSouscription(souscription);
                      setValidateDialogOpen(true);
                    }}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Valider
                  </DropdownMenuItem>
                )}
                {canReject && (
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedSouscription(souscription);
                      setRejectDialogOpen(true);
                    }}
                    className="text-red-600"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Rejeter
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ] as ColumnDef<Souscription>[],
    [router]
  );

  const table = useReactTable({
    data: souscriptions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / (filters.page_size || 10)),
    state: {
      pagination: {
        pageIndex: (filters.page || 1) - 1,
        pageSize: filters.page_size || 10,
      },
    },
  });

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage + 1 };
    setFilters(newFilters);
    fetchSouscriptions(newFilters);
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
                      Aucune souscription trouvée
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
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
              {totalCount} souscription{totalCount > 1 ? "s" : ""} au total
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

      {/* Dialogs */}
      {selectedSouscription && (
        <>
          <ValidateSouscriptionDialog
            open={validateDialogOpen}
            onOpenChange={setValidateDialogOpen}
            souscription={selectedSouscription}
            onValidate={handleValidate}
          />
          <RejectSouscriptionDialog
            open={rejectDialogOpen}
            onOpenChange={setRejectDialogOpen}
            souscription={selectedSouscription}
            onReject={handleReject}
          />
        </>
      )}
    </>
  );
}

