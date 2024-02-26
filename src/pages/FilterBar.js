import React from "react";

const FilterBar = ({ statuses, currentFilter, onFilterChange }) => {
  return (
    <div className="filter-bar">
      {statuses &&
        Array.isArray(statuses) &&
        statuses.map((status) => (
          <button
            key={status.name}
            style={{ backgroundColor: status.color }}
            className={currentFilter === status.name ? "active" : ""}
            onClick={() => onFilterChange(status.name)}
          >
            {status.name} ({status.count})
          </button>
        ))}
    </div>
  );
};

export default FilterBar;
