import { useMemo, useState } from "react";
import type { Product } from "../types";
import { clsx } from "clsx";

interface InventoryTableProps {
  products: Product[];
  onAddToCart: (payload: {
    product: Product;
    quantity: number;
    dosage?: string;
    notes?: string;
  }) => void;
}

export function InventoryTable({ products, onAddToCart }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All" ? true : product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1rem"
        }}
      >
        <h2>Inventory</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem"
          }}
        >
          <input
            style={{ flex: "1 1 260px" }}
            placeholder="Search by product name or SKU"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            style={{ width: "180px" }}
          >
            <option value="All">All Categories</option>
            <option value="Prescription">Prescription</option>
            <option value="OTC">OTC</option>
            <option value="Wellness">Wellness</option>
            <option value="Medical Supplies">Medical Supplies</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th style={{ minWidth: "220px" }}>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th style={{ width: "210px" }}>Dispense</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <InventoryRow
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
              />
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && (
        <p className="muted" style={{ marginTop: "1rem" }}>
          No products found. Try a different search term.
        </p>
      )}
    </div>
  );
}

function InventoryRow({
  product,
  onAddToCart
}: {
  product: Product;
  onAddToCart: InventoryTableProps["onAddToCart"];
}) {
  const [quantity, setQuantity] = useState(1);
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");

  const stockStatus = useMemo(() => {
    if (product.stock === 0) return { label: "Out of stock", className: "pill-red" };
    if (product.stock <= product.reorderPoint)
      return { label: "Low stock", className: "pill-red" };
    return { label: "In stock", className: "pill-green" };
  }, [product]);

  const limit =
    quantity > product.stock ? product.stock : quantity < 1 ? 1 : quantity;

  const handleAdd = () => {
    onAddToCart({
      product,
      quantity: limit,
      dosage: dosage.trim() || undefined,
      notes: notes.trim() || undefined
    });
    setQuantity(1);
    setDosage("");
    setNotes("");
  };

  return (
    <tr>
      <td>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <strong>{product.name}</strong>
          <span className="muted">{product.description}</span>
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            <span className={clsx("pill", stockStatus.className)}>
              {stockStatus.label}
            </span>
            {product.requiresPrescription && (
              <span className="pill">Rx Required</span>
            )}
          </div>
        </div>
      </td>
      <td>{product.sku}</td>
      <td>
        <span className="tag">{product.category}</span>
      </td>
      <td>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem"
          }}
        >
          <strong>{product.stock}</strong>
          <span className="muted">Reorder at {product.reorderPoint}</span>
        </div>
      </td>
      <td>
        <strong>${product.price.toFixed(2)}</strong>
      </td>
      <td>
        <div
          style={{
            display: "grid",
            gap: "0.35rem",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))"
          }}
        >
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
          />
          <input
            placeholder="Dosage"
            value={dosage}
            onChange={(event) => setDosage(event.target.value)}
          />
          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            style={{
              gridColumn: "span 2",
              resize: "vertical",
              minHeight: "70px"
            }}
          />
          <button
            className="button-primary"
            style={{ gridColumn: "span 2" }}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            Add to Cart
          </button>
        </div>
      </td>
    </tr>
  );
}
