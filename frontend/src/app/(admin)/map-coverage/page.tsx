"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import {
  mapCoverageService,
  MapCoverageRegion,
  MapCoverageRegionInput,
} from "@/services/mapCoverage.service";

const emptyForm: MapCoverageRegionInput = {
  code: "",
  label: "Area",
  title: "",
  color: "",
  provinceKeys: [],
  cities: [],
  lat: null,
  lon: null,
  sortOrder: 0,
  isActive: true,
};

function parseLines(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value?: string[]) {
  return Array.isArray(value) ? value.join("\n") : "";
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MapCoveragePage() {
  const toast = useToast();
  const [items, setItems] = useState<MapCoverageRegion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<MapCoverageRegion | null>(null);
  const [form, setForm] = useState<MapCoverageRegionInput>(emptyForm);
  const [provinceText, setProvinceText] = useState("");
  const [cityText, setCityText] = useState("");

  const activeCount = useMemo(() => items.filter((item) => item.isActive).length, [items]);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await mapCoverageService.getAll({
        page: 1,
        limit: 100,
        search: search || undefined,
      });
      setItems(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load map coverage data");
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setProvinceText("");
    setCityText("");
  }

  function startEdit(item: MapCoverageRegion) {
    setEditing(item);
    setForm({
      code: item.code,
      label: item.label,
      title: item.title,
      color: item.color || "",
      provinceKeys: item.provinceKeys || [],
      cities: item.cities || [],
      lat: item.lat,
      lon: item.lon,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setProvinceText(joinLines(item.provinceKeys));
    setCityText(joinLines(item.cities));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const payload: MapCoverageRegionInput = {
      ...form,
      provinceKeys: parseLines(provinceText),
      cities: parseLines(cityText),
      lat: form.lat === null || form.lat === undefined ? null : Number(form.lat),
      lon: form.lon === null || form.lon === undefined ? null : Number(form.lon),
      sortOrder: Number(form.sortOrder || 0),
    };

    try {
      if (editing) {
        await mapCoverageService.update(editing.id, payload);
        toast.success("Map coverage region updated");
      } else {
        await mapCoverageService.create(payload);
        toast.success("Map coverage region created");
      }
      startCreate();
      await fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save map coverage region");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: MapCoverageRegion) {
    if (!window.confirm(`Delete ${item.title}?`)) return;
    try {
      await mapCoverageService.delete(item.id);
      toast.success("Map coverage region deleted");
      await fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete map coverage region");
    }
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Map Coverage Management" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Map Coverage Management</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Centralized province, region, and city data for Maps Coverage V1.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-300">
              {activeCount} active
            </div>
          </div>

          <div className="mb-4 flex gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search region, code, or label..."
              className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={startCreate}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              New Region
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Code</th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Region</th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Provinces</th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Cities</th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Updated At</th>
                  <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">No map coverage data yet.</td>
                  </tr>
                ) : items.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{item.code}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.label}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.provinceKeys?.length || 0}</td>
                    <td className="px-4 py-3 text-gray-500">{item.cities?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(item.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => startEdit(item)} className="text-xs font-semibold text-blue-600 hover:underline">Edit</button>
                        <button type="button" onClick={() => handleDelete(item)} className="text-xs font-semibold text-red-600 hover:underline">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {editing ? "Edit Region" : "New Region"}
          </h2>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Code</span>
                <input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Label</span>
                <input value={form.label || ""} onChange={(event) => setForm({ ...form, label: event.target.value })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Title</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Province Keys</span>
              <textarea value={provinceText} onChange={(event) => setProvinceText(event.target.value)} rows={4} placeholder="id-jk&#10;id-jr" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Cities</span>
              <textarea value={cityText} onChange={(event) => setCityText(event.target.value)} rows={5} placeholder="Jakarta&#10;Bandung" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Latitude</span>
                <input type="number" step="any" value={form.lat ?? ""} onChange={(event) => setForm({ ...form, lat: event.target.value === "" ? null : Number(event.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Longitude</span>
                <input type="number" step="any" value={form.lon ?? ""} onChange={(event) => setForm({ ...form, lon: event.target.value === "" ? null : Number(event.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Color</span>
                <input value={form.color || ""} onChange={(event) => setForm({ ...form, color: event.target.value })} placeholder="#009b77" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-300">Sort Order</span>
                <input type="number" value={form.sortOrder ?? 0} onChange={(event) => setForm({ ...form, sortOrder: Number(event.target.value) })} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.isActive !== false} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="rounded" />
              Active
            </label>
            <div className="flex justify-end gap-2 pt-2">
              {editing && (
                <button type="button" onClick={startCreate} className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
              )}
              <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Region"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
