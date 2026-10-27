import { useEffect, useState } from "react";

const STATUSES = [
  { value: "operational", label: "Operational" },
  { value: "degraded", label: "Degraded" },
  { value: "down", label: "Down" },
];

async function api(path, options) {
  const res = await fetch(`/api/services${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed.");
  return data;
}

export default function App() {
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("")
      .then(setServices)
      .catch(() => setError("Can't reach the API. Start the server with npm start in /server."))
      .finally(() => setLoading(false));
  }, []);

  async function run(action) {
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e.message);
    }
  }

  const addService = (e) => {
    e.preventDefault();
    run(async () => {
      const created = await api("", { method: "POST", body: JSON.stringify({ name }) });
      setServices((list) => [...list, created]);
      setName("");
    });
  };

  const setStatus = (id, status) =>
    run(async () => {
      const updated = await api(`/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setServices((list) => list.map((s) => (s.id === id ? updated : s)));
    });

  const remove = (id) =>
    run(async () => {
      await api(`/${id}`, { method: "DELETE" });
      setServices((list) => list.filter((s) => s.id !== id));
    });

  const healthy = services.filter((s) => s.status === "operational").length;

  return (
    <main className="board">
      <header className="board-head">
        <h1>Status Board</h1>
        <p className="summary">
          {loading
            ? "Loading services…"
            : services.length === 0
            ? "No services yet."
            : `${healthy} of ${services.length} services operational`}
        </p>
      </header>

      <form className="add" onSubmit={addService}>
        <label htmlFor="name">Service name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Auth service"
          maxLength={60}
        />
        <button type="submit" disabled={!name.trim()}>Add service</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <ul className="services">
        {services.map((s) => (
          <li key={s.id} className={`service ${s.status}`}>
            <div className="service-info">
              <h2>{s.name}</h2>
              <p>Updated {new Date(s.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="controls" role="group" aria-label={`Status for ${s.name}`}>
              {STATUSES.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={s.status === opt.value ? "active" : ""}
                  aria-pressed={s.status === opt.value}
                  onClick={() => s.status !== opt.value && setStatus(s.id, opt.value)}
                >
                  {opt.label}
                </button>
              ))}
              <button type="button" className="remove" onClick={() => remove(s.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && services.length === 0 && !error && (
        <p className="empty">Add your first service above to start tracking its status.</p>
      )}
    </main>
  );
}
