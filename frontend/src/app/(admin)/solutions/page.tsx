"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import { useToast } from "@/context/ToastContext";
import {
  DataBankSolution,
  SolutionCategory,
  SolutionPayload,
  SolutionStatus,
  solutionsService,
} from "@/services/solutions.service";

type Mode = "create" | "edit";

const defaultCta = {
  label: { en: "Learn More", id: "Selengkapnya" },
  href: "",
  variant: "secondary-plain",
  size: "md",
  link_type: "url",
  iconRight: "chevron-right",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function emptyForm(): SolutionPayload {
  return {
    title: "",
    titleId: "",
    titleEn: "",
    slug: "",
    description: "",
    descriptionId: "",
    descriptionEn: "",
    image: "",
    bannerImage: "",
    ctaList: [{ ...defaultCta }],
    sortOrder: 0,
    status: "DRAFT",
    categoryIds: [],
  };
}

function getCategoryName(category: SolutionCategory) {
  return category.name || category.nameEn || category.name_id || category.name_en || category.slug;
}

function getCategoryIds(solution?: DataBankSolution | null) {
  return (solution?.categories || []).map((category) => category.id);
}

function normalizeImageSrc(value?: string) {
  const src = value?.trim();
  if (!src) return "";
  if (/^(https?:|data:|blob:|\/)/i.test(src)) return src;
  return `/${src}`;
}

export default function SolutionsPage() {
  const toast = useToast();
  const [items, setItems] = useState<DataBankSolution[]>([]);
  const [taxonomies, setTaxonomies] = useState<SolutionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SolutionStatus | "ALL">("ALL");
  const [mode, setMode] = useState<Mode>("create");
  const [selected, setSelected] = useState<DataBankSolution | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<SolutionPayload>(emptyForm());
  const [slugTouched, setSlugTouched] = useState(false);

  const groupedTaxonomies = useMemo(() => ({
    industries: taxonomies.filter((item) => item.type === "INDUSTRY"),
    scales: taxonomies.filter((item) => item.type === "BUSINESS_SCALE"),
    needs: taxonomies.filter((item) => item.type === "BUSINESS_NEED"),
  }), [taxonomies]);

  const fetchTaxonomies = useCallback(async () => {
    try {
      const response = await solutionsService.getTaxonomies();
      setTaxonomies(response.data || []);
    } catch {
      setTaxonomies([]);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await solutionsService.getSolutions({
        page: 1,
        limit: 100,
        search: search || undefined,
        status,
        sortBy: "sort_order",
        sortOrder: "asc",
      });
      setItems(response.data || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to load solutions");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, status, toast]);

  useEffect(() => {
    fetchTaxonomies();
  }, [fetchTaxonomies]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const openCreate = () => {
    setMode("create");
    setSelected(null);
    setFormData(emptyForm());
    setSlugTouched(false);
    setIsFormOpen(true);
  };

  const openEdit = (item: DataBankSolution) => {
    setMode("edit");
    setSelected(item);
    setFormData({
      title: item.title || "",
      titleId: item.titleId || "",
      titleEn: item.titleEn || "",
      slug: item.slug || "",
      description: item.description || "",
      descriptionId: item.descriptionId || "",
      descriptionEn: item.descriptionEn || "",
      image: item.image || "",
      bannerImage: item.bannerImage || "",
      ctaList: item.ctaList?.length ? item.ctaList : [{ ...defaultCta, href: `/solutions/${item.slug}` }],
      sortOrder: item.sortOrder || 0,
      status: item.status || "DRAFT",
      categoryIds: getCategoryIds(item),
    });
    setSlugTouched(true);
    setIsFormOpen(true);
  };

  const updateField = <K extends keyof SolutionPayload>(key: K, value: SolutionPayload[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const updateTitle = (value: string) => {
    setFormData((current) => ({
      ...current,
      title: value,
      titleEn: current.titleEn || value,
      titleId: current.titleId || value,
      slug: slugTouched ? current.slug : slugify(value),
      ctaList: (current.ctaList || [{ ...defaultCta }]).map((cta, index) => (
        index === 0 && !cta.href ? { ...cta, href: `/solutions/${slugify(value)}` } : cta
      )),
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((current) => {
      const categoryIds = current.categoryIds || [];
      return {
        ...current,
        categoryIds: categoryIds.includes(categoryId)
          ? categoryIds.filter((id) => id !== categoryId)
          : [...categoryIds, categoryId],
      };
    });
  };

  const updateCta = (index: number, key: "labelEn" | "labelId" | "href", value: string) => {
    setFormData((current) => {
      const ctaList = [...(current.ctaList || [])];
      const item = ctaList[index] || { ...defaultCta };
      ctaList[index] = key === "href"
        ? { ...item, href: value }
        : {
            ...item,
            label: {
              ...(typeof item.label === "object" ? item.label : {}),
              [key === "labelEn" ? "en" : "id"]: value,
            },
          };
      return { ...current, ctaList };
    });
  };

  const addCta = () => updateField("ctaList", [...(formData.ctaList || []), { ...defaultCta }]);
  const removeCta = (index: number) => updateField("ctaList", (formData.ctaList || []).filter((_, itemIndex) => itemIndex !== index));

  const validateForm = () => {
    if (!formData.title?.trim()) return "Title is required";
    if (!formData.slug?.trim()) return "Slug is required";
    if (!formData.categoryIds?.some((id) => groupedTaxonomies.industries.some((cat) => cat.id === id))) return "Select at least one industry";
    if (!formData.categoryIds?.some((id) => groupedTaxonomies.scales.some((cat) => cat.id === id))) return "Select at least one business scale";
    return "";
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        slug: slugify(formData.slug || formData.title),
        ctaList: (formData.ctaList || []).filter((cta) => cta?.label?.en || cta?.label?.id || cta?.href),
      };

      if (mode === "create") {
        await solutionsService.create(payload);
        toast.success("Solution created");
      } else if (selected) {
        await solutionsService.update(selected.id, payload);
        toast.success("Solution updated");
      }

      setIsFormOpen(false);
      await fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to save solution");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: DataBankSolution) => {
    if (!window.confirm(`Delete "${item.title}"?`)) return;
    try {
      await solutionsService.delete(item.id);
      toast.success("Solution deleted");
      await fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete solution");
    }
  };

  const togglePublish = async (item: DataBankSolution) => {
    try {
      if (item.status === "PUBLISHED") {
        await solutionsService.unpublish(item.id);
        toast.success("Solution unpublished");
      } else {
        await solutionsService.publish(item.id);
        toast.success("Solution published");
      }
      await fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to update publish status");
    }
  };

  const renderCategoryCheckboxes = (title: string, categories: SolutionCategory[]) => (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">{title}</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {categories.map((category) => (
          <label key={category.id} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">
            <input
              type="checkbox"
              checked={(formData.categoryIds || []).includes(category.id)}
              onChange={() => toggleCategory(category.id)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-gray-700 dark:text-gray-300">{getCategoryName(category)}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle="Data Bank Solutions" />

      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Bank Solutions</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage solution data used by the Solutions List Page Builder component.
            </p>
          </div>
          <button onClick={openCreate} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Add Solution
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title or slug..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white md:max-w-md"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as SolutionStatus | "ALL")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Solution</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Categories</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Order</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">Loading solutions...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No solutions found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {item.image && <img src={normalizeImageSrc(item.image)} alt="" className="h-14 w-20 rounded object-cover" />}
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                          <p className="text-xs text-gray-500">/{item.slug}</p>
                          <p className="mt-1 line-clamp-2 max-w-md text-xs text-gray-500">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex max-w-md flex-wrap gap-1.5">
                        {(item.categories || []).map((category) => (
                          <span key={category.id} className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {getCategoryName(category)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{item.sortOrder}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.status === "PUBLISHED" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => togglePublish(item)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300">
                          {item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => openEdit(item)} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs text-blue-700 hover:bg-blue-50">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(item)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100000] overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-6 max-w-5xl rounded-lg bg-white shadow-xl dark:bg-gray-900">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {mode === "create" ? "Create Solution" : "Edit Solution"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">Content supports English and Indonesian fields.</p>
                </div>
                <button type="button" onClick={() => setIsFormOpen(false)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700">
                  Close
                </button>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Title" required value={formData.title || ""} onChange={updateTitle} />
                    <Field label="Slug" required value={formData.slug || ""} onChange={(value) => { setSlugTouched(true); updateField("slug", slugify(value)); }} />
                    <Field label="Title EN" value={formData.titleEn || ""} onChange={(value) => updateField("titleEn", value)} />
                    <Field label="Title ID" value={formData.titleId || ""} onChange={(value) => updateField("titleId", value)} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Textarea label="Description EN" value={formData.descriptionEn || ""} onChange={(value) => updateField("descriptionEn", value)} />
                    <Textarea label="Description ID" value={formData.descriptionId || ""} onChange={(value) => updateField("descriptionId", value)} />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Image / Thumbnail" value={formData.image || ""} onChange={(value) => updateField("image", value)} placeholder="/assets/bg/example.jpg" />
                    <Field label="Banner Image" value={formData.bannerImage || ""} onChange={(value) => updateField("bannerImage", value)} placeholder="/assets/bg/example-banner.jpg" />
                  </div>

                  {(formData.image || formData.bannerImage) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {formData.image && <img src={normalizeImageSrc(formData.image)} alt="Thumbnail preview" className="h-40 w-full rounded-lg object-cover" />}
                      {formData.bannerImage && <img src={normalizeImageSrc(formData.bannerImage)} alt="Banner preview" className="h-40 w-full rounded-lg object-cover" />}
                    </div>
                  )}

                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold text-gray-900 dark:text-white">CTA List</p>
                      <button type="button" onClick={addCta} className="text-sm font-medium text-blue-600">Add CTA</button>
                    </div>
                    <div className="space-y-3">
                      {(formData.ctaList || []).map((cta, index) => (
                        <div key={index} className="grid gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800 md:grid-cols-[1fr_1fr_1.4fr_auto]">
                          <Field label="Label EN" value={cta?.label?.en || ""} onChange={(value) => updateCta(index, "labelEn", value)} compact />
                          <Field label="Label ID" value={cta?.label?.id || ""} onChange={(value) => updateCta(index, "labelId", value)} compact />
                          <Field label="URL" value={cta?.href || ""} onChange={(value) => updateCta(index, "href", value)} compact />
                          <button type="button" onClick={() => removeCta(index)} className="self-end rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Sort Order" type="number" value={String(formData.sortOrder || 0)} onChange={(value) => updateField("sortOrder", Number(value) || 0)} />
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                      <select value={formData.status} onChange={(event) => updateField("status", event.target.value as SolutionStatus)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-5 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    {renderCategoryCheckboxes("Industry", groupedTaxonomies.industries)}
                    {renderCategoryCheckboxes("Business Scale", groupedTaxonomies.scales)}
                    {renderCategoryCheckboxes("Business Needs", groupedTaxonomies.needs)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                <button type="button" onClick={() => setIsFormOpen(false)} disabled={saving} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                  {saving ? "Saving..." : "Save Solution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  placeholder,
  type = "text",
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
  compact?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white ${compact ? "py-2" : ""}`}
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      />
    </div>
  );
}
