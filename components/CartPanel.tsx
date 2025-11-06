import { useMemo, useState } from "react";
import type { CartItem, PaymentMethod, Product } from "../types";
import { format } from "date-fns";

interface CartPanelProps {
  cart: Array<CartItem & { product: Product }>;
  taxRate: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (payload: {
    customerName: string;
    prescriptionNumber?: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => void;
}

export function CartPanel({
  cart,
  taxRate,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartPanelProps) {
  const [customerName, setCustomerName] = useState("");
  const [prescriptionNumber, setPrescriptionNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [internalNotes, setInternalNotes] = useState("");

  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }, [cart, taxRate]);

  const canCheckout = cart.length > 0 && customerName.trim().length >= 2;

  const handleSubmit = () => {
    if (!canCheckout) {
      return;
    }
    onCheckout({
      customerName: customerName.trim(),
      prescriptionNumber: prescriptionNumber.trim() || undefined,
      paymentMethod,
      notes: internalNotes.trim() || undefined
    });
    setCustomerName("");
    setPrescriptionNumber("");
    setInternalNotes("");
  };

  return (
    <div className="card" style={{ display: "grid", gap: "1rem" }}>
      <header
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h2>Current Sale</h2>
        <span className="muted">
          {format(new Date(), "MMM d, yyyy h:mm a")}
        </span>
      </header>

      <div style={{ display: "grid", gap: "0.75rem" }}>
        {cart.length === 0 ? (
          <p className="muted">Start by adding items to the cart from inventory.</p>
        ) : (
          cart.map((item) => (
            <article
              key={item.productId}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                padding: "0.85rem",
                borderRadius: "0.85rem",
                border: "1px solid #e3e8ff",
                background: "rgba(99, 102, 241, 0.06)"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline"
                }}
              >
                <div style={{ display: "grid", gap: "0.2rem" }}>
                  <strong>{item.product.name}</strong>
                  <span className="muted">{item.product.sku}</span>
                  {item.dosage && (
                    <span className="tag">Dosage: {item.dosage}</span>
                  )}
                  {item.notes && (
                    <span className="muted">Notes: {item.notes}</span>
                  )}
                </div>
                <button
                  className="button-danger"
                  onClick={() => onRemoveItem(item.productId)}
                >
                  Remove
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.65rem",
                  alignItems: "center"
                }}
              >
                <label style={{ fontWeight: 600 }}>
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      onUpdateQuantity(item.productId, Number(event.target.value))
                    }
                    style={{ marginLeft: "0.45rem", width: "90px" }}
                  />
                </label>
                <span className="muted">
                  In stock: {item.product.stock}
                </span>
                <strong style={{ marginLeft: "auto" }}>
                  ${(item.quantity * item.product.price).toFixed(2)}
                </strong>
              </div>
            </article>
          ))
        )}
      </div>

      <section style={{ display: "grid", gap: "0.65rem" }}>
        <h3>Customer Details</h3>
        <input
          placeholder="Customer name"
          value={customerName}
          onChange={(event) => setCustomerName(event.target.value)}
        />
        <input
          placeholder="Prescription # (optional)"
          value={prescriptionNumber}
          onChange={(event) => setPrescriptionNumber(event.target.value)}
        />
        <select
          value={paymentMethod}
          onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
        >
          <option value="Cash">Cash</option>
          <option value="Card">Card</option>
          <option value="Insurance">Insurance Copay</option>
        </select>
        <textarea
          placeholder="Internal notes (will appear on receipt memo)"
          value={internalNotes}
          onChange={(event) => setInternalNotes(event.target.value)}
          style={{ minHeight: "80px", resize: "vertical" }}
        />
      </section>

      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          padding: "0.9rem",
          borderRadius: "0.9rem",
          background: "rgba(79, 70, 229, 0.08)",
          border: "1px solid rgba(79, 70, 229, 0.15)"
        }}
      >
        <SummaryRow label="Subtotal" value={totals.subtotal} />
        <SummaryRow label={`Tax (${(taxRate * 100).toFixed(1)}%)`} value={totals.tax} />
        <SummaryRow label="Total" value={totals.total} bold />
      </section>

      <button
        className="button-primary"
        style={{ padding: "0.8rem", fontSize: "1rem" }}
        onClick={handleSubmit}
        disabled={!canCheckout}
      >
        Complete Sale
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontWeight: bold ? 700 : 500
      }}
    >
      <span>{label}</span>
      <span>${value.toFixed(2)}</span>
    </div>
  );
}
