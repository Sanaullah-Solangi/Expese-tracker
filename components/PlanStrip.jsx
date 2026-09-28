import { formatMoney } from "../utils/storage";

export default function PlanStrip({ store, savings }) {
  return (
    <section className="plan-strip">
      <div>
        <span className="eyebrow">MONTHLY PLAN</span>
        <b>Make your money work smarter</b>
      </div>
      <div className="plan-meta">
        <span>
          Salary <b>{formatMoney(store?.plan?.salary)}</b>
        </span>
        <span>
          Savings target <b>{store?.plan?.savings}%</b>
        </span>
        <span className="budget">
          Working budget <b>{formatMoney(store?.plan?.salary - savings)}</b>
        </span>
      </div>
    </section>
  );
}
