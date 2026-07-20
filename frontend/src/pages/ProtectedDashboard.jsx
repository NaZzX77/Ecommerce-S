import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { getCustomers } from "../services/customerApi.js";
import { getLowStockProducts } from "../services/inventoryApi.js";
import { getProducts } from "../services/productApi.js";
import { getSales } from "../services/saleApi.js";
import { getSuppliers } from "../services/supplierApi.js";


function customerName(sale) {
  if (!sale.customer) {
    return `Customer #${sale.customer_id}`;
  }

  return `${sale.customer.first_name} ${sale.customer.last_name}`;
}


export default function ProtectedDashboard() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [sales, setSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const totalRevenue = useMemo(
    () => sales.reduce((total, sale) => total + Number(sale.grand_total), 0),
    [sales],
  );

  const recentSales = useMemo(() => sales.slice(0, 5), [sales]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setError("");
    setIsLoading(true);

    try {
      const [productData, customerData, supplierData, saleData, lowStockData] = await Promise.all([
        getProducts(),
        getCustomers(),
        getSuppliers(),
        getSales(),
        getLowStockProducts(10),
      ]);

      setProducts(productData);
      setCustomers(customerData);
      setSuppliers(supplierData);
      setSales(saleData);
      setLowStockProducts(lowStockData);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  const kpis = [
    { label: "Products", value: products.length, to: "/products" },
    { label: "Customers", value: customers.length, to: "/customers" },
    { label: "Suppliers", value: suppliers.length, to: "/suppliers" },
    { label: "Sales", value: sales.length, to: "/sales" },
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, to: "/sales" },
    { label: "Low Stock", value: lowStockProducts.length, to: "/inventory" },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-600">Dashboard</p>
            <h2 className="text-xl font-semibold text-ink-900">Welcome back, {user?.full_name}</h2>
            <p className="mt-1 text-sm text-ink-600">A quick snapshot of your store activity.</p>
          </div>
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={loadDashboard} type="button">
            Refresh
          </button>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
      </div>

      {isLoading ? (
        <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-ink-600 shadow-sm">
          Loading dashboard...
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            {kpis.map((kpi) => (
              <Link className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-brand-600" key={kpi.label} to={kpi.to}>
                <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-semibold text-ink-900">{kpi.value}</p>
              </Link>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-600">Inventory Watch</p>
                  <h3 className="text-base font-semibold text-ink-900">Low stock products</h3>
                </div>
                <Link className="text-sm font-medium text-brand-600 hover:text-brand-700" to="/inventory">
                  View inventory
                </Link>
              </div>

              {lowStockProducts.length === 0 ? (
                <p className="mt-5 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
                  No products are at or below the low-stock threshold.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-medium">Product</th>
                        <th className="py-3 pr-4 font-medium">SKU</th>
                        <th className="py-3 pr-4 font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockProducts.slice(0, 5).map((product) => (
                        <tr className="border-b border-slate-100" key={product.id}>
                          <td className="py-3 pr-4 font-medium text-ink-900">{product.name}</td>
                          <td className="py-3 pr-4 text-slate-600">{product.sku}</td>
                          <td className="py-3 pr-4 text-slate-600">{product.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-brand-600">Sales</p>
                  <h3 className="text-base font-semibold text-ink-900">Recent sales</h3>
                </div>
                <Link className="text-sm font-medium text-brand-600 hover:text-brand-700" to="/sales/new">
                  Create sale
                </Link>
              </div>

              {recentSales.length === 0 ? (
                <p className="mt-5 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
                  No sales yet. Create a sale to see recent activity here.
                </p>
              ) : (
                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 pr-4 font-medium">Sale</th>
                        <th className="py-3 pr-4 font-medium">Customer</th>
                        <th className="py-3 pr-4 font-medium">Total</th>
                        <th className="py-3 pr-4 font-medium">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSales.map((sale) => (
                        <tr className="border-b border-slate-100" key={sale.id}>
                          <td className="py-3 pr-4 font-medium text-ink-900">#{sale.id}</td>
                          <td className="py-3 pr-4 text-slate-600">{customerName(sale)}</td>
                          <td className="py-3 pr-4 text-slate-600">${Number(sale.grand_total).toFixed(2)}</td>
                          <td className="py-3 pr-4">
                            <Link className="font-medium text-brand-600 hover:text-brand-700" to={`/sales/${sale.id}`}>
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
