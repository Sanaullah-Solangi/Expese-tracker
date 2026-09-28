"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase.config";
import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileDown,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  formatMoney,
  isInRange,
  loadStore,
  queueSync,
  saveStore,
  todayKey,
} from "../utils/storage";

import {
  Header,
  Login,
  Field,
  Filters,
  Modal,
  Stat,
  SimpleAdd,
  PlanModal,
  DashHead,
  ContentGrid,
  FilterSection,
  ModalsSection,
  PlanStrip,
  StatsSection,
} from "../components/index.jsx";

import {
  addExpense,
  addCategory,
  addSub,
  exportData,
} from "../utils/storeActions.js";

export default function SpendWiseApp() {
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(loadStore);
  const [filters, setFilters] = useState({
    start: "",
    end: "",
    category: "",
    min: "",
    max: "",
    search: "",
  });
  const [open, setOpen] = useState("ghar");
  const [modal, setModal] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [password, setPassword] = useState("");
  const [expense, setExpense] = useState({
    category: "",
    subcategory: "",
    amount: "",
    note: "",
  });

  useEffect(() => {
    if (auth) return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    saveStore(store);
    queueSync();
  }, [store]);

  const today = todayKey();
  const visibleExpenses = useMemo(
    () =>
      store.expenses.filter(
        (e) =>
          isInRange(e.date, filters.start || today, filters.end || today) &&
          (!filters.category || e.category === filters.category) &&
          (!filters.min || e.amount >= Number(filters.min)) &&
          (!filters.max || e.amount <= Number(filters.max)) &&
          (!filters.search ||
            `${e.note} ${e.subcategory}`
              .toLowerCase()
              .includes(filters.search.toLowerCase())),
      ),
    [store.expenses, filters, today],
  );

  const total = store.expenses.reduce((s, e) => s + Number(e.amount), 0);
  const savings = (store.plan.salary * store.plan.savings) / 100;
  const daily = Math.max(
    0,
    (store.plan.salary - savings - total) /
      Math.max(
        1,
        new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
        ).getDate() - new Date().getDate(),
      ),
  );

  if (!user) return <Login onLogin={setUser} auth={auth} />;

  return (
    <>
      {/* ============================= HEADER SECTION =========================== */}
      <Header
        user={user}
        onLogout={() => {
          signOut(auth);
          setUser(null);
        }}
      />
      {/* ============================= DASHBOARD SECTION =========================== */}
      <main className="dashboard">
        {/* ============================= GREETINGS & ACTIONS =========================== */}
        {/* <div className="dash-head">
          <div>
            <span className="eyebrow plain">
              {new Date()
                .toLocaleDateString("en-US", { month: "long", year: "numeric" })
                .toUpperCase()}
            </span>
            <h2>Good evening, {user.displayName?.split(" ")[0] || "there"}</h2>
            <p>Here&apos;s your spending overview.</p>
          </div>
          <div className="head-buttons">
            <button className="secondary" onClick={() => setModal("plan")}>
              Set monthly plan
            </button>
            <button className="primary" onClick={() => setModal("expense")}>
              <Plus size={17} /> Add expense
            </button>
          </div>
        </div> */}
        <DashHead />
        {/* ============================= PLAN SECTION =========================== */}
        {/* <section className="plan-strip">
          <div>
            <span className="eyebrow">MONTHLY PLAN</span>
            <b>Make your money work smarter</b>
          </div>
          <div className="plan-meta">
            <span>
              Salary <b>{formatMoney(store.plan.salary)}</b>
            </span>
            <span>
              Savings target <b>{store.plan.savings}%</b>
            </span>
            <span className="budget">
              Working budget <b>{formatMoney(store.plan.salary - savings)}</b>
            </span>
          </div>
        </section> */}
        <PlanStrip />
        {/* ============================= STATISTICS SECTION =========================== */}
        {/* <div className="stats">
          <Stat
            label="Total balance"
            value={formatMoney(store.plan.salary - total)}
            hint="Password protected"
            icon={<Wallet size={16} />}
            hidden={!showBalance}
            onReveal={() => setModal("reveal")}
          />
          <Stat
            label="Total savings"
            value={formatMoney(savings)}
            hint={`${store.plan.savings}% target set aside`}
            icon={<Sparkles size={16} />}
          />
          <Stat
            label="Per-day budget"
            value={formatMoney(daily)}
            hint="Available today"
            icon={<CalendarDays size={16} />}
          />
          <Stat
            label="Total expenses"
            value={formatMoney(total)}
            hint={`${store.expenses.length} entries this month`}
            icon={<Wallet size={16} />}
          />
          <Stat
            label="Target progress"
            value={`${Math.min(100, Math.round((total / Math.max(1, store.plan.salary - savings)) * 100))}%`}
            hint="Spend discipline"
            icon={<BarChart3 size={16} />}
          />
        </div> */}
        <StatsSection />
        {/* ============================= FILTERS SECTION =========================== */}
        {/* <section className="filter-section">
          <div className="section-title">
            <div>
              <span className="eyebrow">FILTERS</span>
              <b>Find expenses</b>
            </div>
            <button className="secondary" onClick={exportData}>
              <FileDown size={15} /> Export
            </button>
          </div>
          <Filters
            filters={filters}
            setFilters={setFilters}
            categories={store.categories}
          />
        </section> */}
        <FilterSection />
        {/* ============================= MAIN-CONTENT SECTION =========================== */}
        {/* <div className="content-grid">
          <section className="categories panel">
            <div className="section-title">
              <div>
                <span className="eyebrow">SPENDING BREAKDOWN</span>
                <b>Categories</b>
              </div>
              <button
                className="secondary"
                onClick={() => setModal("category")}
              >
                <Plus size={15} /> Add category
              </button>
            </div>
            {store.categories.map((c) => {
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
                      <button
                        className="add-sub"
                        onClick={() => setModal("sub")}
                      >
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
              You have <b>{formatMoney(daily)}</b> available per day. Any
              unspent amount stays in savings.
            </p>
            <div className="progress">
              <i
                style={{
                  width: `${Math.min(100, (total / Math.max(1, store.plan.salary)) * 100)}%`,
                }}
              />
            </div>
            <small>
              Expense ratio{" "}
              <b>
                {Math.round((total / Math.max(1, store.plan.salary)) * 100)}%
              </b>
            </small>
          </aside>
        </div> */}
        <ContentGrid />
      </main>
      {/* ============================= MODAL SECTION =========================== */}
      <ModalsSection />
      {/* {modal === "expense" && (
        <Modal title="Add expense" onClose={() => setModal(null)}>
          <label className="field">
            <span>Category</span>
            <select
              value={expense.category}
              onChange={(e) =>
                setExpense({
                  ...expense,
                  category: e.target.value,
                  subcategory: "",
                })
              }
            >
              <option value="">Select category</option>
              {store.categories.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sub-category</span>
            <select
              value={expense.subcategory}
              onChange={(e) =>
                setExpense({ ...expense, subcategory: e.target.value })
              }
            >
              <option value="">Select sub-category</option>
              {store.categories
                .find((c) => c.name === expense.category)
                ?.subcategories.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
            </select>
          </label>
          <Field
            label="Amount"
            type="number"
            value={expense.amount}
            onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
          />
          <Field
            label="Note (optional)"
            value={expense.note}
            onChange={(e) => setExpense({ ...expense, note: e.target.value })}
          />
          <button
            className="primary wide"
            onClick={() =>
              addExpense(
                expense,
                setExpense,
                today,
                user,
                store,
                setStore,
                setModal,
              )
            }
          >
            Save expense
          </button>
        </Modal>
      )}
      {modal === "category" && (
        <SimpleAdd
          title="Add category"
          onClose={() => setModal(null)}
          onSave={(name, sub, amount) =>
            addCategory(name, sub, amount, store, setStore, setModal)
          }
          category
        />
      )}
      {modal === "sub" && (
        <SimpleAdd
          title="Add sub-category"
          onClose={() => setModal(null)}
          onSave={(cat, name, amount) =>
            addSub(cat, name, amount, store, setStore, setModal)
          }
          categories={store.categories}
        />
      )}{" "}
      {modal === "plan" && (
        <PlanModal
          plan={store.plan}
          onClose={() => setModal(null)}
          onSave={(p) => savePlan(p, store, setStore, setModal)}
        />
      )}
      {modal === "reveal" && (
        <Modal title="Reveal balance" onClose={() => setModal(null)}>
          <p className="modal-copy">
            Enter your security password to reveal protected figures.
          </p>
          <Field
            label="Security password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="primary wide"
            onClick={() => {
              if (password === store.plan.password) {
                setShowBalance(true);
                setModal(null);
                setPassword("");
              } else alert("Incorrect password");
            }}
          >
            Reveal balance
          </button>
        </Modal>
      )} */}
    </>
  );
}
