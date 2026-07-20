import { useCallback, useEffect, useMemo, useState } from "react";
import { createCustomer, deleteCustomer, getCustomers, updateCustomer } from "../services/customerApi.js";


const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
};


function toPayload(form) {
  return {
    first_name: form.firstName.trim(),
    last_name: form.lastName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
  };
}


export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = useMemo(() => editingCustomerId !== null, [editingCustomerId]);

  const loadCustomers = useCallback(async (searchValue = "") => {
    setError("");
    setIsLoading(true);

    try {
      const data = await getCustomers(searchValue);
      setCustomers(data);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingCustomerId(null);
    setError("");
  }

  function startEdit(customer) {
    setEditingCustomerId(customer.id);
    setForm({
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (isEditing) {
        await updateCustomer(editingCustomerId, toPayload(form));
      } else {
        await createCustomer(toPayload(form));
      }

      resetForm();
      await loadCustomers(search);
    } catch (caughtError) {
      setError(caughtError.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(customerId) {
    setError("");

    try {
      await deleteCustomer(customerId);
      await loadCustomers(search);
      if (editingCustomerId === customerId) {
        resetForm();
      }
    } catch (caughtError) {
      setError(caughtError.message);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    await loadCustomers(search);
  }

  async function clearSearch() {
    setSearch("");
    await loadCustomers("");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold text-ink-900">{isEditing ? "Edit customer" : "Add customer"}</h2>
        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              First name
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                name="firstName"
                onChange={updateField}
                required
                type="text"
                value={form.firstName}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Last name
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                name="lastName"
                onChange={updateField}
                required
                type="text"
                value={form.lastName}
              />
            </label>
          </div>
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
            {isSaving ? "Saving..." : isEditing ? "Update customer" : "Create customer"}
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
            <p className="text-sm font-medium text-brand-600">Customer Management</p>
            <h2 className="text-lg font-semibold text-ink-900">Customers</h2>
          </div>
          <form className="flex flex-wrap gap-2" onSubmit={handleSearch}>
            <input
              className="w-56 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or phone"
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
          <p className="mt-6 text-sm text-ink-600">Loading customers...</p>
        ) : customers.length === 0 ? (
          <p className="mt-6 rounded-md border border-dashed border-slate-300 p-4 text-sm text-ink-600">
            No customers found.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Name</th>
                  <th className="py-3 pr-4 font-medium">Email</th>
                  <th className="py-3 pr-4 font-medium">Phone</th>
                  <th className="py-3 pr-4 font-medium">Address</th>
                  <th className="py-3 pr-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr className="border-b border-slate-100" key={customer.id}>
                    <td className="py-3 pr-4 font-medium text-ink-900">
                      {customer.first_name} {customer.last_name}
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{customer.email}</td>
                    <td className="py-3 pr-4 text-slate-600">{customer.phone ?? "-"}</td>
                    <td className="max-w-xs py-3 pr-4 text-slate-600">{customer.address ?? "-"}</td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-3">
                        <button className="font-medium text-brand-600 hover:text-brand-700" onClick={() => startEdit(customer)} type="button">
                          Edit
                        </button>
                        <button className="font-medium text-rose-600 hover:text-rose-700" onClick={() => handleDelete(customer.id)} type="button">
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
