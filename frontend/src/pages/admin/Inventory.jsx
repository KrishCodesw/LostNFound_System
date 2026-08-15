import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { categoriesApi, inventoryApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BulkUploadPanel } from "@/components/admin/BulkUploadPanel";
import { InventoryTable } from "@/components/admin/InventoryTable";

const PAGE_SIZE = 50;

export default function AdminInventoryPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await inventoryApi.list({
        search,
        categoryId: categoryFilter,
        page,
        size: PAGE_SIZE,
      });
      setItems(result?.content ?? []);
      setTotalElements(result?.totalElements ?? (result?.content?.length || 0));
    } catch (err) {
      setError(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  function handleItemChanged(updated) {
    setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
  }

  function handleItemDeleted(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setTotalElements((n) => Math.max(0, n - 1));
  }

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-admin-brass">
          Desk Stock
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-white">Inventory</h1>
        <p className="mt-1 text-sm text-white/45">
          Bulk-log items already held at the Lost &amp; Found desk and keep their counts current.
        </p>
      </div>

      {categories.length === 0 && !loading ? (
        <div className="border border-admin-line bg-admin-panel p-6 font-mono text-sm text-white/50">
          No categories exist yet. Create a category first (Categories are shared with item
          reporting) before bulk-uploading stock.
        </div>
      ) : (
        <div className="mb-8">
          <BulkUploadPanel categories={categories} onUploaded={loadItems} />
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input
            value={search}
            onChange={(e) => {
              setPage(0);
              setSearch(e.target.value);
            }}
            placeholder="Search inventory by name…"
            className="h-10 bg-admin-panel pl-10 text-white border-admin-line focus:border-admin-brass placeholder:text-white/25"
          />
        </div>
        <Select
          value={categoryFilter}
          onChange={(e) => {
            setPage(0);
            setCategoryFilter(e.target.value);
          }}
          className="h-10 w-56 bg-admin-panel text-white border-admin-line"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <span className="ml-auto font-mono text-xs text-white/40">
          {totalElements} item{totalElements === 1 ? "" : "s"} total
        </span>
      </div>

      {loading ? (
        <div className="border border-admin-line bg-admin-panel p-10 text-center font-mono text-sm text-white/40">
          Loading inventory…
        </div>
      ) : error ? (
        <div className="border border-admin-line bg-admin-panel p-10 text-center font-mono text-sm text-red-400">
          {error}
        </div>
      ) : (
        <>
          <InventoryTable
            items={items}
            categories={categories}
            onItemChanged={handleItemChanged}
            onItemDeleted={handleItemDeleted}
          />

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 font-mono text-xs text-white/50">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="border border-admin-line px-3 py-1.5 uppercase text-white/60 hover:text-white disabled:opacity-30"
              >
                Prev
              </button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="border border-admin-line px-3 py-1.5 uppercase text-white/60 hover:text-white disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
