import { FlyToInterpolator, IconLayer } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';
import { MAP_TYPES } from '../constants/common';

import spritesheet from '../assets/images/mappins/icons-safers-pins-simple.svg'
import iconMapping from '../assets/images/mappins/map-pin-atlas.json';

const EARTH_CIR_METERS = 40075016.686;
const DEGREES_PER_METER = 360 / EARTH_CIR_METERS;

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
          object: selectedAlert,
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
    getFillColor: [192, 105, 25],
    getLineColor: [0, 0, 0],
    getLineWidth: 100
  }))
}

const getIconFromContext = (mapType, feature) => {
  // return spritesheet icon name from type of map and feature
  // this maps into the name of a marker in the spritesheet json file
  let prefix = '';
  switch (mapType) {
  case MAP_TYPES.ALERTS:
    prefix = 'flame';
    break;
  case MAP_TYPES.CHATBOT_PEOPLE:
    prefix = 'people';
    break;
  case MAP_TYPES.CHATBOT_COMMS:
    prefix = 'notification';
    break;
  case MAP_TYPES.CHATBOT_REPORTS:
  case MAP_TYPES.REPORTS:
    prefix = 'report';
    break;
  case MAP_TYPES.IN_SITU:
    prefix = 'camera';
    break;
  default:
    prefix = 'flame';
    break;
  }
  let suffix = 'primary';
  switch (mapType) {
  case MAP_TYPES.IN_SITU:
  case MAP_TYPES.REPORTS:
  case MAP_TYPES.CHATBOT_REPORTS:
    suffix = feature.isSelected ? 'active' : 'primary';
    break;
  default:
    suffix = feature.isSelected ? 'active' : feature.status == 'CLOSED' ? 'secondary' : 'primary';
    break;
  }
  console.log(`Icon is ${prefix}-${suffix}`)
  return `${prefix}-${suffix}`;
}

export const getIconLayer = (alerts, mapType = MAP_TYPES.alerts) => {
  //const icon = mapType == MAP_TYPES.REPORTS || MAP_TYPES.IN_SITU ? locationPin : firePin
  const icon = spritesheet;
  return (new IconLayer({
    data: alerts,
    pickable: true,
    getPosition: d => {
      switch (mapType) {
      case MAP_TYPES.EVENTS:
        return d.center
        // case MAP_TYPES.REPORTS:
        //   return d.location
      default:
        return d.geometry.coordinates;
      }
    },
    iconAtlas: icon,
    iconMapping: iconMapping,
    // onHover: !hoverInfo.objects && setHoverInfo,
    id: 'icon',
    getIcon: (feature) => {
      console.log('feature', feature);
      return getIconFromContext(mapType, feature);
    },
    // getColor: d => {
    //   switch (mapType) {
    //   case MAP_TYPES.REPORTS:
    //     return (d.isSelected ? ORANGE : DARK_GRAY);
    //   case MAP_TYPES.IN_SITU:
    //     return (d.isSelected ? ORANGE : DARK_GRAY);
    //   default:
    //     return (d.isSelected ? ORANGE : d.status == 'CLOSED' ? GRAY : RED);
    //   }
    // },
    getSize: () => 50,
    // sizeMinPixels: 80,
    // sizeMaxPixels: 100,
    // sizeScale: 0.5,
  }))
}

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
