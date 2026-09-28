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

export const addCategory = (name, sub, amount, store, setStore, setModal) => {
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
  a?.click();
};

export { addExpense, addCategory, addSub, exportData };
