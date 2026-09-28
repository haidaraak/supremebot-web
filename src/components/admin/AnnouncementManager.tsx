"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { adminApi } from "@/lib/endpoints";
import type { Announcement } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function AnnouncementManager() {
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", body: "", active: true });

  const fetchAnnouncements = async () => {
    try {
      const data = await adminApi.announcements.list();
      setAnnouncements(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await adminApi.announcements.update(editingId, form);
      } else {
        await adminApi.announcements.create(form);
      }
      setForm({ title: "", body: "", active: true });
      setEditingId(null);
      await fetchAnnouncements();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (a: Announcement) => {
    setForm({ title: a.title, body: a.content ?? "", active: a.active ?? true });
    setEditingId(String(a.id));
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("admin.announcements.confirmDelete"))) return;
    try {
      await adminApi.announcements.delete(id);
      await fetchAnnouncements();
    } catch {
      alert(t("admin.announcements.deleteFailed"));
    }
  };

  const resetForm = () => {
    setForm({ title: "", body: "", active: true });
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-fg">{t("admin.announcements.title")}</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            resetForm();
          }}
        >
          <Plus className="size-4" />
          {t("admin.announcements.new")}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[12px] border border-line bg-surface p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1">{t("admin.announcements.titleField")}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-[8px] border border-line bg-input px-3 py-2 text-sm text-fg focus:border-accent outline-none"
              placeholder={t("admin.announcements.titlePlaceholder")}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1">Active</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, active: true })}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${form.active ? "bg-ok/12 text-ok" : "bg-surface-3 text-fg-subtle"}`}
              >
                <CheckCircle className="size-3.5 inline-block mr-1" />
                {t("admin.announcements.active")}
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, active: false })}
                className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${!form.active ? "bg-bad/12 text-bad" : "bg-surface-3 text-fg-subtle"}`}
              >
                <XCircle className="size-3.5 inline-block mr-1" />
                {t("admin.announcements.inactive")}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-xs font-medium text-fg-muted mb-1">{t("admin.announcements.bodyField")}</label>
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={3}
            className="w-full rounded-[8px] border border-line bg-input px-3 py-2 text-sm text-fg focus:border-accent outline-none"
            placeholder={t("admin.announcements.bodyPlaceholder")}
          />
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="submit" size="sm" loading={submitting}>
            {editingId ? t("admin.announcements.update") : t("admin.announcements.create")}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              {t("admin.announcements.cancel")}
            </Button>
          )}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {loading ? (
          <div className="text-center text-sm text-fg-subtle">{t("common.loading")}</div>
        ) : announcements.length === 0 ? (
          <div className="text-center text-sm text-fg-subtle">{t("admin.announcements.empty")}</div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="flex items-start gap-4 rounded-[12px] border border-line bg-surface p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-fg">{a.title}</h3>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.active ? "bg-ok/12 text-ok" : "bg-surface-3 text-fg-subtle"}`}>
                    {a.active ? t("admin.announcements.active") : t("admin.announcements.inactive")}
                  </span>
                </div>
                {a.content && <p className="mt-1 text-sm text-fg-muted">{a.content}</p>}
                {a.createdAt && <p className="mt-1 text-[10px] text-fg-subtle">{new Date(a.createdAt).toLocaleString()}</p>}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(a)}
                  className="p-2 rounded-[6px] hover:bg-surface-2 text-fg-muted hover:text-fg"
                >
                  <Edit2 className="size-4" />
                </button>
                <button
                  onClick={() => handleDelete(String(a.id))}
                  className="p-2 rounded-[6px] hover:bg-bad/10 text-fg-muted hover:text-bad"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}




