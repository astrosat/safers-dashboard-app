import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row } from 'reactstrap';

import BaseMap from '../../../components/BaseMap/BaseMap';

const MapComponent = () => {
  const { polygonLayer, viewState } = useSelector(state => state.common);
  return (
    <Card className='map-card'>
      <Row style={{ height: 350 }} className="mb-5">
        <BaseMap layers={[polygonLayer]} initialViewState={viewState} />
      </Row>
    </Card>

  );
}

export default MapComponent;