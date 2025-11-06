import type { Product, SaleRecord } from "../types";

interface OverviewStatsProps {
  inventory: Product[];
  sales: SaleRecord[];
}

export function OverviewStats({ inventory, sales }: OverviewStatsProps) {
  const inventoryValue = inventory.reduce(
    (sum, product) => sum + product.price * product.stock,
    0
  );

  const today = new Date().toDateString();
  const todaySales = sales.filter(
    (sale) => new Date(sale.soldAt).toDateString() === today
  );
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = inventory.filter(
    (product) => product.stock <= product.reorderPoint
  ).length;

  return (
    <div className="grid-two">
      <StatCard
        label="Inventory Value"
        value={`$${inventoryValue.toFixed(2)}`}
        description="Retail value of on-hand stock"
      />
      <StatCard
        label="Today's Revenue"
        value={`$${todayRevenue.toFixed(2)}`}
        description={`${todaySales.length} sale(s)`}
      />
      <StatCard
        label="Low Stock Items"
        value={lowStock.toString()}
        description="Needs restock soon"
      />
      <StatCard
        label="Products Tracked"
        value={inventory.length.toString()}
        description="Active SKUs in catalog"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  description
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.45rem",
        background:
          "linear-gradient(160deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.12) 100%)"
      }}
    >
      <span className="muted" style={{ textTransform: "uppercase", fontSize: "0.75rem" }}>
        {label}
      </span>
      <strong style={{ fontSize: "1.65rem" }}>{value}</strong>
      <span className="muted">{description}</span>
    </div>
  );
}
