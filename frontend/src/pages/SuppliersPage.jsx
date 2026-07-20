import { useCallback, useEffect, useMemo, useState } from "react";
import { createSupplier, deleteSupplier, getSuppliers, updateSupplier } from "../services/supplierApi.js";


const emptyForm = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
};


function toPayload(form) {
  return {
    company_name: form.companyName.trim(),
    contact_person: form.contactPerson.trim() || null,
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
  };
}


export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = useMemo(() => editingSupplierId !== null, [editingSupplierId]);

  const loadSuppliers = useCallback(async (searchValue = "") => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getSuppliers(searchValue);
      setSuppliers(data);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingSupplierId(null);
    setError("");
  }

  function startEdit(supplier) {
    setEditingSupplierId(supplier.id);
    setForm({
      companyName: supplier.company_name,
      contactPerson: supplier.contact_person ?? "",
      email: supplier.email,
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateSupplier(editingSupplierId, toPayload(form));
      } else {
        await createSupplier(toPayload(form));
      }

      resetForm();
      await loadSuppliers(search);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(supplierId) {
    setError("");

    try {
      await deleteSupplier(supplierId);
      await loadSuppliers(search);
      if (editingSupplierId === supplierId) {
        resetForm();
      }
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadSuppliers(search);
  }

  async function clearSearch() {
    setSearch("");
    await loadSuppliers("");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-ink-900">{isEditing ? "Edit supplier" : "Add supplier"}</h2>
        <div className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Company name
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="companyName"
              onChange={updateField}
              required
              type="text"
              value={form.companyName}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Contact person
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="contactPerson"
              onChange={updateField}
              type="text"
              value={form.contactPerson}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="email"
              onChange={updateField}
              required
              type="email"
              value={form.email}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Phone
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="phone"
              onChange={updateField}
              type="tel"
              value={form.phone}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Address
            <textarea
              className="mt-1 min-h-24 w-full resize-y rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              name="address"
              onChange={updateField}
              value={form.address}
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
            {isSaving ? "Saving..." : isEditing ? "Update supplier" : "Create supplier"}
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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-brand-600">Supplier Management</p>
            <h2 className="text-lg font-semibold text-ink-900">Suppliers</h2>
          </div>
          <form className="flex flex-wrap gap-2" onSubmit={handleSearch}>
            <input
              className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search supplier"
              type="search"
              value={search}
            />
            <button className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700" type="submit">
              Search
            </button>
            <button
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-brand-600 hover:text-brand-600"
              onClick={clearSearch}
              type="button"
            >
              Clear
            </button>
          </form>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-ink-600">Loading suppliers...</p>
        ) : suppliers.length === 0 ? (
          <p className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
            No suppliers found.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Company</th>
                  <th className="py-3 pr-4 font-medium">Contact</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Phone</th>
                  <th className="py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr className="border-b border-slate-100" key={supplier.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">{supplier.company_name}</td>
                    <td className="py-3 pr-4 text-slate-600">{supplier.contact_person ?? "-"}</td>
                    <td className="py-3 pr-4 text-slate-600">{supplier.email}</td>
                    <td className="py-3 pr-4 text-slate-600">{supplier.phone ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-3">
                        <button className="font-medium text-brand-600 hover:text-brand-700" onClick={() => startEdit(supplier)} type="button">
                          Edit
                        </button>
                        <button className="font-medium text-rose-600 hover:text-rose-700" onClick={() => handleDelete(supplier.id)} type="button">
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
