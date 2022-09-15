import _ from 'lodash';
import Pagination from 'rc-pagination';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Row } from 'reactstrap';
import { getViewState } from '../../../helpers/mapHelper';
import { setCurrentPage, setInSituFavoriteAlert, setPaginatedAlerts, getCamera } from '../../../store/appAction';
import { PAGE_SIZE, SET_FAV_INSITU_ALERT_SUCCESS } from '../../../store/insitu/types';
import Alert from './Alert';
import { MAP_TYPES } from '../../../constants/common';
import { getAlertIconColorFromContext } from '../../../helpers/mapHelper';
import { GeoJsonPinLayer } from '../../../components/BaseMap/GeoJsonPinLayer';

const AlertList = ({
  alertId,
  viewState,
  setAlertId,
  currentZoomLevel,
  isViewStateChanged,
  setViewState,
  setIconLayer,
  setHoverInfo,
  setIsViewStateChanged,
  hideTooltip
}) => {
  const { paginatedAlerts, currentPage, filteredAlerts, cameraList, cameraInfo } = useSelector(state => state.inSituAlerts);
  const [selCam, setsSelCam] = useState(undefined);

  const dispatch = useDispatch();

  const getIconLayer = (alerts) => {
    return new GeoJsonPinLayer({
      data: alerts,
      dispatch,
      setViewState,
      getPosition: (feature) => feature.geometry.coordinates,
      getPinColor: feature => getAlertIconColorFromContext(MAP_TYPES.IN_SITU,feature),
      icon: 'camera',
      iconColor: '#ffffff',
      clusterIconSize: 35,
      getPinSize: () => 35,
      pixelOffset: [-18,-18],
      pinSize: 25,
      onGroupClick: true,
      onPointClick: true,
    });
  };

  useEffect(() => {
    if (selCam) {
      !_.isEqual(viewState.midPoint, cameraInfo?.geometry?.coordinates) || isViewStateChanged ?
        setViewState(getViewState(cameraInfo?.geometry?.coordinates, currentZoomLevel, cameraInfo, setHoverInfo, setIsViewStateChanged))
        : setHoverInfo({ object: { properties: cameraInfo, geometry: cameraInfo?.geometry}, picked: true });
      setIconLayer(getIconLayer(cameraList.features, MAP_TYPES.IN_SITU));
    }
  }, [cameraInfo]);

  const setFavorite = (id) => {
    const selectedAlert = _.find(filteredAlerts, { id });
    dispatch(setInSituFavoriteAlert(id, !selectedAlert.favorite)).then((result) => {
      if (result.type === SET_FAV_INSITU_ALERT_SUCCESS) {
        selectedAlert.favorite = !selectedAlert.favorite;
        const to = PAGE_SIZE * currentPage;
        const from = to - PAGE_SIZE;
        dispatch(setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to))));
      }
    });
  }

  const setSelectedAlert = (id) => {
    if (id) {
      setAlertId(id);
      let alertsToEdit = _.cloneDeep(filteredAlerts);
      let selectedAlert = _.find(alertsToEdit, { id });
      let camera = _.find(cameraList.features, { properties: { id: selectedAlert.camera_id } });
      selectedAlert.isSelected = true;
      camera.isSelected = true;
      setsSelCam(camera);
      dispatch(getCamera(selectedAlert.camera_id));
    } else {
      setAlertId(undefined);
      setIconLayer(getIconLayer(cameraList.features, MAP_TYPES.IN_SITU));
    }
  }

  const updatePage = page => {
    setAlertId(undefined);
    setIconLayer(getIconLayer(cameraList.features, MAP_TYPES.IN_SITU));
    dispatch(setCurrentPage(page));
    const to = PAGE_SIZE * page;
    const from = to - PAGE_SIZE;
    hideTooltip();
    dispatch(setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to))));
  };

  return (
    <>
      <Row>
        {
          paginatedAlerts.map((alert, index) => <Alert
            key={index}
            card={alert}
            setSelectedAlert={setSelectedAlert}
            setFavorite={setFavorite}
            alertId={alertId} />)
        }
      </Row>
      <Row className='text-center'>
        <Pagination
          pageSize={PAGE_SIZE}
          onChange={updatePage}
          current={currentPage}
          total={filteredAlerts.length}
        />
      </Row>
    </>)
}

AlertList.propTypes = {
  alertId: PropTypes.any,
  viewState: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  isViewStateChanged: PropTypes.any,
  setViewState: PropTypes.func,
  setAlertId: PropTypes.func,
  setIconLayer: PropTypes.func,
  setHoverInfo: PropTypes.func,
  hideTooltip: PropTypes.func,
  setIsViewStateChanged: PropTypes.func,
}
export default AlertList;
