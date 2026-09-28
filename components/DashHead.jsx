import { Plus } from "lucide-react";

export default function DashHead({ user, setModal }) {
  return (
    <div className="dash-head">
      <div>
        <span className="eyebrow plain">
          {new Date()
            .toLocaleDateString("en-US", { month: "long", year: "numeric" })
            .toUpperCase()}
        </span>
        <h2>Good evening, {user?.displayName?.split(" ")[0] || "there"}</h2>
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
  );
}
