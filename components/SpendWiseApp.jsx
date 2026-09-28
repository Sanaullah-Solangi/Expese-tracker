"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "../lib/firebaseConfig";
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
  X,
} from "lucide-react";
import {
  formatMoney,
  isInRange,
  loadStore,
  queueSync,
  saveStore,
  todayKey,
} from "../utils/storage";

// Saare alag kiye gaye components yahan import ho rahe hain
import Header from "./Header";
import Login from "./Login";
import { Modal, Field, Filters, Stat } from "./CommonComponents";
import { SimpleAdd, PlanModal } from "./Modals";

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

  const addExpense = () => {
    if (!expense.category || !expense.subcategory || !expense.amount) return;
    const item = {
      ...expense,
      amount: Number(expense.amount),
      date: today,
      userId: user.uid,
    };
    setStore({ ...store, expenses: [...store.expenses, item] });
    setExpense({ category: "", subcategory: "", amount: "", note: "" });
    setModal(null);
  };

  const addCategory = (name, sub, amount) => {
    if (!name) return;
    setStore({
      ...store,
      categories: [
        ...store.categories,
        {
          id: Date.now().toString(),
          name,
          subcategories: sub
            ? [
                {
                  id: Date.now().toString() + "s",
                  name: sub,
                  amount: Number(amount) || 0,
                },
              ]
            : [],
        },
      ],
    });
    setModal(null);
  };

  const addSub = (cat, name, amount) => {
    setStore({
      ...store,
      categories: store.categories.map((c) =>
        c.name === cat
          ? {
              ...c,
              subcategories: [
                ...c.subcategories,
                {
                  id: Date.now().toString(),
                  name,
                  amount: Number(amount) || 0,
                },
              ],
            }
          : c,
      ),
    });
    setModal(null);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(store.expenses, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "spendwise-expenses.json";
    a.click();
  };

  return (
    <>
      <Header
        user={user}
        onLogout={() => {
          signOut(auth);
          setUser(null);
        }}
      />
      <main className="dashboard">
        <div className="dash-head">
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
        </div>
        <section className="plan-strip">
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
        </section>
        <div className="stats">
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
        </div>
        <section className="filter-section">
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
        </section>
        <div className="content-grid">
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
        </div>
      </main>
      {modal === "expense" && (
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
          <button className="primary wide" onClick={addExpense}>
            Save expense
          </button>
        </Modal>
      )}
      {modal === "category" && (
        <SimpleAdd
          title="Add category"
          onClose={() => setModal(null)}
          onSave={addCategory}
          category
        />
      )}
      {modal === "sub" && (
        <SimpleAdd
          title="Add sub-category"
          onClose={() => setModal(null)}
          onSave={addSub}
          categories={store.categories}
        />
      )}{" "}
      {modal === "plan" && (
        <PlanModal
          plan={store.plan}
          onClose={() => setModal(null)}
          onSave={(p) => {
            setStore({ ...store, plan: p });
            setModal(null);
          }}
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
      )}
    </>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { addDoc, collection, getFirestore } from "firebase/firestore";
// import {
//   getAuth,
//   GoogleAuthProvider,
//   onAuthStateChanged,
//   signInWithPopup,
//   signOut,
// } from "firebase/auth";
// import { initializeApp, getApps } from "firebase/app";
// import {
//   BarChart3,
//   CalendarDays,
//   ChevronDown,
//   ChevronRight,
//   Eye,
//   EyeOff,
//   FileDown,
//   LogIn,
//   LogOut,
//   Moon,
//   Plus,
//   ShieldCheck,
//   Sparkles,
//   Wallet,
//   X,
// } from "lucide-react";
// import {
//   formatMoney,
//   isInRange,
//   loadStore,
//   queueSync,
//   saveStore,
//   todayKey,
// } from "../utils/storage";

// const config = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// };
// const firebaseReady = Object.values(config).every(Boolean);
// const firebaseApp = firebaseReady
//   ? getApps()[0] || initializeApp(config)
//   : null;
// const auth = firebaseApp ? getAuth(firebaseApp) : null;
// const db = firebaseApp ? getFirestore(firebaseApp) : null;

// function Header({ user, onLogout }) {
//   return (
//     <header className="topbar">
//       <div className="brand">
//         <span className="brand-icon">
//           <Wallet size={21} />
//         </span>
//         <span>
//           <strong>SpendWise</strong>
//           <small>Personal expense tracker</small>
//         </span>
//       </div>
//       <div className="header-actions">
//         <button className="icon-btn" aria-label="Toggle theme">
//           <Moon size={17} />
//         </button>
//         {user && (
//           <>
//             <div className="profile">
//               <span className="avatar">{(user.displayName || "L")[0]}</span>
//               <span className="profile-text">
//                 <b>{user.displayName || "User"}</b>
//                 <small>{user.email}</small>
//               </span>
//             </div>
//             <button
//               className="icon-btn"
//               onClick={onLogout}
//               aria-label="Sign out"
//             >
//               <LogOut size={17} />
//             </button>
//           </>
//         )}
//       </div>
//     </header>
//   );
// }

// function Login({ onLogin }) {
//   const [busy, setBusy] = useState(false);
//   const login = async () => {
//     setBusy(true);
//     try {
//       if (!auth)
//         throw new Error(
//           "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE variables in project settings.",
//         );
//       const result = await signInWithPopup(auth, new GoogleAuthProvider());
//       onLogin(result.user);
//     } catch (e) {
//       alert(e.message);
//     } finally {
//       setBusy(false);
//     }
//   };
//   return (
//     <>
//       <Header />
//       <main className="login-layout">
//         <section className="hero-copy">
//           <span className="eyebrow">
//             <ShieldCheck size={14} /> Secured by Google Sign-In
//           </span>
//           <h1>
//             Know exactly where
//             <br />
//             your <em>money</em> goes.
//           </h1>
//           <p>
//             A single clean dashboard to record expenses, slice them by date,
//             source and amount, and export polished reports whenever you need
//             them.
//           </p>
//           <div className="benefits">
//             <Benefit
//               icon={<Wallet />}
//               title="Track every rupee"
//               text="Add cash or transfer expenses in seconds."
//             />
//             <Benefit
//               icon={<BarChart3 />}
//               title="Live analytics"
//               text="Charts and trends filtered exactly how you want."
//             />
//             <Benefit
//               icon={<FileDown />}
//               title="PDF & Excel export"
//               text="Download any month or filtered report."
//             />
//           </div>
//         </section>
//         <section className="login-card">
//           <div className="login-icon">
//             <Wallet size={29} />
//           </div>
//           <h2>Welcome back</h2>
//           <p>Continue with your Google account to open your dashboard.</p>
//           <button className="primary wide" onClick={login} disabled={busy}>
//             <span>G</span>
//             {busy ? "Connecting…" : "Continue with Google"}
//           </button>
//           <small>We only read your name, email and profile picture.</small>
//         </section>
//       </main>
//     </>
//   );
// }
// function Benefit({ icon, title, text }) {
//   return (
//     <div className="benefit">
//       <span>{icon}</span>
//       <div>
//         <b>{title}</b>
//         <p>{text}</p>
//       </div>
//     </div>
//   );
// }
// function Modal({ title, onClose, children }) {
//   return (
//     <div className="modal-backdrop" onMouseDown={onClose}>
//       <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
//         <div className="modal-head">
//           <h3>{title}</h3>
//           <button className="icon-btn" onClick={onClose}>
//             <X size={18} />
//           </button>
//         </div>
//         {children}
//       </div>
//     </div>
//   );
// }
// function Field({ label, ...props }) {
//   return (
//     <label className="field">
//       <span>{label}</span>
//       <input {...props} />
//     </label>
//   );
// }
// function Filters({ filters, setFilters, categories }) {
//   return (
//     <div className="filters">
//       <Field
//         label="Start date"
//         type="date"
//         value={filters.start}
//         onChange={(e) => setFilters({ ...filters, start: e.target.value })}
//       />
//       <Field
//         label="End date"
//         type="date"
//         value={filters.end}
//         onChange={(e) => setFilters({ ...filters, end: e.target.value })}
//       />
//       <label className="field">
//         <span>Category</span>
//         <select
//           value={filters.category}
//           onChange={(e) => setFilters({ ...filters, category: e.target.value })}
//         >
//           <option value="">All categories</option>
//           {categories.map((c) => (
//             <option key={c.id}>{c.name}</option>
//           ))}
//         </select>
//       </label>
//       <Field
//         label="Min amount"
//         type="number"
//         placeholder="0"
//         value={filters.min}
//         onChange={(e) => setFilters({ ...filters, min: e.target.value })}
//       />
//       <Field
//         label="Max amount"
//         type="number"
//         placeholder="Any"
//         value={filters.max}
//         onChange={(e) => setFilters({ ...filters, max: e.target.value })}
//       />
//       <Field
//         label="Search"
//         placeholder="Search notes..."
//         value={filters.search}
//         onChange={(e) => setFilters({ ...filters, search: e.target.value })}
//       />
//     </div>
//   );
// }
// function Stat({ label, value, hint, icon, hidden, onReveal }) {
//   return (
//     <div className="stat">
//       <div className="stat-top">
//         <span>{label}</span>
//         <i>{icon}</i>
//       </div>
//       <strong>
//         {hidden ? (
//           <button className="hidden-value" onClick={onReveal}>
//             •••••• <Eye size={15} />
//           </button>
//         ) : (
//           value
//         )}
//       </strong>
//       <small>{hint}</small>
//     </div>
//   );
// }

// export default function SpendWiseApp() {
//   const [user, setUser] = useState(null);
//   const [store, setStore] = useState(loadStore);
//   const [filters, setFilters] = useState({
//     start: "",
//     end: "",
//     category: "",
//     min: "",
//     max: "",
//     search: "",
//   });
//   const [open, setOpen] = useState("ghar");
//   const [modal, setModal] = useState(null);
//   const [showBalance, setShowBalance] = useState(false);
//   const [password, setPassword] = useState("");
//   const [expense, setExpense] = useState({
//     category: "",
//     subcategory: "",
//     amount: "",
//     note: "",
//   });
//   useEffect(() => {
//     if (auth) return onAuthStateChanged(auth, setUser);
//   }, []);
//   useEffect(() => {
//     saveStore(store);
//     queueSync();
//   }, [store]);
//   const today = todayKey();
//   const visibleExpenses = useMemo(
//     () =>
//       store.expenses.filter(
//         (e) =>
//           isInRange(e.date, filters.start || today, filters.end || today) &&
//           (!filters.category || e.category === filters.category) &&
//           (!filters.min || e.amount >= Number(filters.min)) &&
//           (!filters.max || e.amount <= Number(filters.max)) &&
//           (!filters.search ||
//             `${e.note} ${e.subcategory}`
//               .toLowerCase()
//               .includes(filters.search.toLowerCase())),
//       ),
//     [store.expenses, filters, today],
//   );
//   const total = store.expenses.reduce((s, e) => s + Number(e.amount), 0);
//   const savings = (store.plan.salary * store.plan.savings) / 100;
//   const daily = Math.max(
//     0,
//     (store.plan.salary - savings - total) /
//       Math.max(
//         1,
//         new Date(
//           new Date().getFullYear(),
//           new Date().getMonth() + 1,
//           0,
//         ).getDate() - new Date().getDate(),
//       ),
//   );
//   if (!user) return <Login onLogin={setUser} />;
//   const addExpense = () => {
//     if (!expense.category || !expense.subcategory || !expense.amount) return;
//     const item = {
//       ...expense,
//       amount: Number(expense.amount),
//       date: today,
//       userId: user.uid,
//     };
//     setStore({ ...store, expenses: [...store.expenses, item] });
//     setExpense({ category: "", subcategory: "", amount: "", note: "" });
//     setModal(null);
//   };
//   const addCategory = (name, sub, amount) => {
//     if (!name) return;
//     setStore({
//       ...store,
//       categories: [
//         ...store.categories,
//         {
//           id: Date.now().toString(),
//           name,
//           subcategories: sub
//             ? [
//                 {
//                   id: Date.now().toString() + "s",
//                   name: sub,
//                   amount: Number(amount) || 0,
//                 },
//               ]
//             : [],
//         },
//       ],
//     });
//     setModal(null);
//   };
//   const addSub = (cat, name, amount) => {
//     setStore({
//       ...store,
//       categories: store.categories.map((c) =>
//         c.name === cat
//           ? {
//               ...c,
//               subcategories: [
//                 ...c.subcategories,
//                 {
//                   id: Date.now().toString(),
//                   name,
//                   amount: Number(amount) || 0,
//                 },
//               ],
//             }
//           : c,
//       ),
//     });
//     setModal(null);
//   };
//   const exportData = () => {
//     const blob = new Blob([JSON.stringify(store.expenses, null, 2)], {
//       type: "application/json",
//     });
//     const a = document.createElement("a");
//     a.href = URL.createObjectURL(blob);
//     a.download = "spendwise-expenses.json";
//     a.click();
//   };
//   return (
//     <>
//       <Header
//         user={user}
//         onLogout={() => {
//           signOut(auth);
//           setUser(null);
//         }}
//       />
//       <main className="dashboard">
//         <div className="dash-head">
//           <div>
//             <span className="eyebrow plain">
//               {new Date()
//                 .toLocaleDateString("en-US", { month: "long", year: "numeric" })
//                 .toUpperCase()}
//             </span>
//             <h2>Good evening, {user.displayName?.split(" ")[0] || "there"}</h2>
//             <p>Here&apos;s your spending overview.</p>
//           </div>
//           <div className="head-buttons">
//             <button className="secondary" onClick={() => setModal("plan")}>
//               Set monthly plan
//             </button>
//             <button className="primary" onClick={() => setModal("expense")}>
//               <Plus size={17} /> Add expense
//             </button>
//           </div>
//         </div>
//         <section className="plan-strip">
//           <div>
//             <span className="eyebrow">MONTHLY PLAN</span>
//             <b>Make your money work smarter</b>
//           </div>
//           <div className="plan-meta">
//             <span>
//               Salary <b>{formatMoney(store.plan.salary)}</b>
//             </span>
//             <span>
//               Savings target <b>{store.plan.savings}%</b>
//             </span>
//             <span className="budget">
//               Working budget <b>{formatMoney(store.plan.salary - savings)}</b>
//             </span>
//           </div>
//         </section>
//         <div className="stats">
//           <Stat
//             label="Total balance"
//             value={formatMoney(store.plan.salary - total)}
//             hint="Password protected"
//             icon={<Wallet size={16} />}
//             hidden={!showBalance}
//             onReveal={() => setModal("reveal")}
//           />
//           <Stat
//             label="Total savings"
//             value={formatMoney(savings)}
//             hint={`${store.plan.savings}% target set aside`}
//             icon={<Sparkles size={16} />}
//           />
//           <Stat
//             label="Per-day budget"
//             value={formatMoney(daily)}
//             hint="Available today"
//             icon={<CalendarDays size={16} />}
//           />
//           <Stat
//             label="Total expenses"
//             value={formatMoney(total)}
//             hint={`${store.expenses.length} entries this month`}
//             icon={<Wallet size={16} />}
//           />
//           <Stat
//             label="Target progress"
//             value={`${Math.min(100, Math.round((total / Math.max(1, store.plan.salary - savings)) * 100))}%`}
//             hint="Spend discipline"
//             icon={<BarChart3 size={16} />}
//           />
//         </div>
//         <section className="filter-section">
//           <div className="section-title">
//             <div>
//               <span className="eyebrow">FILTERS</span>
//               <b>Find expenses</b>
//             </div>
//             <button className="secondary" onClick={exportData}>
//               <FileDown size={15} /> Export
//             </button>
//           </div>
//           <Filters
//             filters={filters}
//             setFilters={setFilters}
//             categories={store.categories}
//           />
//         </section>
//         <div className="content-grid">
//           <section className="categories panel">
//             <div className="section-title">
//               <div>
//                 <span className="eyebrow">SPENDING BREAKDOWN</span>
//                 <b>Categories</b>
//               </div>
//               <button
//                 className="secondary"
//                 onClick={() => setModal("category")}
//               >
//                 <Plus size={15} /> Add category
//               </button>
//             </div>
//             {store.categories.map((c) => {
//               const rows = visibleExpenses.filter((e) => e.category === c.name);
//               return (
//                 <div className="category" key={c.id}>
//                   <button
//                     className="category-row"
//                     onClick={() => setOpen(open === c.id ? "" : c.id)}
//                   >
//                     {open === c.id ? (
//                       <ChevronDown size={16} />
//                     ) : (
//                       <ChevronRight size={16} />
//                     )}
//                     <b>{c.name}</b>
//                     <strong>
//                       {formatMoney(rows.reduce((s, e) => s + e.amount, 0))}
//                     </strong>
//                   </button>
//                   {open === c.id && (
//                     <div className="subrows">
//                       {c.subcategories.map((s) => {
//                         const amount = rows
//                           .filter((e) => e.subcategory === s.name)
//                           .reduce((x, e) => x + e.amount, 0);
//                         return (
//                           <div className="subrow" key={s.id}>
//                             <div>
//                               <b>{s.name}</b>
//                               <small>
//                                 {amount
//                                   ? `${rows.filter((e) => e.subcategory === s.name).length} expense(s) today`
//                                   : "No expenses today"}
//                               </small>
//                             </div>
//                             <strong>{formatMoney(amount)}</strong>
//                           </div>
//                         );
//                       })}
//                       <button
//                         className="add-sub"
//                         onClick={() => setModal("sub")}
//                       >
//                         <Plus size={14} /> Add sub-category
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </section>
//           <aside className="insight panel">
//             <span className="insight-icon">↘</span>
//             <span className="eyebrow">SMART INSIGHT</span>
//             <h3>Your daily runway</h3>
//             <p>
//               You have <b>{formatMoney(daily)}</b> available per day. Any
//               unspent amount stays in savings.
//             </p>
//             <div className="progress">
//               <i
//                 style={{
//                   width: `${Math.min(100, (total / Math.max(1, store.plan.salary)) * 100)}%`,
//                 }}
//               />
//             </div>
//             <small>
//               Expense ratio{" "}
//               <b>
//                 {Math.round((total / Math.max(1, store.plan.salary)) * 100)}%
//               </b>
//             </small>
//           </aside>
//         </div>
//       </main>
//       {modal === "expense" && (
//         <Modal title="Add expense" onClose={() => setModal(null)}>
//           <label className="field">
//             <span>Category</span>
//             <select
//               value={expense.category}
//               onChange={(e) =>
//                 setExpense({
//                   ...expense,
//                   category: e.target.value,
//                   subcategory: "",
//                 })
//               }
//             >
//               <option value="">Select category</option>
//               {store.categories.map((c) => (
//                 <option key={c.id}>{c.name}</option>
//               ))}
//             </select>
//           </label>
//           <label className="field">
//             <span>Sub-category</span>
//             <select
//               value={expense.subcategory}
//               onChange={(e) =>
//                 setExpense({ ...expense, subcategory: e.target.value })
//               }
//             >
//               <option value="">Select sub-category</option>
//               {store.categories
//                 .find((c) => c.name === expense.category)
//                 ?.subcategories.map((s) => (
//                   <option key={s.id}>{s.name}</option>
//                 ))}
//             </select>
//           </label>
//           <Field
//             label="Amount"
//             type="number"
//             value={expense.amount}
//             onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
//           />
//           <Field
//             label="Note (optional)"
//             value={expense.note}
//             onChange={(e) => setExpense({ ...expense, note: e.target.value })}
//           />
//           <button className="primary wide" onClick={addExpense}>
//             Save expense
//           </button>
//         </Modal>
//       )}
//       {modal === "category" && (
//         <SimpleAdd
//           title="Add category"
//           onClose={() => setModal(null)}
//           onSave={addCategory}
//           category
//         />
//       )}
//       {modal === "sub" && (
//         <SimpleAdd
//           title="Add sub-category"
//           onClose={() => setModal(null)}
//           onSave={addSub}
//           categories={store.categories}
//         />
//       )}{" "}
//       {modal === "plan" && (
//         <PlanModal
//           plan={store.plan}
//           onClose={() => setModal(null)}
//           onSave={(p) => {
//             setStore({ ...store, plan: p });
//             setModal(null);
//           }}
//         />
//       )}
//       {modal === "reveal" && (
//         <Modal title="Reveal balance" onClose={() => setModal(null)}>
//           <p className="modal-copy">
//             Enter your security password to reveal protected figures.
//           </p>
//           <Field
//             label="Security password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//           <button
//             className="primary wide"
//             onClick={() => {
//               if (password === store.plan.password) {
//                 setShowBalance(true);
//                 setModal(null);
//                 setPassword("");
//               } else alert("Incorrect password");
//             }}
//           >
//             Reveal balance
//           </button>
//         </Modal>
//       )}
//     </>
//   );
// }
// function SimpleAdd({ title, onClose, onSave, category, categories }) {
//   const [name, setName] = useState(""),
//     [sub, setSub] = useState(""),
//     [amount, setAmount] = useState(""),
//     [cat, setCat] = useState(categories?.[0]?.name || "");
//   return (
//     <Modal title={title} onClose={onClose}>
//       {!category && (
//         <label className="field">
//           <span>Main category</span>
//           <select value={cat} onChange={(e) => setCat(e.target.value)}>
//             {categories?.map((c) => (
//               <option key={c.id}>{c.name}</option>
//             ))}
//           </select>
//         </label>
//       )}
//       <Field
//         label={category ? "Main category name" : "New sub-category name"}
//         value={category ? name : sub}
//         onChange={(e) =>
//           category ? setName(e.target.value) : setSub(e.target.value)
//         }
//       />
//       {category && (
//         <Field
//           label="Optional sub-category"
//           value={sub}
//           onChange={(e) => setSub(e.target.value)}
//         />
//       )}
//       <Field
//         label="Initial amount (optional)"
//         type="number"
//         value={amount}
//         onChange={(e) => setAmount(e.target.value)}
//       />
//       <button
//         className="primary wide"
//         onClick={() =>
//           category ? onSave(name, sub, amount) : onSave(cat, sub, amount)
//         }
//       >
//         Save
//       </button>
//     </Modal>
//   );
// }
// function PlanModal({ plan, onClose, onSave }) {
//   const [p, setP] = useState(plan);
//   return (
//     <Modal title="Monthly plan" onClose={onClose}>
//       <p className="modal-copy">
//         Keep your salary and savings settings protected and out of the main
//         dashboard.
//       </p>
//       <Field
//         label="Monthly salary"
//         type="number"
//         value={p.salary}
//         onChange={(e) => setP({ ...p, salary: Number(e.target.value) })}
//       />
//       <Field
//         label="Savings percentage"
//         type="number"
//         min="0"
//         max="100"
//         value={p.savings}
//         onChange={(e) => setP({ ...p, savings: Number(e.target.value) })}
//       />
//       <Field
//         label="Security password"
//         type="password"
//         value={p.password}
//         onChange={(e) => setP({ ...p, password: e.target.value })}
//       />
//       <button className="primary wide" onClick={() => onSave(p)}>
//         Save monthly plan
//       </button>
//     </Modal>
//   );
// }
