// src/lib/filter-utils.ts
/**
 * Utility functions for handling URL search params and filters
 */

/**
 * Updates URL search parameters for filters
 * @param searchParams - Current URLSearchParams
 * @param key - Filter key to update
 * @param value - New value for the filter
 * @returns Updated URLSearchParams
 */
export function updateFilterParams(
  searchParams: URLSearchParams,
  key: string,
  value: string
): URLSearchParams {
  const params = new URLSearchParams(searchParams);
  
  if (value === "ALL" || value === "" || value === null || value === undefined) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  
  return params;
}

/**
 * Clears dependent filters when a parent filter changes
 * @param params - URLSearchParams to modify
 * @param parentKey - The parent filter that changed
 */
export function clearDependentFilters(params: URLSearchParams, parentKey: string): void {
  switch (parentKey) {
    case 'grade':
      params.delete('groupDay');
      params.delete('groupTime');
      params.delete('section');
      break;
    case 'groupDay':
      params.delete('groupTime');
      break;
  }
}

/**
 * Validates filter combinations to ensure they are logically consistent
 * @param grade - Selected grade
 * @param section - Selected section
 * @param groupDay - Selected group day
 * @param groupTime - Selected group time
 * @returns Object indicating if combination is valid and any issues
 */
export function validateFilterCombination(
  grade?: string | null,
  section?: string | null,
  groupDay?: string | null,
  groupTime?: string | null
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check if section is valid for the selected grade
  if (grade && section) {
    // Add validation logic based on scheduleData if needed
  }
  
  // Check if groupDay is valid for the selected grade/section
  if (grade && groupDay) {
    // Add validation logic based on scheduleData if needed
  }
  
  // Check if groupTime is valid for the selected groupDay
  if (groupDay && groupTime) {
    // Add validation logic based on scheduleData if needed
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Gets available options for a dependent filter based on parent selections
 * @param parentFilter - The parent filter type
 * @param parentValue - The selected value of the parent filter
 * @param scheduleData - The schedule data object
 * @returns Array of available options
 */
export function getDependentFilterOptions(
  parentFilter: string,
  parentValue: string,
  scheduleData: any
): string[] {
  if (!parentValue || parentValue === 'ALL') {
    return [];
  }
  
  switch (parentFilter) {
    case 'grade':
      if (scheduleData[parentValue]) {
        return Object.keys(scheduleData[parentValue].groupDays || {});
      }
      break;
    case 'groupDay':
      // This would need the grade context as well
      break;
  }
  
  return [];
}