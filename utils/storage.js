const KEY = "spendwise-expenses-v1";

export const todayKey = () => new Date().toISOString().slice(0, 10);

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

export function loadStore() {
  if (typeof window === "undefined") return seed;
  try {
    return JSON.parse(localStorage.getItem(KEY)) || seed;
  } catch {
    return seed;
  }
}

export function saveStore(store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(store));
  window.dispatchEvent(new Event("spendwise-sync"));
}

export function queueSync() {
  if (typeof navigator !== "undefined" && navigator.onLine) return true;
  return false;
}

export function formatMoney(value) {
  return `Rs ${Math.round(value || 0).toLocaleString("en-IN")}`;
}

export function isInRange(date, start, end) {
  return (!start || date >= start) && (!end || date <= end);
}

if (typeof window !== "undefined")
  window.addEventListener("online", () =>
window.dispatchEvent(new Event("spendwise-sync")),
  );

export { seed };