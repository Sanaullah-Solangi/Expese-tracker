import { X, Eye } from "lucide-react";

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

export function Filters({ filters, setFilters, categories }) {
  return (
    <div className="filters">
      <Field
        label="Start date"
        type="date"
        value={filters?.start}
        onChange={(e) => setFilters({ ...filters, start: e.target.value })}
      />
      <Field
        label="End date"
        type="date"
        value={filters?.end}
        onChange={(e) => setFilters({ ...filters, end: e.target.value })}
      />
      <label className="field">
        <span>Category</span>
        <select
          value={filters?.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <Field
        label="Min amount"
        type="number"
        placeholder="0"
        value={filters?.min}
        onChange={(e) => setFilters({ ...filters, min: e.target.value })}
      />
      <Field
        label="Max amount"
        type="number"
        placeholder="Any"
        value={filters?.max}
        onChange={(e) => setFilters({ ...filters, max: e.target.value })}
      />
      <Field
        label="Search"
        placeholder="Search notes..."
        value={filters?.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
    </div>
  );
}

export function Stat({ label, value, hint, icon, hidden, onReveal }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <i>{icon}</i>
      </div>
      <strong>
        {hidden ? (
          <button className="hidden-value" onClick={onReveal}>
            •••••• <Eye size={15} />
          </button>
        ) : (
          value
        )}
      </strong>
      <small>{hint}</small>
    </div>
  );
}
