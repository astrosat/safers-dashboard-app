import { FlyToInterpolator } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';
import { GeoJsonPinLayer } from '../components/BaseMap/GeoJsonPinLayer';
import { fitBounds } from '@math.gl/web-mercator';
import wkt from 'wkt';
import { MAP_TYPES } from '../constants/common';

const EARTH_CIR_METERS = 40075016.686;
const DEGREES_PER_METER = 360 / EARTH_CIR_METERS;

const ORANGE = [226, 123, 29];
const GRAY = [128, 128, 128];
const RED = [230, 51, 79];
const DARK_GRAY = [57, 58, 58];

const ALERT_TYPES = {
  red: ['Created', 'Doing Activity', 'Ongoing', 'Available', 'Moving', 'Taken in Charge'],
  gray: ['Notified', 'Closed', 'Expired', 'Completed', 'Off']
};

/**
 * For the current viewport and bbox, figour out the new lat/lon/zoom
 * to apply to the map.
 */
export const getBoundedViewState = (deckRef, bbox) => {
  const viewport = deckRef.current.deck;
  const { width, height } = viewport;
  const padding = 250;

  const [minX, minY, maxX, maxY] = bbox;

  const bounds = [
    [minX, minY],
    [maxX, maxY],
  ];

  return fitBounds({
    bounds,
    width,
    height,
    padding,
  });

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
            geometry: {
              coordinates: selectedAlert?.center || selectedAlert?.geometry?.coordinates,
            }
          },
          picked: true
        });
        setViewStateChangeRef(false);
      }
    }
  };
}

export const getEventIconLayer = (alerts) => {
  // fetch Event icon layer for Dashboard
  const data = alerts?.map((alert) => {
    const {
      geometry,
      ...properties
    } = alert;
    return {
      type: 'Feature',
      properties: properties,
      geometry: geometry.features[0].geometry, // this seems wrong but it's how its shaped
    };
  });

  return new GeoJsonPinLayer({
    data,
    getPosition: (feature) => feature.geometry.coordinates,
    getPinColor: feature => getAlertIconColorFromContext(MAP_TYPES.EVENTS,feature),
    icon: 'flag',
    iconColor: '#ffffff',
    clusterIconSize: 35,
    getPinSize: () => 35,
    pixelOffset: [-18,-18],
    pinSize: 25,
    onGroupClick: true,
    onPointClick: true,
  });
};

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

const selectedItemIsInGroup = (selectedItem, clusterLeaves) => {
  const clusterLeafIds = clusterLeaves.map(feature => feature.properties.id);
  return clusterLeafIds.includes(selectedItem.id);
}

export const getAlertIconColorFromContext = (mapType, feature, selectedItem = {}, clusterLeaves) => {

  let color = DARK_GRAY;
  if (!feature.properties.id && !selectedItem.id) {
    return color;
  }

  if (feature.properties.cluster) {
    if (selectedItemIsInGroup(selectedItem, clusterLeaves)) {
      return ORANGE;
    }
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


export const getAsGeoJSON = (data) => data.map((datum) => {
  if (datum.type === 'Feature') return datum;
  const {
    geometry,
    ...properties
  } = datum;
  return {
    type: 'Feature',
    properties,
    geometry,
  };
})

export const getIconLayer = (alerts, mapType, markerName='alert', dispatch, setViewState, selectedItem = {}) => {
  const data = getAsGeoJSON(alerts);
  return new GeoJsonPinLayer({
    data,
    dispatch,
    setViewState,
    getPosition: (feature) => feature.geometry.coordinates,
    getPinColor: (feature, clusterLeaves) => getAlertIconColorFromContext(mapType, feature, selectedItem, clusterLeaves),
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

export const EPSG_4326 = 'EPSG4326';
export const EPSG_3857 = 'EPSG3857';

/* EPSG support ranges - validator obj  */

const VALIDATORS = {
  [EPSG_4326]: {
    longitude: [-180, 180],
    latitude: [-90, 90]
  },
  [EPSG_3857]: {
    longitude: [-180, 180],
    latitude: [-85.06, 85.06]
  },
};

/* Validate WKT and coordinates */

const areCoordsValid = ([long, lat], epsgCode=EPSG_3857) => {
  let isValid = false;
  const currentValidator = VALIDATORS[epsgCode];

  if (typeof long === 'number' && long >= currentValidator.longitude[0] && long <= currentValidator.longitude[1]) {
    if (typeof lat === 'number' && lat >= currentValidator.latitude[0] && lat <= currentValidator.latitude[1]) {
      isValid = true;
    }
  }

  return isValid;
}

export const isWKTValid = (str) => {
  const geoObj = wkt.parse(str);
  if(geoObj){
    const geometryArr = geoObj.geometries ? geoObj.geometries : [geoObj]; // Supports for both collections and single geometry
    return geometryArr.every(geometry => (geometry.coordinates[0].every(coord => areCoordsValid(coord))))
  }
  return !!geoObj;
}
