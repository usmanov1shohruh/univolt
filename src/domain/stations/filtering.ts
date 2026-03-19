import type { Station, Filters } from "@/types/station";

export function filterStations(
  stations: Station[],
  filters: Filters,
  query: string
): Station[] {
  let result = stations;

  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.operator.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q) ||
        s.district.toLowerCase().includes(q)
    );
  }

  if (filters.connector_types.length) {
    result = result.filter((s) =>
      s.connector_types.some((c) => filters.connector_types.includes(c))
    );
  }

  if (filters.charging_speeds.length) {
    result = result.filter((s) =>
      filters.charging_speeds.includes(s.charging_speed_category)
    );
  }

  if (filters.availability.length) {
    result = result.filter((s) =>
      filters.availability.includes(s.availability_status)
    );
  }

  if (filters.is_24_7 !== null) {
    result = result.filter((s) => s.is_24_7 === filters.is_24_7);
  }

  if (filters.parking_types.length) {
    result = result.filter((s) =>
      filters.parking_types.includes(s.parking_type)
    );
  }

  if (filters.operators.length) {
    result = result.filter((s) => filters.operators.includes(s.operator));
  }

  if (filters.districts.length) {
    result = result.filter((s) => filters.districts.includes(s.district));
  }

  return result;
}

export function countActiveFilters(filters: Filters): number {
  let count = 0;
  if (filters.connector_types.length) count++;
  if (filters.charging_speeds.length) count++;
  if (filters.availability.length) count++;
  if (filters.is_24_7 !== null) count++;
  if (filters.parking_types.length) count++;
  if (filters.operators.length) count++;
  if (filters.districts.length) count++;
  return count;
}

