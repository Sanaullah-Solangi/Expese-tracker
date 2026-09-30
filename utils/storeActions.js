// const addExpense = () => {
//   if (!expense.category || !expense.subcategory || !expense.amount) return;
//   const item = {
//     ...expense,
//     amount: Number(expense.amount),
//     date: today,
//     userId: user.uid,
//   };
//   setStore({ ...store, expenses: [...store.expenses, item] });
//   setExpense({ category: "", subcategory: "", amount: "", note: "" });
//   setModal(null);
// };

import { capitalizeWords } from "./storage";

const addExpense = (
  expense,
  setExpense,
  today,
  user,
  store,
  setStore,
  setModal,
) => {
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

const addCategory = (name, sub, amount, store, setStore, setModal) => {
  if (!name) return;
  const formattedName = capitalizeWords(name);
  const formattedSub = sub ? capitalizeWords(sub) : "";

  setStore({
    ...store,
    categories: [
      ...store.categories,
      {
        id: Date.now().toString(),
        name: formattedName,
        subcategories: formattedSub
          ? [
              {
                id: Date.now().toString() + "s",
                name: formattedSub,
                amount: Number(amount) || 0,
              },
            ]
          : [],
      },
    ],
  });
  setModal(null);
};

const addSub = (cat, name, amount, store, setStore, setModal) => {
  if (!cat || !name) return;
  const formattedName = capitalizeWords(name);

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
                name: formattedName,
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
  a?.click();
};

const savePlan = (p, store, setStore, setModal) => {
  setStore({ ...store, plan: p });
  setModal(null);
};

export { addExpense, addCategory, addSub, exportData, savePlan };
