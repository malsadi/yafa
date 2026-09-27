import { Navigate, type RouteObject } from 'react-router';
import { EventOrganiserLayout } from './event-organiser-layout';
import { EventPage } from './event-page';
import { EventsPage } from './events-page';
import { NewEventPage } from './new-event-page';
import { TemplatesPage } from './templates-page';

/** Brief 21: the Event organiser's pages, for the selected unit. */
export const eventOrganiserRoutes: RouteObject = {
  path: 'event-organiser',
  element: <EventOrganiserLayout />,
  children: [
    { index: true, element: <Navigate to="events" replace /> },
    { path: 'events', element: <EventsPage /> },
    { path: 'events/new', element: <NewEventPage /> },
    { path: 'events/:eventId', element: <EventPage /> },
    { path: 'templates', element: <TemplatesPage /> },
  ],
};
