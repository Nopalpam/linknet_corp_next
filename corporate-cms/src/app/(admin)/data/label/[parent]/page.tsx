"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Code2, Edit, Eye, GripVertical, Plus, Trash2, X } from "lucide-react";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import CKEditorWrapper from "@/components/ui/ckeditor/CKEditorWrapper";
import { useToast } from "@/context/ToastContext";
import { LabelNode, LabelStatus, labelDataBankService, LocalizedText } from "@/services/labelDataBank.service";

type FlatNode = LabelNode & { depth: number };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function flattenTree(nodes: LabelNode[], collapsed: Set<string>, depth = 0): FlatNode[] {
  return nodes.flatMap((node) => [
    { ...node, depth },
    ...(collapsed.has(node.id) ? [] : flattenTree(node.children || [], collapsed, depth + 1)),
  ]);
}

function collectLabelIds(nodes: LabelNode[]): string[] {
  return nodes.flatMap((node) => [
    node.labelId,
    ...collectLabelIds(node.children || []),
  ]);
}

function findNode(nodes: LabelNode[], id: string): LabelNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNode(node.children || [], id);
    if (child) return child;
  }
  return null;
}

function stripHtml(value: string) {
  let output = "";
  let insideTag = false;
  let lastWasSpace = false;

  for (const char of value.replaceAll("&nbsp;", " ")) {
    if (char === "<") {
      insideTag = true;
      if (!lastWasSpace) {
        output += " ";
        lastWasSpace = true;
      }
      continue;
    }

    if (char === ">") {
      insideTag = false;
      continue;
    }

    if (insideTag) continue;

    const isWhitespace = char.trim() === "";
    if (isWhitespace) {
      if (!lastWasSpace) {
        output += " ";
        lastWasSpace = true;
      }
      continue;
    }

    output += char;
    lastWasSpace = false;
  }

  return output.trim();
}

function textPreview(value?: string | null) {
  const text = stripHtml(value || "");
  return text || "-";
}

function normalizeParagraphsToSpans(value: string) {
  let output = "";
  let index = 0;

  while (index < value.length) {
    if (value[index] !== "<") {
      output += value[index];
      index += 1;
      continue;
    }

    const end = value.indexOf(">", index + 1);
    if (end === -1) {
      output += value.slice(index);
      break;
    }

    const tag = value.slice(index + 1, end).trim().toLowerCase();
    if (tag === "p" || tag.startsWith("p ")) {
      output += "<span>";
    } else if (tag === "/p") {
      output += "</span>";
    } else {
      output += value.slice(index, end + 1);
    }

    index = end + 1;
  }

  return output;
}

function toLocalized(valueId: string, valueEn: string): LocalizedText {
  return {
    id: normalizeParagraphsToSpans(valueId.trim()),
    en: normalizeParagraphsToSpans(valueEn.trim()),
  };
}

function displayLabel(node: LabelNode) {
  return node.labelId.split(".").pop() || node.labelId;
}

function labelIdInputValue(node?: LabelNode | null) {
  if (!node) return "";
  return node.labelId.split(".").pop() || node.labelId;
}

