import React from 'react';
import { Card } from 'reactstrap';
import BaseMap from '../../../../components/BaseMap/BaseMap';
import PropTypes from 'prop-types';
import SearchButton from '../../../../components/SearchButton';

const MapSection = ({
  viewState,
  iconLayer,
  getPeopleByArea,
  handleViewStateChange,
  setNewWidth,
  setNewHeight
}) => {

  const getSearchButton = (index) => {
    return (
      <SearchButton
        index={index}
        getInfoByArea={getPeopleByArea}
      />
    )
  }

  return (
    <Card className='map-card mb-0' style={{ height: 730 }}>
      <BaseMap
        layers={[iconLayer]}
        initialViewState={viewState}
        widgets={[getSearchButton]}
        onViewStateChange={handleViewStateChange}
        setWidth={setNewWidth}
        setHeight={setNewHeight}
        screenControlPosition='top-right'
        navControlPosition='bottom-right'
      />
    </Card>
  )
}

MapSection.propTypes = {
  viewState: PropTypes.any,
  iconLayer: PropTypes.any,
  getPeopleByArea: PropTypes.func,
  handleViewStateChange: PropTypes.func,
  setNewWidth: PropTypes.func,
  setNewHeight: PropTypes.func
}

export default MapSection;
