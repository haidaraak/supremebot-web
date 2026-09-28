"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { adminApi } from "@/lib/endpoints";
import type { User } from "@/lib/types";

export function UserManager() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchUsers = async () => {
    try {
      const data = debouncedQuery
        ? await adminApi.users.search(debouncedQuery)
        : await adminApi.users.list();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    void fetchUsers();
  }, [debouncedQuery]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await adminApi.users.update(String(userId), { role: newRole });
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    } catch {
      alert(t("admin.users.updateFailed"));
    }
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-violet bg-violet/12";
      case "vip":
      case "basic":
        return "text-accent bg-accent/12";
      default:
        return "text-fg-subtle bg-surface-3";
    }
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldAlert className="size-3.5" />;
      case "vip":
      case "basic":
        return <ShieldCheck className="size-3.5" />;
      default:
        return <Shield className="size-3.5" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fg">{t("admin.users.title")}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-fg-subtle" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin.users.searchPlaceholder")}
            className="w-[240px] rounded-[8px] border border-line bg-input pl-10 pr-3 py-2 text-sm text-fg focus:border-accent outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-[12px] border border-line">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">{t("admin.users.username")}</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">{t("admin.users.email")}</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">{t("admin.users.role")}</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">{t("admin.users.status")}</th>
                <th className="text-left px-4 py-2 text-xs font-medium text-fg-muted">{t("admin.users.plan")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                    {t("common.loading")}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-fg-subtle">
                    {t("admin.users.empty")}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-4 py-3 font-medium text-fg">{user.username}</td>
                    <td className="px-4 py-3 text-fg-muted">{user.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {roleIcon(user.role)}
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${roleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${user.status === "active" ? "bg-ok/12 text-ok" : "bg-bad/12 text-bad"}`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fg-muted">{user.plan?.name ?? "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
