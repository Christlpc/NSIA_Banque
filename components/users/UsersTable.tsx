"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUserStore } from "@/lib/store/userStore";
import { getRoleDisplayName, getRoleBadgeColor } from "@/lib/utils/theme";
import type { User } from "@/types";
import { ChevronLeft, ChevronRight, MoreVertical, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { DeactivateUserDialog } from "./DeactivateUserDialog";

const columnHelper = createColumnHelper<User & { is_active?: boolean }>();

export function UsersTable() {
  const {
    users,
    totalCount,
    filters,
    setFilters,
    fetchUsers,
    isLoading,
    deleteUser,
    activateUser,
    deactivateUser,
  } = useUserStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<(User & { is_active?: boolean }) | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => `${row.prenom} ${row.nom}`,
        {
          id: "nom_complet",
          header: "Utilisateur",
          cell: (info) => {
            const user = info.row.original;
            const fullName = `${user.prenom} ${user.nom}`;
            return (
              <div className="flex items-center gap-3">
                <Avatar 
                  name={fullName} 
                  email={user.email}
                  size="md"
                  showStatus
                  isActive={user.is_active !== false}
                />
                <div>
                  <div className="font-semibold text-gray-900">{fullName}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
            );
          },
        }
      ),
      columnHelper.accessor("role", {
        header: "Rôle",
        cell: (info) => {
          const role = info.getValue();
          return (
            <Badge className={getRoleBadgeColor(role)}>
              {getRoleDisplayName(role)}
            </Badge>
          );
        },
      }),
      columnHelper.accessor("banque", {
        header: "Banque",
        cell: (info) => {
          const banque = info.getValue();
          return (
            <div>
              <div className="font-medium text-gray-900">{banque.nom}</div>
              <div className="text-xs text-gray-500">Code: {banque.code}</div>
            </div>
          );
        },
      }),
      columnHelper.accessor("is_active", {
        header: "Statut",
        cell: (info) => {
          const isActive = info.getValue() !== false;
          return (
            <Badge
              className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
            >
              {isActive ? "Actif" : "Inactif"}
            </Badge>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const user = info.row.original;
          const isActive = user.is_active !== false;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(user.id)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isActive ? (
                  <DropdownMenuItem
                    onClick={() => handleDeactivateClick(user)}
                    className="text-orange-600"
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Désactiver
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={() => handleActivate(user.id)}
                    className="text-green-600"
                  >
                    <UserCheck className="mr-2 h-4 w-4" />
                    Activer
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleDeleteClick(user)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      }),
    ] as ColumnDef<User & { is_active?: boolean }>[],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / (filters.page_size || 10)),
  });

  const handleEdit = (id: number) => {
    // Sera géré par le composant parent via CustomEvent
    if (typeof window !== "undefined" && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent("editUser", { detail: { id } }));
    }
  };

  const handleDeleteClick = (user: User & { is_active?: boolean }) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deleteUser(selectedUser.id);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(filters);
    } catch (error) {
      // Erreur gérée par le store
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await activateUser(id);
      fetchUsers(filters);
    } catch (error) {
      // Erreur gérée par le store
    }
  };

  const handleDeactivateClick = (user: User & { is_active?: boolean }) => {
    setSelectedUser(user);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await deactivateUser(selectedUser.id);
      setDeactivateDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(filters);
    } catch (error) {
      // Erreur gérée par le store
    } finally {
      setActionLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    const maxPage = Math.ceil(totalCount / (filters.page_size || 10));
    if (newPage > maxPage) return;
    
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchUsers(newFilters);
  };

  if (isLoading && users.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-12">
          <div className="text-center text-gray-500">Chargement des utilisateurs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
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
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Affichage de {(filters.page || 1) * (filters.page_size || 10) - (filters.page_size || 10) + 1} à{" "}
            {Math.min((filters.page || 1) * (filters.page_size || 10), totalCount)} sur {totalCount}{" "}
            utilisateurs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={(filters.page || 1) <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="text-sm text-gray-700">
              Page {filters.page || 1} sur {Math.max(1, Math.ceil(totalCount / (filters.page_size || 10)))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={(filters.page || 1) >= Math.ceil(totalCount / (filters.page_size || 10)) || isLoading}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Dialogs */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        userName={selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : undefined}
        isLoading={actionLoading}
      />

      <DeactivateUserDialog
        open={deactivateDialogOpen}
        onOpenChange={setDeactivateDialogOpen}
        onConfirm={handleDeactivateConfirm}
        userName={selectedUser ? `${selectedUser.prenom} ${selectedUser.nom}` : undefined}
        isLoading={actionLoading}
      />
    </Card>
  );
}

