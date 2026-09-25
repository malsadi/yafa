/** Brief 25 A1: one system administrator, as the screen lists them. */
export interface SystemAdministratorListItem {
  personId: string;
  name: string;
  email: string;
  appointedAt: string;
}

/** Brief 25 A1: someone who may be appointed (a current General Council term). */
export interface SystemAdministratorCandidate {
  personId: string;
  name: string;
  email: string;
}
