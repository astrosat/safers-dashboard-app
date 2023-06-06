import React from 'react';

import PropTypes from 'prop-types';
import { Card } from 'reactstrap';

import BaseMap from 'components/BaseMap/BaseMap';
import PolygonMap from 'components/BaseMap/PolygonMap';
import SearchButton from 'components/SearchButton';

const MapSection = ({
  iconLayer,
  getInfoByArea,
  coordinates,
  setCoordinates,
  togglePolygonMap = false,
  onClick,
  clearMap,
}) => {
  const getSearchButton = index => {
    return <SearchButton index={index} getInfoByArea={getInfoByArea} />;
  };

  return (
    <Card className="map-card mb-0" style={{ height: 730 }}>
      {!togglePolygonMap ? (
        <BaseMap
          layers={[iconLayer]}
          widgets={[getSearchButton]}
          onClick={onClick}
        />
      ) : (
        <PolygonMap
          layers={[iconLayer]}
          onClick={onClick}
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          clearMap={clearMap}
        />
      )}
    </Card>
  );
};

MapSection.propTypes = {
  iconLayer: PropTypes.any,
  getInfoByArea: PropTypes.func,
  coordinates: PropTypes.any,
  setCoordinates: PropTypes.func,
  togglePolygonMap: PropTypes.any,
  onClick: PropTypes.func,
  clearMap: PropTypes.func,
};

export default MapSection;
