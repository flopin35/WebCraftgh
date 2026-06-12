import { REQUEST_STATUSES } from '../../constants/requestStatuses';
import { templates } from '../../data/templates';
import './admin.css';

export default function AdminFilters({ filters, onChange }) {
  const handleChange = (event) => {
    const { name, value } = event.target;
    onChange({ ...filters, [name]: value });
  };

  return (
    <section className="admin-filters" aria-label="Search and filter requests">
      <div className="admin-filters__search">
        <label className="admin-filters__label" htmlFor="search">
          Search
        </label>
        <input
          id="search"
          name="search"
          type="search"
          className="admin-filters__input"
          placeholder="Customer name, phone, or receipt ID"
          value={filters.search}
          onChange={handleChange}
        />
      </div>

      <div className="admin-filters__grid">
        <div className="admin-filters__field">
          <label className="admin-filters__label" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            name="status"
            className="admin-filters__select"
            value={filters.status}
            onChange={handleChange}
          >
            <option value="">All statuses</option>
            {REQUEST_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filters__field">
          <label className="admin-filters__label" htmlFor="template">
            Template Type
          </label>
          <select
            id="template"
            name="template"
            className="admin-filters__select"
            value={filters.template}
            onChange={handleChange}
          >
            <option value="">All templates</option>
            {templates.map((template) => (
              <option key={template.id} value={template.name}>
                {template.name}
              </option>
            ))}
          </select>
        </div>

        <div className="admin-filters__field">
          <label className="admin-filters__label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            className="admin-filters__input"
            value={filters.date}
            onChange={handleChange}
          />
        </div>
      </div>
    </section>
  );
}
