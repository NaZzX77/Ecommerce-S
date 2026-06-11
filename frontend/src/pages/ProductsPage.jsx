import { useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, getProducts, updateProduct } from "../services/productApi.js";


const emptyForm = {
  name: "",
  description: "",
  sku: "",
  price: "0.00",
  quantity: "0",
};


function toPayload(form) {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
    sku: form.sku.trim(),
    price: form.price,
    quantity: Number(form.quantity),
  };
}


export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = useMemo(() => editingProductId !== null, [editingProductId]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setError("");
    setIsLoading(true);

    try {
      const data = await getProducts();
      setProducts(data);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingProductId(null);
    setError("");
  }

  function startEdit(product) {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      sku: product.sku,
      price: product.price,
      quantity: String(product.quantity),
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateProduct(editingProductId, toPayload(form));
      } else {
        await createProduct(toPayload(form));
      }

      resetForm();
      await loadProducts();
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(productId) {
    setError("");

    try {
      await deleteProduct(productId);
      await loadProducts();
      if (editingProductId === productId) {
        resetForm();
      }
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-ink-900">{isEditing ? "Edit product" : "Add product"}</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Name
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="name"
              onChange={updateField}
              required
              type="text"
              value={form.name}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            SKU
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-brand-600"
              name="sku"
              onChange={updateField}
              required
              type="text"
              value={form.sku}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Price
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                min="0"
                name="price"
                onChange={updateField}
                required
                step="0.01"
                type="number"
                value={form.price}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Quantity
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                min="0"
                name="quantity"
                onChange={updateField}
                required
                step="1"
                type="number"
                value={form.quantity}
              />
            </label>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="description"
              onChange={updateField}
              value={form.description}
            />
          </label>
        </div>
        {error ? <p className="mt-4 text-sm font-medium text-rose-600">{error}</p> : null}
        <div className="mt-5 flex gap-3">
          <button
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving..." : isEditing ? "Update product" : "Create product"}
          </button>
          {isEditing ? (
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-600"
              onClick={resetForm}
              type="button"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-600">Product Management</p>
            <h2 className="text-lg font-semibold text-ink-900">Products</h2>
          </div>
          <button className="text-sm font-medium text-brand-600 hover:text-brand-700" onClick={loadProducts} type="button">
            Refresh
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-ink-600">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
            No products yet. Add your first product to start the catalog.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">SKU</th>
                  <th className="py-3 pr-4 font-medium">Price</th>
                  <th className="py-3 pr-4 font-medium">Quantity</th>
                  <th className="py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr className="border-b border-slate-100" key={product.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">{product.name}</td>
                    <td className="py-3 pr-4 text-slate-600">{product.sku}</td>
                    <td className="py-3 pr-4 text-slate-600">${Number(product.price).toFixed(2)}</td>
                    <td className="py-3 pr-4 text-slate-600">{product.quantity}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-3">
                        <button className="font-medium text-brand-600 hover:text-brand-700" onClick={() => startEdit(product)} type="button">
                          Edit
                        </button>
                        <button className="font-medium text-rose-600 hover:text-rose-700" onClick={() => handleDelete(product.id)} type="button">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

