"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Edit, Eye, Plus, Trash2, X } from "lucide-react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import { LabelGroup, labelDataBankService } from "@/services/labelDataBank.service";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function GroupModal({
  group,
  onClose,
  onSaved,
}: {
  group?: LabelGroup | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [parentName, setParentName] = useState(group?.parentName || "");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (group) await labelDataBankService.updateGroup(group.id, parentName);
      else await labelDataBankService.createGroup(parentName);
      toast.success(group ? "Parent label updated" : "Parent label created");
      onSaved();
    } catch (error: any) {
      toast.error(error.message || "Failed to save parent label");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            {group ? "Edit Parent Label" : "Create Parent Label"}
          </h2>
          <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Parent Name</label>
            <input
              value={parentName}
              onChange={(event) => setParentName(event.target.value)}
              placeholder="modal_cookies"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LabelDataBankPage() {
  const toast = useToast();
  const [groups, setGroups] = useState<LabelGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [editing, setEditing] = useState<LabelGroup | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const result = await labelDataBankService.getGroups({ page, limit: 10, search: search || undefined });
      setGroups(result.data || []);
      setTotalPages(result.meta?.totalPages || 1);
      setTotalItems(result.meta?.total || 0);
    } catch (error: any) {
      toast.error(error.message || "Failed to load labels");
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  async function deleteGroup(group: LabelGroup) {
    if (!window.confirm("Data ini akan mempengaruhi tampilan UI, lanjutkan?")) return;
    try {
      await labelDataBankService.deleteGroup(group.id);
      toast.success("Parent label deleted");
      await fetchGroups();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete parent label");
    }
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Label Data Bank" />
      <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-900">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Label Data Bank</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Reusable static labels for multilingual frontend components.</p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" />
            Create Parent
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search parent label..."
            className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">{totalItems} parent group</span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-medium">Parent Name</th>
                <th className="px-4 py-3 font-medium">Total Labels</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading...</td></tr>
              ) : groups.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No parent label found</td></tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{group.parentName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{group.totalLabels}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <div>{group.createdBy || "-"}</div>
                      <div className="text-xs">{formatDate(group.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <div>{group.updatedBy || "-"}</div>
                      <div className="text-xs">{formatDate(group.updatedAt)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/data/label/${group.slug}`} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800" title="View">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button onClick={() => { setEditing(group); setModalOpen(true); }} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteGroup(group)} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700">Prev</button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40 dark:border-gray-700">Next</button>
        </div>
      </div>

      {modalOpen && (
        <GroupModal
          group={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            fetchGroups();
          }}
        />
      )}
    </div>
  );
}
