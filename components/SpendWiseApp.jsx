"use client";

import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase.config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { exportData, savePlan } from "../utils/storeActions.js";

import {
  isInRange,
  loadStore,
  queueSync,
  saveStore,
  fullTimestamp,
} from "../utils/storage";

import {
  Header,
  Login,
  DashHead,
  ContentGrid,
  FilterSection,
  ModalsSection,
  PlanStrip,
  StatsSection,
} from "../components/index.jsx";

export default function SpendWiseApp() {
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [showBalance, setShowBalance] = useState(false);
  const [store, setStore] = useState(loadStore);
  const [open, setOpen] = useState("ghar");

  const [filters, setFilters] = useState({
    start: "",
    end: "",
    category: "",
    min: "",
    max: "",
    search: "",
  });

  useEffect(() => {
    if (auth) return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    saveStore(store);
    queueSync();
  }, [store]);

  const today = fullTimestamp();
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
        {/* === GREETINGS & ACTIONS === */}
        <DashHead user={user} setModal={setModal} />

        {/* === PLAN SECTION === */}
        <PlanStrip store={store} savings={savings} />

        {/* === STATISTICS SECTION === */}
        <StatsSection
          store={store}
          total={total}
          savings={savings}
          daily={daily}
          showBalance={showBalance}
          setModal={setModal}
        />

        {/* === FILTERS SECTION === */}
        <FilterSection
          filters={filters}
          setFilters={setFilters}
          categories={store?.categories}
          exportData={exportData}
        />

        {/* === MAIN-CONTENT SECTION === */}
        <ContentGrid
          store={store}
          visibleExpenses={visibleExpenses}
          open={open}
          setOpen={setOpen}
          setModal={setModal}
          daily={daily}
          total={total}
        />
      </main>

      {/* === MODAL SECTION === */}
      <ModalsSection
        modal={modal}
        setModal={setModal}
        today={today}
        user={user}
        store={store}
        setStore={setStore}
        setShowBalance={setShowBalance}
        savePlan={(p) => savePlan(p, store, setStore, setModal)}
      />
    </>
  );
}
