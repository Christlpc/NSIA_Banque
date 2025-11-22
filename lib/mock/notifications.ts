import { delay } from "./data";
import type { SystemNotification, NotificationFilters, NotificationStats } from "@/types/notifications";

// Stockage des notifications en mémoire
let notifications: SystemNotification[] = [];

// Initialiser avec des notifications de démo
const initializeNotifications = () => {
  const now = new Date();
  notifications = [
    {
      id: "1",
      type: "simulation",
      priority: "high",
      title: "Nouvelle simulation créée",
      message: "Une nouvelle simulation a été créée pour le client Jean Dupont",
      read: false,
      created_at: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      action_url: "/simulations/1",
      action_label: "Voir la simulation",
      metadata: { simulation_id: 1 },
    },
    {
      id: "2",
      type: "simulation",
      priority: "medium",
      title: "Simulation validée",
      message: "La simulation #1234 a été validée avec succès",
      read: false,
      created_at: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      action_url: "/simulations/1234",
      action_label: "Voir la simulation",
      metadata: { simulation_id: 1234 },
    },
    {
      id: "3",
      type: "user",
      priority: "low",
      title: "Nouvel utilisateur créé",
      message: "Un nouvel utilisateur a été ajouté à votre banque",
      read: true,
      created_at: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      action_url: "/users",
      action_label: "Voir les utilisateurs",
      metadata: { user_id: 5 },
    },
    {
      id: "4",
      type: "system",
      priority: "urgent",
      title: "Maintenance programmée",
      message: "Une maintenance est prévue le 15 janvier de 22h à 2h",
      read: false,
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {},
    },
    {
      id: "5",
      type: "banque",
      priority: "medium",
      title: "Banque mise à jour",
      message: "Les informations de la banque ECO ont été modifiées",
      read: true,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      action_url: "/banques/1",
      action_label: "Voir la banque",
      metadata: { banque_id: 1 },
    },
  ];
};

// Initialiser au chargement
if (notifications.length === 0) {
  initializeNotifications();
}

export const mockNotificationApi = {
  getNotifications: async (filters?: NotificationFilters): Promise<SystemNotification[]> => {
    await delay(300);
    
    let filtered = [...notifications];
    
    if (filters?.type) {
      filtered = filtered.filter((n) => n.type === filters.type);
    }
    
    if (filters?.read !== undefined) {
      filtered = filtered.filter((n) => n.read === filters.read);
    }
    
    if (filters?.priority) {
      filtered = filtered.filter((n) => n.priority === filters.priority);
    }
    
    // Trier par date (plus récentes en premier)
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  getNotificationStats: async (): Promise<NotificationStats> => {
    await delay(200);
    
    const unread = notifications.filter((n) => !n.read).length;
    
    const by_type: Record<string, number> = {
      simulation: 0,
      user: 0,
      banque: 0,
      system: 0,
      alert: 0,
    };
    
    const by_priority: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };
    
    notifications.forEach((n) => {
      by_type[n.type] = (by_type[n.type] || 0) + 1;
      by_priority[n.priority] = (by_priority[n.priority] || 0) + 1;
    });
    
    return {
      total: notifications.length,
      unread,
      by_type: by_type as NotificationStats["by_type"],
      by_priority: by_priority as NotificationStats["by_priority"],
    };
  },

  markAsRead: async (id: string): Promise<void> => {
    await delay(200);
    const notification = notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    await delay(300);
    notifications.forEach((n) => {
      n.read = true;
    });
  },

  deleteNotification: async (id: string): Promise<void> => {
    await delay(200);
    notifications = notifications.filter((n) => n.id !== id);
  },

  deleteAllRead: async (): Promise<void> => {
    await delay(300);
    notifications = notifications.filter((n) => !n.read);
  },

  // Fonction utilitaire pour ajouter une notification (pour les tests)
  addNotification: (notification: Omit<SystemNotification, "id" | "created_at">) => {
    const newNotification: SystemNotification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    notifications.unshift(newNotification);
    return newNotification;
  },
};



