import { useState } from "react";
import { Modal, Field } from "../components/CommonComponents";
import { addExpense, addCategory, addSub } from "../utils/storeActions";
import { PlanModal, SimpleAdd } from "./Modals";
export default function ModalsSection({
  modal,
  setModal,
  today,
  user,
  store,
  setStore,
  setShowBalance,
  savePlan,
}) {
  const [password, setPassword] = useState("");
  const [expense, setExpense] = useState({
    category: "",
    subcategory: "",
    amount: "",
    note: "",
  });

  return (
    <>
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
      )}

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
      )}
    </>
  );
}
