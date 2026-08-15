import { useState } from "react";
import { Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { inventoryApi } from "@/lib/api";
import { cn } from "@/lib/utils";

let rowKeySeq = 0;
function emptyRow() {
  rowKeySeq += 1;
  return {
    key: rowKeySeq,
    name: "",
    categoryId: "",
    quantity: "1",
    location: "",
    description: "",
  };
}

/**
 * Lets an admin key in a table of stock counts (e.g. 20 calculators, 30 paper holders)
 * and submit them all in one bulk request. Rows with the same name+category+location
 * as an existing inventory item get their quantity merged in server-side rather than duplicated.
 */
export function BulkUploadPanel({ categories, onUploaded }) {
  const [rows, setRows] = useState([emptyRow(), emptyRow(), emptyRow()]);
  const [mergeDuplicates, setMergeDuplicates] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  function updateRow(key, field, value) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()]);
  }

  function removeRow(key) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
  }

  function addManyRows(count) {
    setRows((prev) => [...prev, ...Array.from({ length: count }, () => emptyRow())]);
  }

  const validRows = rows.filter((r) => r.name.trim() && r.categoryId && r.quantity !== "");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSummary(null);

    if (validRows.length === 0) {
      setError("Add at least one row with a name, category and quantity.");
      return;
    }

    const invalidQuantity = validRows.find(
      (r) => Number.isNaN(Number(r.quantity)) || Number(r.quantity) < 0
    );
    if (invalidQuantity) {
      setError(`"${invalidQuantity.name}" has an invalid quantity.`);
      return;
    }

    const payload = validRows.map((r) => ({
      name: r.name.trim(),
      categoryId: Number(r.categoryId),
      quantity: Number(r.quantity),
      location: r.location.trim() || null,
      description: r.description.trim() || null,
    }));

    setSubmitting(true);
    try {
      const result = await inventoryApi.bulkUpload(payload, mergeDuplicates);
      setSummary(result);
      setRows([emptyRow(), emptyRow(), emptyRow()]);
      onUploaded?.(result);
    } catch (err) {
      setError(err.message || "Bulk upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-admin-line bg-admin-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-admin-line px-4 py-3">
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.15em] text-white">
            Bulk Add Stock
          </h2>
          <p className="mt-1 text-xs text-white/40">
            Log everything currently sitting at the desk in one go — e.g. 20 calculators, 30 paper holders.
          </p>
        </div>
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-white/60">
          <input
            type="checkbox"
            checked={mergeDuplicates}
            onChange={(e) => setMergeDuplicates(e.target.checked)}
            className="h-3.5 w-3.5 accent-admin-brass"
          />
          Merge into existing counts
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-admin-line text-[10.5px] uppercase tracking-[0.15em] text-white/40">
              <th className="w-8 px-3 py-2 font-mono font-normal">#</th>
              <th className="px-3 py-2 font-mono font-normal">Item Name</th>
              <th className="px-3 py-2 font-mono font-normal">Category</th>
              <th className="w-28 px-3 py-2 font-mono font-normal">Count</th>
              <th className="px-3 py-2 font-mono font-normal">Location</th>
              <th className="px-3 py-2 font-mono font-normal">Notes</th>
              <th className="w-10 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.key} className="border-b border-admin-line/60">
                <td className="px-3 py-2 font-mono text-white/30">{idx + 1}</td>
                <td className="px-3 py-2">
                  <Input
                    value={row.name}
                    onChange={(e) => updateRow(row.key, "name", e.target.value)}
                    placeholder="e.g. Scientific Calculator"
                    maxLength={150}
                    className="h-9 bg-admin-bg text-white border-admin-line focus:border-admin-brass placeholder:text-white/25"
                  />
                </td>
                <td className="px-3 py-2">
                  <Select
                    value={row.categoryId}
                    onChange={(e) => updateRow(row.key, "categoryId", e.target.value)}
                    className="h-9 bg-admin-bg text-white border-admin-line"
                  >
                    <option value="">Select…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </td>
                <td className="px-3 py-2">
                  <Input
                    type="number"
                    min="0"
                    max="100000"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, "quantity", e.target.value)}
                    className="h-9 bg-admin-bg text-white border-admin-line focus:border-admin-brass"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.location}
                    onChange={(e) => updateRow(row.key, "location", e.target.value)}
                    placeholder="Shelf / bin"
                    maxLength={150}
                    className="h-9 bg-admin-bg text-white border-admin-line focus:border-admin-brass placeholder:text-white/25"
                  />
                </td>
                <td className="px-3 py-2">
                  <Input
                    value={row.description}
                    onChange={(e) => updateRow(row.key, "description", e.target.value)}
                    placeholder="Optional"
                    maxLength={500}
                    className="h-9 bg-admin-bg text-white border-admin-line focus:border-admin-brass placeholder:text-white/25"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length <= 1}
                    className="text-white/30 hover:text-white disabled:opacity-30"
                    aria-label="Remove row"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-admin-line px-4 py-3">
        <div className="flex gap-2">
          <Button type="button" variant="admin-outline" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" /> Add Row
          </Button>
          <Button type="button" variant="admin-outline" size="sm" onClick={() => addManyRows(5)}>
            <Plus className="h-3.5 w-3.5" /> Add 5 Rows
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-white/40">
            {validRows.length} row{validRows.length === 1 ? "" : "s"} ready
          </span>
          <Button type="submit" variant="admin" size="sm" disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UploadCloud className="h-3.5 w-3.5" />
            )}
            Upload
          </Button>
        </div>
      </div>

      {error && (
        <p className="border-t border-admin-line px-4 py-3 font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      {summary && (
        <p
          className={cn(
            "border-t border-admin-line px-4 py-3 font-mono text-xs text-admin-brass"
          )}
        >
          Uploaded {summary.totalRowsProcessed} row(s) — {summary.createdCount} new item(s) created,{" "}
          {summary.mergedCount} merged into existing counts.
        </p>
      )}
    </form>
  );
}
