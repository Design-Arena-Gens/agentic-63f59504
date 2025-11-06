import { useState } from "react";
import type { Product } from "../types";

interface RestockPanelProps {
  products: Product[];
  onRestock: (productId: string, quantity: number) => void;
}

export function RestockPanel({ products, onRestock }: RestockPanelProps) {
  const [selected, setSelected] = useState<string>(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState(10);

  const handleSubmit = () => {
    if (!selected) return;
    if (quantity <= 0) return;
    onRestock(selected, quantity);
    setQuantity(10);
  };

  return (
    <div className="card" style={{ display: "grid", gap: "0.85rem" }}>
      <h2>Restock Inventory</h2>
      <select
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
      >
        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name} (Current: {product.stock})
          </option>
        ))}
      </select>
      <input
        type="number"
        min={1}
        max={1000}
        value={quantity}
        onChange={(event) => setQuantity(Number(event.target.value))}
      />
      <button className="button-secondary" onClick={handleSubmit}>
        Add Stock
      </button>
    </div>
  );
}
