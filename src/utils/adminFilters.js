import { OVERVIEW_STATUS_MAP } from '../constants/requestStatuses';

export function getOverviewCounts(requests) {
  return {
    total: requests.length,
    pendingReview: requests.filter((request) => request.status === OVERVIEW_STATUS_MAP.pendingReview)
      .length,
    quotationReady: requests.filter((request) => request.status === OVERVIEW_STATUS_MAP.quotationReady)
      .length,
    inDevelopment: requests.filter((request) => request.status === OVERVIEW_STATUS_MAP.inDevelopment)
      .length,
    completed: requests.filter((request) => request.status === OVERVIEW_STATUS_MAP.completed).length,
  };
}

export function filterRequests(requests, { search, status, template, date }) {
  const query = search.trim().toLowerCase();

  return requests.filter((request) => {
    const matchesSearch =
      !query ||
      request.receiptId.toLowerCase().includes(query) ||
      request.customer.fullName?.toLowerCase().includes(query) ||
      request.customer.phone?.toLowerCase().includes(query);

    const matchesStatus = !status || request.status === status;
    const matchesTemplate = !template || request.template.name === template;
    const matchesDate = !date || isSameDay(request.createdAt, date);

    return matchesSearch && matchesStatus && matchesTemplate && matchesDate;
  });
}

function isSameDay(date, dateString) {
  if (!date || !dateString) return true;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}` === dateString;
}
