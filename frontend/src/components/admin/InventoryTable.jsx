import { useState } from "react";
import { Minus, Plus, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { inventoryApi } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";

function QuantityStepper({ item, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(item.quantity));

  async function nudge(delta) {
    if (busy) return;
    if (item.quantity + delta < 0) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await inventoryApi.adjustQuantity(item.id, "DELTA", delta, item.version);
      onChanged(updated);
    } catch (err) {
      setError(err.message || "Failed to update count");
    } finally {
      setBusy(false);
    }
  }

  async function commitSet() {
    const value = Number(draft);
    if (Number.isNaN(value) || value < 0) {
      setError("Enter a valid non-negative number");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await inventoryApi.adjustQuantity(item.id, "SET", value, item.version);
      onChanged(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message || "Failed to update count");
    } finally {
      setBusy(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min="0"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-8 w-20 bg-admin-bg text-white border-admin-line"
        />
        <button
          onClick={commitSet}
          disabled={busy}
          className="flex h-8 w-8 items-center justify-center text-admin-brass hover:opacity-80 disabled:opacity-40"
          aria-label="Save count"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setDraft(String(item.quantity));
            setError(null);
          }}
          className="flex h-8 w-8 items-center justify-center text-white/40 hover:text-white"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => nudge(-1)}
          disabled={busy || item.quantity <= 0}
          className="flex h-7 w-7 items-center justify-center border border-admin-line text-white/70 hover:border-admin-brass hover:text-admin-brass disabled:opacity-30"
          aria-label="Decrease count"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setEditing(true)}
          className="min-w-[2.5rem] px-1 text-center font-mono text-sm text-white hover:text-admin-brass"
          title="Click to set an exact count"
        >
          {busy ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : item.quantity}
        </button>
        <button
          onClick={() => nudge(1)}
          disabled={busy}
          className="flex h-7 w-7 items-center justify-center border border-admin-line text-white/70 hover:border-admin-brass hover:text-admin-brass disabled:opacity-30"
          aria-label="Increase count"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      {error && <p className="mt-1 font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  );
}

function EditRow({ item, categories, onSaved, onCancel }) {
  const [form, setForm] = useState({
    name: item.name,
    categoryId: String(item.categoryId ?? ""),
    quantity: String(item.quantity),
    location: item.location || "",
    description: item.description || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function save() {
    if (!form.name.trim() || !form.categoryId) {
      setError("Name and category are required");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await inventoryApi.update(item.id, {
        name: form.name.trim(),
        categoryId: Number(form.categoryId),
        quantity: Number(form.quantity),
        location: form.location.trim() || null,
        description: form.description.trim() || null,
      });
      onSaved(updated);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr className="border-b border-admin-line/60 bg-admin-bg/60">
      <td colSpan={6} className="px-3 py-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[160px] flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase text-white/40">Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="h-9 bg-admin-panel text-white border-admin-line"
            />
          </div>
          <div className="min-w-[140px]">
            <label className="mb-1 block font-mono text-[10px] uppercase text-white/40">Category</label>
            <Select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="h-9 bg-admin-panel text-white border-admin-line"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-24">
            <label className="mb-1 block font-mono text-[10px] uppercase text-white/40">Count</label>
            <Input
              type="number"
              min="0"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
              className="h-9 bg-admin-panel text-white border-admin-line"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block font-mono text-[10px] uppercase text-white/40">Location</label>
            <Input
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="h-9 bg-admin-panel text-white border-admin-line"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={busy}
              className="flex h-9 items-center gap-1 border border-admin-brass px-3 font-mono text-xs uppercase text-admin-brass hover:bg-admin-brass hover:text-admin-bg disabled:opacity-40"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Save
            </button>
            <button
              onClick={onCancel}
              className="flex h-9 items-center gap-1 border border-admin-line px-3 font-mono text-xs uppercase text-white/60 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        </div>
        {error && <p className="mt-2 font-mono text-xs text-red-400">{error}</p>}
      </td>
    </tr>
  );
}

export function InventoryTable({ items, categories, onItemChanged, onItemDeleted }) {
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(item) {
    if (!window.confirm(`Remove "${item.name}" from inventory? This cannot be undone.`)) return;
    setDeletingId(item.id);
    try {
      await inventoryApi.remove(item.id);
      onItemDeleted(item.id);
    } catch (err) {
      alert(err.message || "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="border border-admin-line bg-admin-panel p-10 text-center font-mono text-sm text-white/40">
        No inventory items match your filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-admin-line">
      <table className="w-full min-w-[840px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-admin-line bg-admin-panel text-[10.5px] uppercase tracking-[0.15em] text-white/40">
            <th className="px-4 py-3 font-mono font-normal">Item</th>
            <th className="px-4 py-3 font-mono font-normal">Category</th>
            <th className="px-4 py-3 font-mono font-normal">Count</th>
            <th className="px-4 py-3 font-mono font-normal">Location</th>
            <th className="px-4 py-3 font-mono font-normal">Updated</th>
            <th className="px-4 py-3 font-mono font-normal text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            editingId === item.id ? (
              <EditRow
                key={item.id}
                item={item}
                categories={categories}
                onSaved={(updated) => {
                  onItemChanged(updated);
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <tr key={item.id} className="border-b border-admin-line/60 hover:bg-admin-panel">
                <td className="px-4 py-3 text-white">
                  {item.name}
                  {item.description && (
                    <p className="mt-0.5 text-xs font-normal text-white/35">{item.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-white/70">{item.categoryName}</td>
                <td className="px-4 py-3">
                  <QuantityStepper item={item} onChanged={onItemChanged} />
                </td>
                <td className="px-4 py-3 text-white/50">{item.location || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/35">
                  {item.updatedAt ? formatRelativeTime(item.updatedAt) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(item.id)}
                      className="flex h-8 w-8 items-center justify-center border border-admin-line text-white/70 hover:border-admin-brass hover:text-admin-brass"
                      aria-label="Edit item"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="flex h-8 w-8 items-center justify-center border border-admin-line text-white/70 hover:border-red-400 hover:text-red-400 disabled:opacity-40"
                      aria-label="Delete item"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
