import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getSale } from "../services/saleApi.js";


function customerName(sale) {
  if (!sale.customer) {
    return `Customer #${sale.customer_id}`;
  }

  return `${sale.customer.first_name} ${sale.customer.last_name}`;
}


export default function SaleDetailsPage() {
  const { saleId } = useParams();
  const [sale, setSale] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadSale = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getSale(saleId);
      setSale(data);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }, [saleId]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  if (isLoading) {
    return <p className="text-sm text-ink-600">Loading sale details...</p>;
  }

  if (error) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-rose-600">{error}</p>
        <Link className="mt-4 inline-block text-sm font-medium text-brand-600 hover:text-brand-700" to="/sales">
          Back to sales
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="printable-invoice rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-600">Invoice</p>
            <h2 className="text-lg font-semibold text-ink-900">Sale #{sale.id}</h2>
          </div>
          <div className="no-print flex gap-3">
            <button
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              onClick={() => window.print()}
              type="button"
            >
              Print
            </button>
            <Link className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-600" to="/sales">
              Back to sales
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Customer</p>
            <p className="mt-1 font-medium text-ink-900">{customerName(sale)}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Created</p>
            <p className="mt-1 font-medium text-ink-900">{new Date(sale.created_at).toLocaleString()}</p>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Grand total</p>
            <p className="mt-1 font-medium text-ink-900">${Number(sale.grand_total).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="printable-invoice rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-ink-900">Items</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4 font-medium">Product</th>
                <th className="py-3 pr-4 font-medium">SKU</th>
                <th className="py-3 pr-4 font-medium">Quantity</th>
                <th className="py-3 pr-4 font-medium">Selling price</th>
                <th className="py-3 pr-4 font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr className="border-b border-slate-100" key={item.id}>
                  <td className="py-3 pr-4 font-medium text-ink-900">{item.product?.name ?? `Product #${item.product_id}`}</td>
                  <td className="py-3 pr-4 text-slate-600">{item.product?.sku ?? "-"}</td>
                  <td className="py-3 pr-4 text-slate-600">{item.quantity}</td>
                  <td className="py-3 pr-4 text-slate-600">${Number(item.selling_price).toFixed(2)}</td>
                  <td className="py-3 pr-4 text-slate-600">${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
