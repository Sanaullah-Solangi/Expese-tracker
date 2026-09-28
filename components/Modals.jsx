import { useState } from "react";
import { Modal, Field } from "./CommonComponents";

export function SimpleAdd({ title, onClose, onSave, category, categories }) {
  const [name, setName] = useState(""),
    [sub, setSub] = useState(""),
    [amount, setAmount] = useState(""),
    [cat, setCat] = useState(categories?.[0]?.name || "");
  return (
    <Modal title={title} onClose={onClose}>
      {!category && (
        <label className="field">
          <span>Main category</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories?.map((c) => (
              <option key={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      )}
      <Field
        label={category ? "Main category name" : "New sub-category name"}
        value={category ? name : sub}
        onChange={(e) =>
          category ? setName(e.target.value) : setSub(e.target.value)
        }
      />
      {category && (
        <Field
          label="Optional sub-category"
          value={sub}
          onChange={(e) => setSub(e.target.value)}
        />
      )}
      <Field
        label="Initial amount (optional)"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button
        className="primary wide"
        onClick={() =>
          category ? onSave(name, sub, amount) : onSave(cat, sub, amount)
        }
      >
        Save
      </button>
    </Modal>
  );
}

export function PlanModal({ plan, onClose, onSave }) {
  const [p, setP] = useState(plan);
  return (
    <Modal title="Monthly plan" onClose={onClose}>
      <p className="modal-copy">
        Keep your salary and savings settings protected and out of the main
        dashboard.
      </p>
      <Field
        label="Monthly salary"
        type="number"
        value={p.salary}
        onChange={(e) => setP({ ...p, salary: Number(e.target.value) })}
      />
      <Field
        label="Savings percentage"
        type="number"
        min="0"
        max="100"
        value={p.savings}
        onChange={(e) => setP({ ...p, savings: Number(e.target.value) })}
      />
      <Field
        label="Security password"
        type="password"
        value={p.password}
        onChange={(e) => setP({ ...p, password: e.target.value })}
      />
      <button className="primary wide" onClick={() => onSave(p)}>
        Save monthly plan
      </button>
    </Modal>
  );
}
