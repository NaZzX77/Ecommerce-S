import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts } from "../services/productApi.js";
import { decreaseStock, getInventoryHistory, getLowStockProducts, increaseStock } from "../services/inventoryApi.js";


const emptyAdjustment = {
  productId: "",
  transactionType: "increase",
  quantityChange: "1",
  notes: "",
};


export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [threshold, setThreshold] = useState("10");
  const [adjustment, setAdjustment] = useState(emptyAdjustment);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === adjustment.productId),
    [products, adjustment.productId],
  );

  const loadHistory = useCallback(async (productId) => {
    try {
      const data = await getInventoryHistory(productId);
      setHistory(data);
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }, []);

  const loadInventoryPage = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const [productData, lowStockData] = await Promise.all([
        getProducts(),
        getLowStockProducts(Number(threshold) || 0),
      ]);
      setProducts(productData);
      setLowStockProducts(lowStockData);
      setAdjustment((current) => ({
        ...current,
        productId: current.productId || (productData[0] ? String(productData[0].id) : ""),
      }));
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }, [threshold]);

  useEffect(() => {
    loadInventoryPage();
  }, [loadInventoryPage]);

  useEffect(() => {
    if (adjustment.productId) {
      loadHistory(adjustment.productId);
    } else {
      setHistory([]);
    }
  }, [adjustment.productId, loadHistory]);

  async function loadLowStock() {
    setError("");

    try {
      const data = await getLowStockProducts(Number(threshold) || 0);
      setLowStockProducts(data);
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  function updateAdjustment(event) {
    setAdjustment((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleAdjustmentSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSaving(true);

    const payload = {
      quantity_changed: Number(adjustment.quantityChange),
      notes: adjustment.notes.trim() || null,
    };

    try {
      if (adjustment.transactionType === "increase") {
        await increaseStock(adjustment.productId, payload);
      } else {
        await decreaseStock(adjustment.productId, payload);
      }

      setMessage("Stock adjustment saved.");
      setAdjustment((current) => ({ ...current, quantityChange: "1", notes: "" }));
      await loadInventoryPage();
      await loadHistory(adjustment.productId);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleAdjustmentSubmit}>
        <p className="text-sm font-medium text-brand-600">Inventory Management</p>
        <h2 className="mt-1 text-lg font-semibold text-ink-900">Stock Adjustment</h2>

        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Product
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="productId"
              onChange={updateAdjustment}
              required
              value={adjustment.productId}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </label>

          {selectedProduct ? (
            <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              Current stock: <span className="font-semibold">{selectedProduct.quantity}</span>
            </p>
          ) : null}

          <label className="block text-sm font-medium text-slate-700">
            Movement
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="transactionType"
              onChange={updateAdjustment}
              value={adjustment.transactionType}
            >
              <option value="increase">Increase stock</option>
              <option value="decrease">Decrease stock</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Quantity change
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              min="1"
              name="quantityChange"
              onChange={updateAdjustment}
              required
              step="1"
              type="number"
              value={adjustment.quantityChange}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Notes
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="notes"
              onChange={updateAdjustment}
              value={adjustment.notes}
            />
          </label>
        </div>

        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        {message ? <p className="mt-4 text-sm font-medium text-emerald-700">{message}</p> : null}

        <button
          className="mt-5 rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSaving || !adjustment.productId}
          type="submit"
        >
          {isSaving ? "Saving..." : "Save adjustment"}
        </button>
      </form>

      <div className="space-y-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brand-600">Transaction History</p>
              <h2 className="text-lg font-semibold text-ink-900">
                {selectedProduct ? selectedProduct.name : "Select a product"}
              </h2>
            </div>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={loadInventoryPage} type="button">
              Refresh
            </button>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-ink-600">Loading inventory...</p>
          ) : history.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
              No stock movements recorded for this product yet.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Change</th>
                    <th className="py-3 pr-4 font-medium">Previous</th>
                    <th className="py-3 pr-4 font-medium">New</th>
                    <th className="py-3 pr-4 font-medium">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((transaction) => (
                    <tr className="border-b border-slate-100" key={transaction.id}>
                      <td className="py-3 pr-4 font-medium text-ink-900">{transaction.transaction_type}</td>
                      <td className="py-3 pr-4 text-slate-600">{transaction.quantity_changed}</td>
                      <td className="py-3 pr-4 text-slate-600">{transaction.previous_quantity}</td>
                      <td className="py-3 pr-4 text-slate-600">{transaction.new_quantity}</td>
                      <td className="py-3 pr-4 text-slate-600">{transaction.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brand-600">Low Stock Monitoring</p>
              <h2 className="text-lg font-semibold text-ink-900">Low-stock products</h2>
            </div>
            <label className="text-sm font-medium text-slate-700">
              Threshold
              <input
                className="ml-2 w-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                min="0"
                onChange={(event) => setThreshold(event.target.value)}
                type="number"
                value={threshold}
              />
            </label>
            <button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={loadLowStock} type="button">
              Apply
            </button>
          </div>

          {lowStockProducts.length === 0 ? (
            <p className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
              No products are at or below this threshold.
            </p>
          ) : (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {lowStockProducts.map((product) => (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4" key={product.id}>
                  <p className="font-medium text-ink-900">{product.name}</p>
                  <p className="mt-1 text-sm text-amber-800">
                    {product.sku} - {product.quantity} in stock
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
