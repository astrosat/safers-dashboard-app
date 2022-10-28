export const MAP_TYPES = {
  REPORTS: 'reports',
  ALERTS: 'alerts',
  EVENTS: 'events',
  IN_SITU: 'in-situ',
  COMMUNICATIONS: 'communications',
  PEOPLE: 'people',
  MISSIONS: 'missions'
}

export const MAP = {
  // 40,000 km2 = 40 million m2
  MAX_GEOMETRY_AREA : {
    label: '40,000 square kilometres',
    value: 40000000000
  }
}

export const GENERAL = {
  MILLISEC_TO_SECOND: 1000, 
  API_GAP: 60 // API is called before this many seconds, given any latency i.e. /oauth2/refresh to receive token before its expiry
}