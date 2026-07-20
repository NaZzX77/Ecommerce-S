import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../services/customerApi.js";
import { getProducts } from "../services/productApi.js";
import { createSale } from "../services/saleApi.js";


const emptyItem = {
  productId: "",
  quantity: "1",
};


function makeSaleItem() {
  return { ...emptyItem };
}


export default function CreateSalePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState([makeSaleItem()]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const productsById = useMemo(
    () => Object.fromEntries(products.map((product) => [String(product.id), product])),
    [products],
  );

  const grandTotal = useMemo(
    () =>
      items.reduce((total, item) => {
        const product = productsById[item.productId];
        if (!product) {
          return total;
        }

        return total + Number(product.price) * Number(item.quantity || 0);
      }, 0),
    [items, productsById],
  );

  useEffect(() => {
    loadOptions();
  }, []);

  async function loadOptions() {
    setError("");
    setIsLoading(true);

    try {
      const [customerData, productData] = await Promise.all([getCustomers(), getProducts()]);
      setCustomers(customerData);
      setProducts(productData);
      setCustomerId((current) => current || (customerData[0] ? String(customerData[0].id) : ""));
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateItem(index, field, value) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function addItem() {
    setItems((current) => [...current, makeSaleItem()]);
  }

  function removeItem(index) {
    setItems((current) => (current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index)));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = {
      customer_id: Number(customerId),
      items: items.map((item) => ({
        product_id: Number(item.productId),
        quantity: Number(item.quantity),
      })),
    };

    try {
      const sale = await createSale(payload);
      navigate(`/sales/${sale.id}`);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-600">Sales Management</p>
          <h2 className="text-lg font-semibold text-ink-900">Create sale</h2>
        </div>
        <button
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
          onClick={() => navigate("/sales")}
          type="button"
        >
          Back to sales
        </button>
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-ink-600">Loading customers and products...</p>
      ) : (
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Customer
            <select
              className="mt-1 w-full max-w-md rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              onChange={(event) => setCustomerId(event.target.value)}
              required
              value={customerId}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name} ({customer.phone ?? customer.email})
                </option>
              ))}
            </select>
          </label>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-ink-900">Products</h3>
              <button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={addItem} type="button">
                Add product
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {items.map((item, index) => {
                const product = productsById[item.productId];
                const quantity = Number(item.quantity || 0);
                const lineTotal = product ? Number(product.price) * quantity : 0;

                return (
                  <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_120px_120px_80px]" key={index}>
                    <label className="block text-sm font-medium text-slate-700">
                      Product
                      <select
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
                        onChange={(event) => updateItem(index, "productId", event.target.value)}
                        required
                        value={item.productId}
                      >
                        <option value="">Select product</option>
                        {products.map((availableProduct) => (
                          <option key={availableProduct.id} value={availableProduct.id}>
                            {availableProduct.name} - {availableProduct.quantity} in stock
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Quantity
                      <input
                        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
                        min="1"
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        required
                        step="1"
                        type="number"
                        value={item.quantity}
                      />
                    </label>
                    <div className="text-sm text-slate-700">
                      <p className="font-medium">Line total</p>
                      <p className="mt-3 text-slate-600">${lineTotal.toFixed(2)}</p>
                    </div>
                    <div className="flex items-end">
                      <button
                        className="font-medium text-rose-600 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={items.length === 1}
                        onClick={() => removeItem(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <p className="text-base font-semibold text-ink-900">Grand total: ${grandTotal.toFixed(2)}</p>
            <button
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving || !customerId}
              type="submit"
            >
              {isSaving ? "Saving..." : "Create sale"}
            </button>
          </div>
          {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
        </form>
      )}
    </section>
  );
}
