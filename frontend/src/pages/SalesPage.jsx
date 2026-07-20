import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSales } from "../services/saleApi.js";


function customerName(sale) {
  if (!sale.customer) {
    return `Customer #${sale.customer_id}`;
  }

  return `${sale.customer.first_name} ${sale.customer.last_name}`;
}


export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    setError("");
    setIsLoading(true);

    try {
      const data = await getSales();
      setSales(data);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600">Sales Management</p>
          <h2 className="text-lg font-semibold text-ink-900">Sales history</h2>
        </div>
        <div className="flex gap-3">
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={loadSales} type="button">
            Refresh
          </button>
          <Link className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" to="/sales/new">
            Create sale
          </Link>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}

      {isLoading ? (
        <p className="mt-6 text-sm text-ink-600">Loading sales...</p>
      ) : sales.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
          No sales recorded yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Sale</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Items</th>
                <th className="py-3 pr-4 font-medium">Total</th>
                <th className="py-3 pr-4 font-medium">Created</th>
                <th className="py-3 pr-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr className="border-b border-slate-100" key={sale.id}>
                  <td className="py-3 pr-4 font-medium text-ink-900">#{sale.id}</td>
                  <td className="py-3 pr-4 text-slate-600">{customerName(sale)}</td>
                  <td className="py-3 pr-4 text-slate-600">{sale.items.length}</td>
                  <td className="py-3 pr-4 text-slate-600">${Number(sale.grand_total).toFixed(2)}</td>
                  <td className="py-3 pr-4 text-slate-600">{new Date(sale.created_at).toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <Link className="font-medium text-brand-600 hover:text-brand-700" to={`/sales/${sale.id}`}>
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
