import { api } from "./api";
import type {
  Announcement,
  Attack,
  MaintenanceStatus,
  Method,
  Plan,
  User,
} from "./types";

/* ============================================================
   Endpoint bindings — one call per route observed in the HAR.
   ============================================================ */

export const authApi = {
  login: (username: string, password: string) =>
    api.post<User>("/auth/login", { username, password }),
  logout: () => api.post<{ success: boolean }>("/auth/logout"),
  me: () => api.get<User>("/user/me"),
};

export const attackApi = {
  list: () => api.get<Attack[]>("/attacks"),
  create: (input: {
    target: string;
    method: string;
    duration: number;
    concurrent: number;
  }) => api.post<Attack>("/attacks", input),
};

export const methodApi = {
  list: () => api.get<Method[]>("/methods"),
};

export const planApi = {
  list: () => api.get<Plan[]>("/plans"),
};

export const announcementApi = {
  active: () => api.get<Announcement[]>("/announcements/active"),
};

export const maintenanceApi = {
  status: () => api.get<MaintenanceStatus>("/public/maintenance-status"),
  toggle: (isUnderMaintenance: boolean) =>
    api.post<{ success: boolean }>("/admin/maintenance-toggle", { isUnder_maintenance: isUnderMaintenance }),
};

export const adminApi = {
  announcements: {
    list: () => api.get<Announcement[]>("/admin/announcements"),
    create: (data: { title: string; body: string; active: boolean }) =>
      api.post<Announcement>("/admin/announcements", data),
    update: (id: string, data: { title?: string; body?: string; active?: boolean }) =>
      api.patch<Announcement>(`/admin/announcements/${id}`, data),
    delete: (id: string) =>
      api.delete<{ success: boolean }>(`/admin/announcements/${id}`),
  },
  users: {
    list: () => api.get<User[]>("/admin/users"),
    search: (query: string) => api.get<User[]>(`/admin/users?q=${encodeURIComponent(query)}`),
    update: (id: string, data: Partial<User>) =>
      api.patch<User>(`/admin/users/${id}`, data),
  },
  stats: () => api.get<Record<string, unknown>>("/admin/stats"),
};

export const aiApi = {
  status: () => api.get<Record<string, unknown>>("/ai/assistant?action=status"),
  conversations: () => api.get<Record<string, unknown>>("/ai/assistant?action=conversations"),
  history: (convId?: string) =>
    api.get<Record<string, unknown>>(`/ai/assistant?action=history${convId ? `&conv_id=${convId}` : ""}`),
  save: (convId: string, data: Record<string, unknown>) =>
    api.post<Record<string, unknown>>(`/ai/assistant?action=save&conv_id=${convId}`, data),
  deleteConversation: (convId: string) =>
    api.post<Record<string, unknown>>("/ai/assistant?action=delete_conversation", { conv_id: convId }),
  feedback: (data: Record<string, unknown>) =>
    api.post<Record<string, unknown>>("/ai/assistant?action=feedback", data),
};

export const reconApi = {
  dns: (host: string) =>
    api.get<Record<string, unknown>>(`/tools/dns?host=${encodeURIComponent(host)}`),
  hosts: (host: string) =>
    api.get<Record<string, unknown>>(`/tools/hosts?host=${encodeURIComponent(host)}`),
  portscan: (host: string) =>
    api.get<Record<string, unknown>>(`/tools/portscan?host=${encodeURIComponent(host)}`),
  execute: (tool: string, host: string) =>
    api.get<Record<string, unknown>>(`/tools/${tool}?host=${encodeURIComponent(host)}`),
};
