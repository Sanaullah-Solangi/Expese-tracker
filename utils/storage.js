const KEY = "spendwise-expenses-v1";

const seed = {
  plan: { salary: 80000, savings: 10, password: "1234" },
  categories: [
    {
      id: "ghar",
      name: "Ghar",
      subcategories: [
        { id: "food", name: "Food", amount: 0 },
        { id: "bills", name: "Bills", amount: 0 },
      ],
    },
    { id: "medical", name: "Medical", subcategories: [] },
    { id: "travel", name: "Travel", subcategories: [] },
  ],
  expenses: [],
};

const todayKey = () => new Date().toISOString().slice(0, 10);

const fullTimestamp = () => {
  const now = new Date();
  const formatted = now.toISOString().slice(0, 19).replace("T", " ");
  return formatted;
  // Output: 2026-06-07 14:30:00
};

function loadStore() {
  if (typeof window === "undefined") return seed;
  try {
    return JSON.parse(localStorage.getItem(KEY)) || seed;
  } catch {
    return seed;
  }
}

function saveStore(store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("spendwise-sync"));
}

function queueSync() {
  if (typeof navigator !== "undefined" && navigator.onLine) return true;
  return false;
}

function formatMoney(value) {
  return `Rs ${Math.round(value || 0).toLocaleString("en-IN")}`;
}

const isInRange = (dateStr, start, end) => {
  const d = dateStr ? dateStr.slice(0, 10) : "";
  const s = start ? start.slice(0, 10) : "";
  const e = end ? end.slice(0, 10) : "";
  return (!s || d >= s) && (!e || d <= e);
};

const capitalizeWords = (str) => {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

if (typeof window !== "undefined")
  window.addEventListener("online", () =>
    window.dispatchEvent(new Event("spendwise-sync")),
  );

export {
  seed,
  todayKey,
  fullTimestamp,
  loadStore,
  saveStore,
  queueSync,
  formatMoney,
  isInRange,
  capitalizeWords,
};