function StatusBadge({ status }: { status: LabelStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${status === "ACTIVE" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
      {status === "ACTIVE" ? "Active" : "Inactive"}
    </span>
  );
}

function LabelModal({
  node,
  parentOptions,
  defaultParentId,
  onClose,
  onSaved,
}: {
  node?: LabelNode | null;
  parentOptions: FlatNode[];
  defaultParentId?: string | null;
  onClose: () => void;
  onSaved: (data: { parentId?: string | null; labelId?: string; values: LocalizedText; status: LabelStatus }) => Promise<void>;
}) {
  const [labelId, setLabelId] = useState(labelIdInputValue(node));
  const [valueId, setValueId] = useState(node?.values?.id || node?.labelName?.id || "");
  const [valueEn, setValueEn] = useState(node?.values?.en || node?.labelName?.en || "");
  const [parentId, setParentId] = useState<string>(node?.parentId || defaultParentId || "");
  const [status, setStatus] = useState<LabelStatus>(node?.status || "ACTIVE");
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!stripHtml(valueId) || !stripHtml(valueEn)) return;
    setSaving(true);
    try {
      await onSaved({
        parentId: parentId || null,
        labelId: labelId.trim(),
        values: toLocalized(valueId, valueEn),
        status,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{node ? "Edit Label" : "Create Label"}</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={submit} className="space-y-4 p-5">
          {!node && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Parent</label>
              <select value={parentId} onChange={(event) => setParentId(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
                <option value="">Root level</option>
                {parentOptions.map((option) => (
                  <option key={option.id} value={option.id}>{"- ".repeat(option.depth)}{option.labelId}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Label ID</label>
            <input
              value={labelId}
              onChange={(event) => setLabelId(event.target.value)}
              placeholder="Auto generate if empty"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Gunakan format: section.subsection.key</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <CKEditorWrapper
                label="value_id"
                value={valueId}
                onChange={setValueId}
                minHeight="180px"
                placeholder="Masukkan value bahasa Indonesia"
                inlineOnly
                outputAsSpan
              />
            </div>
            <div>
              <CKEditorWrapper
                label="value_en"
                value={valueEn}
                onChange={setValueEn}
                minHeight="180px"
                placeholder="Enter English value"
                inlineOnly
                outputAsSpan
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value as LabelStatus)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cancel</button>
            <button disabled={saving} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SortableRow({
  node,
  hasChildren,
  collapsed,
  onToggle,
  onAddChild,
  onView,
  onEdit,
  onDelete,
}: {
  node: FlatNode;
  hasChildren: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onAddChild: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: node.id });

  return (
    <tr ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 ${isDragging ? "opacity-60" : ""}`}>
      <td className="min-w-64 px-4 py-3">
        <div className="flex items-center gap-2" style={{ paddingLeft: node.depth * 24 }}>
          <button {...attributes} {...listeners} className="cursor-grab rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800" title="Drag">
            <GripVertical className="h-4 w-4" />
          </button>
          <button onClick={onToggle} disabled={!hasChildren} className="rounded p-1 text-gray-500 disabled:opacity-20" title="Collapse">
            {hasChildren && collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <span className="font-mono text-xs font-medium text-gray-900 dark:text-white">{displayLabel(node)}</span>
        </div>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{node.labelId}</td>
      <td className="max-w-56 px-4 py-3 text-gray-600 dark:text-gray-300">
        <span className="line-clamp-2">{textPreview(node.values?.id)}</span>
      </td>
      <td className="max-w-56 px-4 py-3 text-gray-600 dark:text-gray-300">
        <span className="line-clamp-2">{textPreview(node.values?.en)}</span>
      </td>
      <td className="px-4 py-3 text-gray-500"><div>{node.createdBy || "-"}</div><div className="text-xs">{formatDate(node.createdAt)}</div></td>
      <td className="px-4 py-3 text-gray-500"><div>{node.updatedBy || "-"}</div><div className="text-xs">{formatDate(node.updatedAt)}</div></td>
      <td className="px-4 py-3"><StatusBadge status={node.status} /></td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button onClick={onView} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:hover:bg-gray-800" title="View"><Eye className="h-4 w-4" /></button>
          <button onClick={onAddChild} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:hover:bg-gray-800" title="Add child"><Plus className="h-4 w-4" /></button>
          <button onClick={onEdit} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-800" title="Edit"><Edit className="h-4 w-4" /></button>
          <button onClick={onDelete} className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:hover:bg-gray-800" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      </td>
    </tr>
  );
}

export default function LabelTreePage() {
  const toast = useToast();
  const params = useParams<{ parent: string }>();
  const parent = decodeURIComponent(params.parent);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const [groupName, setGroupName] = useState(parent);
  const [tree, setTree] = useState<LabelNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [modalNode, setModalNode] = useState<LabelNode | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewing, setViewing] = useState<LabelNode | null>(null);

  const flatNodes = useMemo(() => flattenTree(tree, collapsed), [tree, collapsed]);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    try {
      const result = await labelDataBankService.getTree(parent);
      setTree(result.data.tree || []);
      setGroupName(result.data.group.parentName);
    } catch (error: any) {
      toast.error(error.message || "Failed to load label tree");
    } finally {
      setLoading(false);
    }
  }, [parent, toast]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  function toggleCollapsed(id: string) {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function saveLabel(data: { parentId?: string | null; labelId?: string; values: LocalizedText; status: LabelStatus }) {
    try {
      if (modalNode) await labelDataBankService.updateLabel(parent, modalNode.id, data);
      else await labelDataBankService.createLabel(parent, data);
      toast.success(modalNode ? "Label updated" : "Label created");
      setModalOpen(false);
      setModalNode(null);
      setDefaultParentId(null);
      await fetchTree();
    } catch (error: any) {
      toast.error(error.message || "Failed to save label");
      throw error;
    }
  }

  async function deleteLabel(node: LabelNode) {
    if (!window.confirm("Hapus label ini? Jika parent dihapus, semua child ikut terhapus.")) return;
    try {
      await labelDataBankService.deleteLabel(parent, node.id);
      toast.success("Label deleted");
      await fetchTree();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete label");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    if (!window.confirm("Perubahan struktur akan mengubah label_id, lanjutkan?")) return;

    const activeId = String(event.active.id);
    const overId = String(event.over.id);
    const active = findNode(tree, activeId);
    const over = findNode(tree, overId);
    if (!active || !over) return;

    const targetParentId = event.delta.x > 32 ? over.id : event.delta.x < -32 ? over.parentId || null : over.parentId || null;
    const siblings = flatNodes.filter((item) => (item.parentId || null) === targetParentId && item.id !== activeId);
    const overIndex = siblings.findIndex((item) => item.id === overId);
    const position = overIndex >= 0 ? overIndex : siblings.length;

    try {
      const result = await labelDataBankService.moveLabel(parent, activeId, { parentId: targetParentId, position });
      setTree(result.data.tree || []);
      toast.success("Label structure updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to move label");
    }
  }

  async function copyLabelList() {
    const labelIds = collectLabelIds(tree);
    if (labelIds.length === 0) {
      toast.error("No labels to copy");
      return;
    }

    const text = labelIds.map((labelId) => `"${labelId}"`).join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast.success(`Copied ${labelIds.length} label ID(s)`);
    } catch {
      toast.error("Failed to copy label list");
    }
  }

  return (
    <div className="space-y-6">
      <PageBreadCrumb pageTitle={`Label Tree: ${groupName}`} />
      <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-900">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/data/label" className="text-sm text-brand-600 hover:underline">Back to parent labels</Link>
            <h1 className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{groupName}</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Use drag to reorder. Drag slightly right over a row to nest under it, or left to move up one level.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLabelList}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              title="Copy label list"
            >
              <Code2 className="h-4 w-4" />
              Copy Label List
            </button>
            <button onClick={() => { setModalNode(null); setDefaultParentId(null); setModalOpen(true); }} className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              <Plus className="h-4 w-4" />
              Add Label
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={flatNodes.map((node) => node.id)} strategy={verticalListSortingStrategy}>
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3 font-medium">Label</th>
                    <th className="px-4 py-3 font-medium">Label ID</th>
                    <th className="px-4 py-3 font-medium">Value ID</th>
                    <th className="px-4 py-3 font-medium">Value EN</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">Loading...</td></tr>
                  ) : flatNodes.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-gray-500">No labels yet</td></tr>
                  ) : (
                    flatNodes.map((node) => (
                      <SortableRow
                        key={node.id}
                        node={node}
                        hasChildren={(node.children || []).length > 0}
                        collapsed={collapsed.has(node.id)}
                        onToggle={() => toggleCollapsed(node.id)}
                        onAddChild={() => { setModalNode(null); setDefaultParentId(node.id); setModalOpen(true); }}
                        onView={() => setViewing(node)}
                        onEdit={() => { setModalNode(node); setDefaultParentId(node.parentId || null); setModalOpen(true); }}
                        onDelete={() => deleteLabel(node)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {modalOpen && (
        <LabelModal
          node={modalNode}
          defaultParentId={defaultParentId}
          parentOptions={flatNodes}
          onClose={() => { setModalOpen(false); setModalNode(null); setDefaultParentId(null); }}
          onSaved={saveLabel}
        />
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{viewing.labelId}</h2>
              <button onClick={() => setViewing(null)} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" title="Close"><X className="h-4 w-4" /></button>
            </div>
            <pre className="max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">{JSON.stringify({ label_id: viewing.labelId, value_id: viewing.values?.id || "", value_en: viewing.values?.en || "", status: viewing.status }, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
