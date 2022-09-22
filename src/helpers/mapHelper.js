import { FlyToInterpolator } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';
import { GeoJsonPinLayer } from '../components/BaseMap/GeoJsonPinLayer';

const EARTH_CIR_METERS = 40075016.686;
const DEGREES_PER_METER = 360 / EARTH_CIR_METERS;

const ORANGE = [226, 123, 29];
const GRAY = [128, 128, 128];
const RED = [230, 51, 79];
const DARK_GRAY = [57, 58, 58];

const ALERT_TYPES = {
  red: ['Created', 'Active', 'Ongoing'],
  gray: ['Notified', 'Closed']
};

export const getViewState = (midPoint, zoomLevel = 4, selectedAlert, setHoverInfoRef = () => { }, setViewStateChangeRef = () => { }) => {
  return {
    midPoint: midPoint,
    longitude: selectedAlert ? getShiftedLongitude(midPoint[0], zoomLevel) : midPoint[0],
    latitude: midPoint[1],
    zoom: zoomLevel,
    pitch: 0,
    bearing: 0,
    transitionDuration: 1000,
    transitionInterpolator: new FlyToInterpolator(),
    onTransitionEnd: () => {
      if (selectedAlert) {
        setHoverInfoRef({
          object: {
            properties: selectedAlert,
          },
          coordinate: selectedAlert?.center || selectedAlert?.geometry?.coordinates
        });
        setViewStateChangeRef(false);
      }
    }
  };
}

export const getPolygonLayer = (aoi) => {
  const coordinates = aoi.features[0].geometry.coordinates;
  return (new PolygonLayer({
    id: 'polygon-layer',
    data: coordinates,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false,
    wireframe: true,
    lineWidthMinPixels: 1,
    opacity: .25,
    getPolygon: d => d,
    // getElevation: () => 10,
    getFillColor: [192, 105, 25],
    getLineColor: [0, 0, 0],
    getLineWidth: 100
  }))
}

export const getAlertIconColorFromContext = (mapType, feature, selectedItem = {}) => {
  let color = DARK_GRAY;
  if (!feature.properties.id && !selectedItem.id) {
    return color;
  }

  if (feature.properties.id === selectedItem.id) {
    color = ORANGE;
  } else if (ALERT_TYPES.red.includes(feature?.properties?.status)) {
    color = RED;
  } else if (ALERT_TYPES.gray.includes(feature?.properties?.status)) {
    return GRAY;
  }
  return color;
}


export const getAsGeoJSON = (data) => {
  return data.map((datum) => {
    const {
      geometry,
      ...properties
    } = datum;
    return {
      type: 'Feature',
      properties,
      geometry,
    };
  });
}

export const getIconLayer = (alerts, mapType, markerName='alert', dispatch, setViewState, selectedItem = {}) => {
  const data = getAsGeoJSON(alerts);
  return new GeoJsonPinLayer({
    data,
    dispatch,
    setViewState,
    getPosition: (feature) => feature.geometry.coordinates,
    getPinColor: feature => getAlertIconColorFromContext(mapType, feature, selectedItem),
    icon: markerName,
    iconColor: '#ffffff',
    clusterIconSize: 35,
    getPinSize: () => 35,
    pixelOffset: [-18,-18],
    pinSize: 25
  });
};

const toRadians = (degrees) => {
  return degrees * Math.PI / 180;
};

export const getBoundingBox = (midPoint, zoomLevel, width = 600, height = 600) => {
  const lat = midPoint[1];
  const lng = midPoint[0];
  const metersPerPixelEW = EARTH_CIR_METERS / Math.pow(2, zoomLevel + 8);
  const metersPerPixelNS = EARTH_CIR_METERS / Math.pow(2, zoomLevel + 8) * Math.cos(toRadians(lat));

  const shiftMetersEW = width / 4 * metersPerPixelEW;
  const shiftMetersNS = height / 4 * metersPerPixelNS;

  const shiftDegreesEW = shiftMetersEW * DEGREES_PER_METER;
  const shiftDegreesNS = shiftMetersNS * DEGREES_PER_METER;
  //[west, south, east, north]
  return [lng - shiftDegreesEW, lat - shiftDegreesNS, lng + shiftDegreesEW, lat + shiftDegreesNS];
}

const getShiftedLongitude = (lng, zoomLevel, width = 150) => {
  const metersPerPixelEW = EARTH_CIR_METERS / Math.pow(2, zoomLevel + 8);
  const shiftMetersEW = width / 4 * metersPerPixelEW;

  const shiftDegreesEW = shiftMetersEW * DEGREES_PER_METER;
  return (lng + shiftDegreesEW);

}
