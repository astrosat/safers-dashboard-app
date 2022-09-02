import { FlyToInterpolator, IconLayer } from 'deck.gl';
import { PolygonLayer } from '@deck.gl/layers';
import firePin from '../assets/images/atoms-general-icon-fire-drop.png'
import locationPin from '../assets/images/map/map.png';
import { MAP_TYPES } from '../constants/common';

const EARTH_CIR_METERS = 40075016.686;
const DEGREES_PER_METER = 360 / EARTH_CIR_METERS;
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 100, height: 100, mask: true }
};

const ORANGE = [226, 123, 29];
const GRAY = [128, 128, 128];
const RED = [230, 51, 79];
const DARK_GRAY = [57, 58, 58];

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
    // getElevation: () => 10,
    getFillColor: [192, 105, 25],
    getLineColor: [0, 0, 0],
    getLineWidth: 100
  }))
}

export const getIconColorFromContext = (mapType, feature) => {
  let color = [127,127,127];
  switch (mapType) {
  case MAP_TYPES.REPORTS:
    color = feature?.isSelected ? ORANGE : DARK_GRAY;
    break;
  case MAP_TYPES.IN_SITU:
    color = feature?.isSelected ? ORANGE : DARK_GRAY;
    break;
  default:
    color = feature?.isSelected ? ORANGE : feature?.status == 'CLOSED' ? GRAY : RED;
  }
  console.log('icon color', color);
  return color;
}

export const getIconLayer = (alerts, mapType = MAP_TYPES.alerts, customIcon = '', customData = {}) => {
  const icon = customIcon? customIcon : (mapType == MAP_TYPES.REPORTS || MAP_TYPES.IN_SITU ? locationPin : firePin)
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
    iconMapping: ICON_MAPPING,
    // onHover: !hoverInfo.objects && setHoverInfo,
    id: 'icon',
    getIcon: () => 'marker',
    getColor: d => {
      switch (mapType) {
      case MAP_TYPES.REPORTS:
        return (d.isSelected ? ORANGE : DARK_GRAY);
      case MAP_TYPES.IN_SITU:
        return (d.isSelected ? ORANGE : DARK_GRAY);
      default:
        return (d.isSelected ? ORANGE : d.status == 'CLOSED' ? GRAY : RED);
      }
    },
    sizeMinPixels: 80,
    sizeMaxPixels: 100,
    sizeScale: 0.5,
    ...customData
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
