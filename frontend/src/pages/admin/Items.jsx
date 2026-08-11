import { useEffect, useState } from "react";
import { itemsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AdminItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    itemsApi.list()
      .then((data) => {
        if (!cancelled) {
          setItems(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || "Failed to load items");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item? This cannot be undone.")) return;
    try {
      await itemsApi.deleteItem(id); // we need to add deleteItem to api
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      alert("Failed to delete item: " + err.message);
    }
  };

  if (loading) return <div className="p-8">Loading items...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Items</h1>
        <Button
          variant="outline"
          size="sm"
          // Assuming we have a create item page; we can link to student report page
          asChild
          // we'll just link to /report
          // For simplicity, we'll render a link
        >
          <a href="/report" className="text-hover underline">
            Report New Item
          </a>
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground">No items found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">Title</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Reported By</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t hover:bg-muted">
                <td className="p-3 text-sm">{item.id}</td>
                <td className="p-3 text-sm">{item.title}</td>
                <td className="p-3 text-sm">{item.categoryName}</td>
                <td className="p-3 text-sm">{item.type}</td>
                <td className="p-3 text-sm">{item.status}</td>
                <td className="p-3 text-sm">{item.reporterName ?? item.reporterEmail ?? "Unknown"}</td>
                <td className="p-3 text-sm space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                  {/* View details link */}
                  <a href={`/items/${item.id}`} className="text-xs underline">
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
