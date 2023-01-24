import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row } from 'reactstrap';
import BaseMap from '../../../components/BaseMap/BaseMap';
import { getPolygonLayer } from '../../../helpers/mapHelper';
import { getViewState } from '../../../helpers/mapHelper';
import PropTypes from 'prop-types';
import { getEventIconLayer } from '../../../helpers/mapHelper';

const MapComponent = ({ viewState, eventList }) => {
  const objAoi = useSelector(state => state.user.defaultAoi);
  const polygonLayer = getPolygonLayer(objAoi);
  const iconLayer = getEventIconLayer(eventList);
  if(!viewState) {
    // default to user's AOI if not overriden
    viewState = getViewState(objAoi.features[0].properties.midPoint, objAoi.features[0].properties.zoomLevel);
  } 

  return (
    <Card className='map-card'>
      <Row style={{ height: 550 }} className="mx-auto">
        <BaseMap 
          layers={[polygonLayer, iconLayer]} 
          initialViewState={viewState} 
          screenControlPosition="top-right"
          navControlPosition="bottom-right"
        />
      </Row>
    </Card>

  );
}

MapComponent.propTypes = {
  viewState: PropTypes.any,
  eventList: PropTypes.arrayOf(PropTypes.any),
}

export default MapComponent;
