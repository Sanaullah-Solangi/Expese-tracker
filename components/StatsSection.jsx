import { Wallet, Sparkles, CalendarDays, BarChart3 } from "lucide-react";
import { formatMoney } from "../utils/storage";
import { Stat } from "./CommonComponents";

export default function StatsSection({
  store,
  total,
  savings,
  daily,
  showBalance,
  setModal,
}) {
  return (
    <div className="stats">
      <Stat
        label="Total balance"
        value={formatMoney(store?.plan?.salary - total)}
        hint="Password protected"
        icon={<Wallet size={16} />}
        hidden={!showBalance}
        onReveal={() => setModal("reveal")}
      />
      <Stat
        label="Total savings"
        value={formatMoney(savings)}
        hint={`${store?.plan?.savings}% target set aside`}
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
        hint={`${store?.expenses?.length} entries this month`}
        icon={<Wallet size={16} />}
      />
      <Stat
        label="Target progress"
        value={`${Math.min(100, Math.round((total / Math.max(1, store?.plan?.salary - savings)) * 100))}%`}
        hint="Spend discipline"
        icon={<BarChart3 size={16} />}
      />
    </div>
  );
}
