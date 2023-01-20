import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { Row } from 'reactstrap';
import { getAlertIconColorFromContext } from '../../../helpers/mapHelper';
import { PAGE_SIZE } from '../../../store/events/types';
import Alert from './Alert';
import PaginationWrapper from '../../../components/Pagination';
import { GeoJsonPinLayer } from '../../../components/BaseMap/GeoJsonPinLayer';
import { MAP_TYPES } from '../../../constants/common';
import { useDispatch } from 'react-redux';

const EventList = ({
  alertId,
  setAlertId,
  filteredAlerts,
  paginatedAlerts,
  hideTooltip,
  setFavorite,
  setIconLayer,
  setPaginatedAlerts,
  setSelectedAlert
}) => {

  const dispatch = useDispatch();
  const [, setViewState] = useState({});

  const getIconLayer = (alerts) => {
    const data = alerts?.map((alert) => {
      const {
        geometry,
        ...properties
      } = alert;
      return {
        type: 'Feature',
        properties: properties,
        geometry: geometry,
      };
    });

    return new GeoJsonPinLayer({
      data,
      dispatch,
      setViewState,
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

  const setPageData = pageData => {
    setAlertId(undefined);
    setIconLayer(getIconLayer(filteredAlerts));
    hideTooltip();
    setPaginatedAlerts(pageData);
  };

  return (
    <>
      <Row data-testid='event-list'>
        {
          paginatedAlerts.map((alert) => <Alert
            key={alert.id}
            card={alert}
            setSelectedAlert={setSelectedAlert}
            setFavorite={setFavorite}
            alertId={alertId}
          />)
        }
      </Row>

      <Row className='text-center my-1'>
        <PaginationWrapper pageSize={PAGE_SIZE} list={filteredAlerts} setPageData={setPageData} />
      </Row>
    </>)
}

EventList.propTypes = {
  alertId: PropTypes.string,
  setAlertId: PropTypes.func,
  filteredAlerts: PropTypes.array,
  paginatedAlerts: PropTypes.array,
  currentPage: PropTypes.number,
  hideTooltip: PropTypes.func, setPaginatedAlerts: PropTypes.func,
  setCurrentPage: PropTypes.func,
  setFavorite: PropTypes.func,
  setIconLayer: PropTypes.func,
  setSelectedAlert: PropTypes.func,
}

export default EventList;