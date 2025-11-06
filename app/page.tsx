 "use client";

import { useMemo, useState } from "react";
import { initialProducts } from "../data/products";
import type { CartItem, Product, SaleRecord } from "../types";
import { InventoryTable } from "../components/InventoryTable";
import { CartPanel } from "../components/CartPanel";
import { SalesHistory } from "../components/SalesHistory";
import { RestockPanel } from "../components/RestockPanel";
import { OverviewStats } from "../components/OverviewStats";

const TAX_RATE = 0.07;

type Alert = {
  type: "success" | "error" | "info";
  message: string;
};

export default function HomePage() {
  const [inventory, setInventory] = useState(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [alert, setAlert] = useState<Alert | null>(null);

  const cartWithProduct = useMemo(() => {
    return cart
      .map((item) => {
        const product = inventory.find((p) => p.id === item.productId);
        if (!product) return null;
        return { ...item, product };
      })
      .filter(Boolean) as Array<CartItem & { product: Product }>;
  }, [cart, inventory]);

  const showAlert = (newAlert: Alert) => {
    setAlert(newAlert);
    setTimeout(() => setAlert(null), 3500);
  };

  const handleAddToCart = ({
    product,
    quantity,
    dosage,
    notes
  }: {
    product: Product;
    quantity: number;
    dosage?: string;
    notes?: string;
  }) => {
    if (quantity <= 0) {
      showAlert({ type: "error", message: "Quantity must be at least 1." });
      return;
    }
    const currentlyInCart =
      cart.find((item) => item.productId === product.id)?.quantity ?? 0;
    if (currentlyInCart + quantity > product.stock) {
      showAlert({
        type: "error",
        message: `Only ${product.stock - currentlyInCart} units available for ${product.name}.`
      });
      return;
    }

    setCart((existing) => {
      const already = existing.find((item) => item.productId === product.id);
      if (already) {
        return existing.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: Math.min(product.stock, item.quantity + quantity),
                dosage: dosage ?? item.dosage,
                notes: notes ?? item.notes
              }
            : item
        );
      }
      return [
        ...existing,
        {
          productId: product.id,
          quantity,
          dosage,
          notes
        }
      ];
    });

    showAlert({
      type: "success",
      message: `${product.name} added to the cart.`
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const product = inventory.find((p) => p.id === productId);
    if (!product) return;
    if (quantity < 1) quantity = 1;
    if (quantity > product.stock) {
      showAlert({
        type: "error",
        message: `Cannot exceed stock level of ${product.stock}.`
      });
      quantity = product.stock;
    }
    setCart((existing) =>
      existing.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((existing) => existing.filter((item) => item.productId !== productId));
  };

  const handleCheckout = ({
    customerName,
    prescriptionNumber,
    paymentMethod,
    notes
  }: {
    customerName: string;
    prescriptionNumber?: string;
    paymentMethod: SaleRecord["paymentMethod"];
    notes?: string;
  }) => {
    if (cart.length === 0) return;

    const requiresPrescription = cartWithProduct.some(
      (item) => item.product.requiresPrescription
    );
    if (requiresPrescription && !prescriptionNumber) {
      showAlert({
        type: "error",
        message: "Prescription number required for controlled medications."
      });
      return;
    }

    // Validate stock levels before committing sale
    const stockIssues: string[] = [];
    cartWithProduct.forEach((item) => {
      if (item.quantity > item.product.stock) {
        stockIssues.push(item.product.name);
      }
    });
    if (stockIssues.length) {
      showAlert({
        type: "error",
        message: `Insufficient stock for: ${stockIssues.join(", ")}`
      });
      return;
    }

    const subtotal = cartWithProduct.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    const saleId = `${Date.now()}`;

    const newSale: SaleRecord = {
      id: saleId,
      soldAt: new Date().toISOString(),
      customerName,
      prescriptionNumber,
      paymentMethod,
      notes,
      items: cartWithProduct.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        dosage: item.dosage,
        notes: item.notes,
        unitPrice: item.product.price,
        productName: item.product.name
      })),
      subtotal,
      tax,
      total
    };

    setSales((existing) => [newSale, ...existing]);
    setInventory((existing) =>
      existing.map((product) => {
        const cartItem = cart.find((item) => item.productId === product.id);
        if (!cartItem) return product;
        return {
          ...product,
          stock: product.stock - cartItem.quantity
        };
      })
    );
    setCart([]);

    showAlert({
      type: "success",
      message: `Sale completed. Receipt #${saleId}`
    });
  };

  const handleRestock = (productId: string, quantity: number) => {
    setInventory((existing) =>
      existing.map((product) =>
        product.id === productId
          ? { ...product, stock: product.stock + quantity }
          : product
      )
    );
    const product = inventory.find((item) => item.id === productId);
    showAlert({
      type: "info",
      message: `Restocked ${quantity} units of ${product?.name ?? "item"}.`
    });
  };

  return (
    <main className="grid" style={{ gap: "1.8rem" }}>
      <header style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
        <h1>PharmaPOS Control Center</h1>
        <p className="muted">
          Manage prescriptions, retail sales, and inventory in one streamlined workspace.
        </p>
        {alert && (
          <div
            style={{
              padding: "0.85rem",
              borderRadius: "0.85rem",
              border: `1px solid ${
                alert.type === "error"
                  ? "rgba(239,68,68,0.35)"
                  : alert.type === "success"
                  ? "rgba(34,197,94,0.35)"
                  : "rgba(59,130,246,0.35)"
              }`,
              background:
                alert.type === "error"
                  ? "rgba(254,226,226,0.65)"
                  : alert.type === "success"
                  ? "rgba(220,252,231,0.65)"
                  : "rgba(219,234,254,0.65)",
              color:
                alert.type === "error"
                  ? "#991b1b"
                  : alert.type === "success"
                  ? "#047857"
                  : "#1d4ed8"
            }}
          >
            {alert.message}
          </div>
        )}
      </header>

      <OverviewStats inventory={inventory} sales={sales} />

      <section className="grid-two">
        <InventoryTable products={inventory} onAddToCart={handleAddToCart} />
        <CartPanel
          cart={cartWithProduct}
          taxRate={TAX_RATE}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={handleCheckout}
        />
      </section>

      <section className="grid-two">
        <SalesHistory sales={sales} />
        <RestockPanel products={inventory} onRestock={handleRestock} />
      </section>
    </main>
  );
}
