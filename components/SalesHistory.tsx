import type { SaleRecord } from "../types";
import { format } from "date-fns";

interface SalesHistoryProps {
  sales: SaleRecord[];
}

export function SalesHistory({ sales }: SalesHistoryProps) {
  return (
    <div className="card" style={{ display: "grid", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Recent Sales</h2>
        <span className="muted">{sales.length} total</span>
      </div>
      {sales.length === 0 ? (
        <p className="muted">No completed sales yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {sales.slice(0, 6).map((sale) => (
            <ReceiptPreview key={sale.id} sale={sale} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReceiptPreview({ sale }: { sale: SaleRecord }) {
  return (
    <div className="receipt">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>PharmaPOS</strong>
        <span>{format(new Date(sale.soldAt), "MMM d yyyy HH:mm")}</span>
      </div>
      <div style={{ marginTop: "0.4rem" }}>
        Sale #{sale.id} • {sale.paymentMethod}
      </div>
      <div>Customer: {sale.customerName}</div>
      {sale.prescriptionNumber && (
        <div>Rx #: {sale.prescriptionNumber}</div>
      )}
      {sale.notes && <div>Note: {sale.notes}</div>}
      {sale.items.map((item) => (
        <div key={item.productId}>
          {item.productName.substring(0, 24).padEnd(24, " ")} x{item.quantity.toString().padStart(2, " ")} @ $
          {item.unitPrice.toFixed(2)}
        </div>
      ))}
      <div style={{ marginTop: "0.4rem" }}>
        SUBTOTAL: ${sale.subtotal.toFixed(2)}
      </div>
      <div>TAX: ${sale.tax.toFixed(2)}</div>
      <div>TOTAL: ${sale.total.toFixed(2)}</div>
      {sale.prescriptionNumber && (
        <div style={{ marginTop: "0.4rem" }}>Dispense responsibly.</div>
      )}
    </div>
  );
}
