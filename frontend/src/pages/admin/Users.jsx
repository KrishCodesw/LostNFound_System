import { useEffect, useState } from "react";
import { usersApi } from "@/lib/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    usersApi.getAll()
      .then((data) => {
        if (!cancelled) {
          setUsers(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        // If endpoint not available, show empty state with message
        if (!cancelled) {
          setUsers([]);
          setLoading(false);
          // console.warn("Users endpoint not available:", err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Users</h1>
      {users.length === 0 ? (
        <p className="text-muted-foreground">
          No users data available. The backend may not expose a /users endpoint.
        </p>
      ) : (
        <div className="mt-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-muted">
                  <td className="p-3 text-sm">{user.id}</td>
                  <td className="p-3 text-sm">{user.name ?? user.username ?? "N/A"}</td>
                  <td className="p-3 text-sm">{user.email ?? "N/A"}</td>
                  <td className="p-3 text-sm">{user.role ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
