export const SLIDER_SPEED = 2500;

export const DATA_LAYERS_PANELS = {
  mapLayers: 0,
  onDemandMapLayers: 1,
  fireAndBurnedAreas: 2,
  postEventMonitoring: 3,
  wildfireSimulation: 4,
};

// increase the bbox used to view Wildfire layers by 20 kms
export const DEFAULT_WILDFIRE_GEOMETRY_BUFFER = 5;

export const SIMULATION_TIME_LIMIT = 72;

export const DEFAULT_FIRE_BREAK_TYPE = 'canadair';

export const BOUNDARY_CONDITIONS_TABLE_HEADERS = [
  'timeHours',
  'windDirection',
  'windSpeed',
  'fuelMoistureContent',
  'fireBreakType',
  'fireBreakData',
];

export const PROBABILITY_INFO =
  'PROPAGATOR output for each time step is a probability (from 0 to 1) field that expresses for each pixel the probability of the fire to reach that specific point in the given time step. In order to derive a contour, we can select to show the contour related to the 0.5, 0.75 and 0.9 of the probability.  For example, the 50% - 0.5 probability contour encapsulates all the pixels who have more than 50% of probability to be reached by fire at the given simulation time.';

export const PROBABILITY_RANGES = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '90%', value: 0.9 },
];

export const FIRE_BREAK_OPTIONS = [
  { label: 'Canadair', value: 'canadair' },
  { label: 'Helicopter', value: 'helicopter' },
  { label: 'Water Line', value: 'waterLine' },
  { label: 'Vehicle', value: 'vehicle' },
];

export const FIRE_BREAK_STROKE_COLORS = {
  canadair: 'rgb(255, 0, 0)',
  helicopter: 'rgb(0,255,0)',
  waterLine: 'rgb(255, 255, 0)',
  vehicle: 'rgb(0, 0, 255)',
};

export const BOUNDARY_CONDITION_INITIAL_STATE = {
  windDirection: '',
  windSpeed: '',
  fuelMoistureContent: '',
  fireBreak: {},
};

export const EUROPEAN_BBOX = [-18.36914, 14.51978, 41.660156, 71.130987];

// The other two On-Demand forms allow user to select these from a dropdown.
// For this form we hard-code the list and pass along to the API
// when we reshape the form data for submission
export const WILDFIRE_LAYER_TYPES = [
  { id: '35011', name: 'Max rate of spread' },
  { id: '35010', name: 'Mean rate of spread' },
  { id: '35009', name: 'Max fireline intensity' },
  { id: '35008', name: 'Mean fireline intensity' },
  { id: '35007', name: 'Fire perimeter simulation as isochrones maps' },
];
