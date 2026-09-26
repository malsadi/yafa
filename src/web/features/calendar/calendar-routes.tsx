import type { RouteObject } from 'react-router';
import { CalendarPage } from './calendar-page';

/** Brief 19: the selected unit's calendar, and the phone calendar link (6.4). */
export const calendarRoutes: RouteObject = { path: 'calendar', element: <CalendarPage /> };
