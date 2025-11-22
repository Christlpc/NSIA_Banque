"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ROLES } from "@/lib/utils/constants";
import { useUserStore } from "@/lib/store/userStore";
import { UserFilters } from "@/components/users/UserFilters";
import { UsersTable } from "@/components/users/UsersTable";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import type { User } from "@/types";
import toast from "react-hot-toast";

export default function UsersPage() {
  const { fetchUsers, filters } = useUserStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(User & { is_active?: boolean }) | undefined>(
    undefined
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const handleEditUser = (event: CustomEvent) => {
      const userId = event.detail.id;
      // Trouver l'utilisateur dans le store
      const { users } = useUserStore.getState();
      const user = users.find((u) => u.id === userId);
      if (user) {
        setEditingUser(user as User & { is_active?: boolean });
        setIsFormOpen(true);
      }
    };

    window.addEventListener("editUser" as any, handleEditUser as EventListener);
    return () => {
      window.removeEventListener("editUser" as any, handleEditUser as EventListener);
    };
  }, []);

  const handleCreate = () => {
    setEditingUser(undefined);
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
              Gestion des Utilisateurs
            </h1>
            <p className="text-gray-600 mt-2">
              Gérez les utilisateurs, leurs rôles et leurs permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Exporter
            </Button>
            <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nouvel Utilisateur
            </Button>
          </div>
        </div>

        {/* Filters */}
        <UserFilters />

        {/* Table */}
        <UsersTable />

        {/* Form Dialog */}
        <UserForm
          user={editingUser}
          open={isFormOpen}
          onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
              setEditingUser(undefined);
            }
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

