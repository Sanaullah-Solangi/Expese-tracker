import { FileDown } from "lucide-react";
import { Filters } from "./CommonComponents";

export default function FilterSection({
  filters,
  setFilters,
  categories,
  exportData,
}) {
  return (
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
        categories={categories}
      />
    </section>
  );
}
