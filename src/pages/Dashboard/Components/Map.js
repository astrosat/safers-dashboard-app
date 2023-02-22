import React, { useMemo } from 'react';

import { BitmapLayer } from 'deck.gl';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Card, Row } from 'reactstrap';

import { useMap } from 'components/BaseMap/MapContext';
import { MAP_TYPES } from 'constants/common';

import BaseMap from '../../../components/BaseMap/BaseMap';
import {
  getPolygonLayer,
  getViewState,
  getEventIconLayer,
  getBitmapLayer,
} from '../../../helpers/mapHelper';

const MapComponent = ({
  selectedLayer, // raster layer
  eventList = [],
  orgPplList = [],
  orgReportList = [],
  commsList = [],
  missionsList = [],
  alertsList = [],
  visibleLayers = {},
}) => {
  const { setViewState } = useMap();

  const objAoi = useSelector(state => state.user.defaultAoi);
  const polygonLayer = useMemo(() => getPolygonLayer(objAoi), [objAoi]);

  const mapRequestLayer = useMemo(() => {
    if (Object.keys(selectedLayer).length === 0) return null;
    const [minX, minY, maxX, maxY] = selectedLayer.bbox;
    const midpoint = [(minX + maxX) / 2, (minY + maxY) / 2];
    const zoom = 10;
    const newViewState = getViewState(midpoint, zoom);
    setViewState(newViewState);
    return selectedLayer?.geometry ? getBitmapLayer(selectedLayer) : null;
  }, [selectedLayer, setViewState]);

  const iconLayer = useMemo(
    () =>
      getEventIconLayer(
        'events-layer',
        eventList,
        MAP_TYPES.ALERTS,
        'flag',
        visibleLayers.events,
      ),
    [eventList, visibleLayers.events],
  );

  const missionsLayer = useMemo(
    () =>
      getEventIconLayer(
        'missions-layer',
        missionsList.filter(item => item?.geometry?.coordinates?.length > 0),
        MAP_TYPES.MISSIONS,
        'target',
        visibleLayers.missions,
      ),
    [missionsList, visibleLayers.missions],
  );

  const alertsLayer = useMemo(
    () =>
      getEventIconLayer(
        'alerts-layer',
        alertsList.filter(
          item =>
            item?.geometry?.features[0]?.geometry?.coordinates?.length > 0,
        ),
        MAP_TYPES.ALERTS,
        'fire',
        visibleLayers.alerts,
      ),
    [alertsList, visibleLayers.alerts],
  );

  const peopleLayer = useMemo(
    () =>
      getEventIconLayer(
        'people-layer',
        orgPplList.filter(item => item?.geometry?.coordinates?.length > 0),
        MAP_TYPES.PEOPLE,
        'people',
        visibleLayers.people,
      ),
    [orgPplList, visibleLayers.people],
  );

  const reportLayer = useMemo(
    () =>
      getEventIconLayer(
        'report-layer',
        orgReportList.filter(item => item?.geometry?.coordinates?.length > 0),
        MAP_TYPES.REPORTS,
        'report',
        visibleLayers.reports,
      ),
    [orgReportList, visibleLayers.reports],
  );

  const commsLayer = useMemo(
    () =>
      getEventIconLayer(
        'comms-layer',
        commsList.filter(item => item?.geometry?.coordinates?.length > 0),
        MAP_TYPES.COMMUNICATIONS,
        'communications',
        visibleLayers.communications,
      ),
    [commsList, visibleLayers.communications],
  );

  const allLayers = [
    polygonLayer,
    iconLayer,
    alertsLayer,
    missionsLayer,
    peopleLayer,
    reportLayer,
    commsLayer,
    mapRequestLayer,
  ];

  return (
    <Card className="map-card">
      <Row style={{ height: 550 }} className="mx-auto">
        <BaseMap
          layers={allLayers}
          screenControlPosition="top-right"
          navControlPosition="bottom-right"
        />
      </Row>
    </Card>
  );
};

MapComponent.propTypes = {
  eventList: PropTypes.arrayOf(PropTypes.any),
};

export default MapComponent;
