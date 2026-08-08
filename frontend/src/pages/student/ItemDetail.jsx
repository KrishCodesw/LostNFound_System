import { useParams } from "react-router-dom";

export default function ItemDetailPage() {
  const { id } = useParams();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="font-mono text-xs text-ink/40">Item #{id}</p>
      <h1 className="mt-1 font-display text-2xl text-ink">Item detail</h1>
      <p className="mt-2 text-sm text-ink/50">
        Detail view + claim submission form ships alongside the report form.
      </p>
    </div>
  );
}
