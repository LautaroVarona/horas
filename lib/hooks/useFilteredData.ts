"use client";

import { useMemo } from "react";
import {
  filterActivities,
  getDistinctClients,
  getDistinctMonths,
  groupByClient,
  groupByClientAndMonth,
  groupByMonth,
  totalHoras,
} from "../aggregations";
import { getFilterOptions } from "../aggregations";
import { useHorasStore } from "../store";

export function useFilteredData() {
  const activities = useHorasStore((s) => s.activities);
  const filters = useHorasStore((s) => s.filters);

  return useMemo(() => {
    const filtered = filterActivities(activities, filters);
    const options = getFilterOptions(activities);

    return {
      filtered,
      options,
      stats: {
        totalHoras: totalHoras(filtered),
        activityCount: filtered.length,
        clientCount: getDistinctClients(filtered),
        monthCount: getDistinctMonths(filtered),
      },
      byMonth: groupByMonth(filtered),
      byClient: groupByClient(filtered),
      byClientAndMonth: groupByClientAndMonth(filtered),
    };
  }, [activities, filters]);
}
