import { DashboardData } from '../types/navigation';
import { mockDashboardData } from '../data/mockData';

/**
 * Frontend data access hook for navigation and telemetry data.
 *
 * ARCHITECTURAL ROLE:
 * Serves as the clean data access boundary between the UI layer (DashboardScreen)
 * and the underlying data source.
 *
 * CURRENT DATA SOURCE (Phase 9):
 * Ingests baseline mock telemetry data from `mobile/src/data/mockData.ts`.
 *
 * FUTURE INTEGRATION POINT:
 * This hook is structured to be the single point of replacement when connecting
 * to live telemetry streams from the native layer, TypeScript engine, or global store,
 * without requiring any modifications to DashboardScreen or its child components.
 *
 * @returns {DashboardData} Strongly typed telemetry and navigation data for the dashboard.
 */
export const useNavigationData = (): DashboardData => {
  // Current source: baseline mock telemetry data
  return mockDashboardData;
};
