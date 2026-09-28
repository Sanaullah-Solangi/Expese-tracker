import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { formatMoney } from "../utils/storage";

export default function ContentGrid({
  store,
  visibleExpenses,
  open,
  setOpen,
  setModal,
  daily,
  total,
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
              <button
                className="category-row"
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
              {open === c.id && (
                <div className="subrows">
                  {c.subcategories.map((s) => {
                    const amount = rows
                      .filter((e) => e.subcategory === s.name)
                      .reduce((x, e) => x + e.amount, 0);
                    return (
                      <div className="subrow" key={s.id}>
                        <div>
                          <b>{s.name}</b>
                          <small>
                            {amount
                              ? `${rows.filter((e) => e.subcategory === s.name).length} expense(s) today`
                              : "No expenses today"}
                          </small>
                        </div>
                        <strong>{formatMoney(amount)}</strong>
                      </div>
                    );
                  })}
                  <button className="add-sub" onClick={() => setModal("sub")}>
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
