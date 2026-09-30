import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "../utils/storage";
import { deleteCategory, deleteSub, deleteExpense } from "../utils/storeActions";

export default function ContentGrid({
  store,
  visibleExpenses,
  open,
  setOpen,
  setModal,
  daily,
  total,
  setStore,
}) {
  return (
    <div className="content-grid">
      <section className="categories panel">
        <div className="section-title">
          <div>
            <span className="eyebrow">SPENDING BREAKDOWN</span>
            <b>Categories</b>
          </div>
          <button className="secondary" onClick={() => setModal("category")}>
            <Plus size={15} /> Add category
          </button>
        </div>
        {store?.categories?.map((c) => {
          const rows = visibleExpenses.filter((e) => e.category === c.name);
          return (
            <div className="category" key={c.id}>
              <div className="category-header-wrapper" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <button
                  className="category-row"
                  style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setOpen(open === c.id ? "" : c.id)}
                >
                  {open === c.id ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                  <b>{c.name}</b>
                  <strong>
                    {formatMoney(rows.reduce((s, e) => s + e.amount, 0))}
                  </strong>
                </button>
                <button
                  className="icon-btn danger"
                  title="Delete Category"
                  onClick={() => deleteCategory(c.name, store, setStore)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4d4d", padding: "4px" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {open === c.id && (
                <div className="subrows" style={{ paddingLeft: "20px" }}>
                  {c.subcategories.map((s) => {
                    const subRows = rows.filter((e) => e.subcategory === s.name);
                    const amount = subRows.reduce((x, e) => x + e.amount, 0);
                    return (
                      <div key={s.id} style={{ marginBottom: "10px" }}>
                        <div className="subrow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <b>{s.name}</b>
                            <small style={{ display: "block", color: "#888" }}>
                              {amount
                                ? `${subRows.length} expense(s) today`
                                : "No expenses today"}
                            </small>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <strong>{formatMoney(amount)}</strong>
                            <button
                              title="Delete Sub-category"
                              onClick={() => deleteSub(c.name, s.name, store, setStore)}
                              style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4d4d" }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Expenses list under subcategory */}
                        {subRows.length > 0 && (
                          <div className="expense-list" style={{ marginTop: "5px", paddingLeft: "10px", borderLeft: "2px solid #eee" }}>
                            {subRows.map((exp) => (
                              <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px", margin: "4px 0" }}>
                                <span>{exp.note || "Expense"} - <b>{formatMoney(exp.amount)}</b></span>
                                <button
                                  title="Delete Expense"
                                  onClick={() => deleteExpense(exp.id, store, setStore)}
                                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4d4d" }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button className="add-sub" onClick={() => setModal("sub")} style={{ marginTop: "8px" }}>
                    <Plus size={14} /> Add sub-category
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </section>
      <aside className="insight panel">
        <span className="insight-icon">↘</span>
        <span className="eyebrow">SMART INSIGHT</span>
        <h3>Your daily runway</h3>
        <p>
          You have <b>{formatMoney(daily)}</b> available per day. Any unspent
          amount stays in savings.
        </p>
        <div className="progress">
          <i
            style={{
              width: `${Math.min(100, (total / Math.max(1, store?.plan?.salary)) * 100)}%`,
            }}
          />
        </div>
        <small>
          Expense ratio{" "}
          <b>{Math.round((total / Math.max(1, store?.plan?.salary)) * 100)}%</b>
        </small>
      </aside>
    </div>
  );
}