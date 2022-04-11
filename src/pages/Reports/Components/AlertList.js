import _ from 'lodash';
import Pagination from 'rc-pagination';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { getIconLayer } from '../../../helpers/mapHelper';
import { setAlertId, setCurrentPage, setInSituFavoriteAlert, setHoverInfo, setIconLayer, setMidpoint, setPaginatedAlerts, setZoomLevel } from '../../../store/insitu/action';
import { PAGE_SIZE } from '../../../store/insitu/types';
import Alert from './Alert';

const MAP_TYPE = 'reports';

const AlertList = () => {
  const { paginatedAlerts, currentPage, filteredAlerts, alertId } = useSelector(state => state.inSituAlerts);

  const dispatch = useDispatch();
  
  const setFavorite = (id) => {
    let selectedAlert = _.find(filteredAlerts, { id });
    selectedAlert.isFavorite = !selectedAlert.isFavorite;
    dispatch(setInSituFavoriteAlert(id, selectedAlert.isFavorite));
    const to = PAGE_SIZE * currentPage;
    const from = to - PAGE_SIZE;
    dispatch(setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to))));
  }
  const hideTooltip = (e) => {
    if (e && e.viewState) {
      dispatch(setMidpoint([e.viewState.longitude, e.viewState.latitude]));
      dispatch(setZoomLevel(e.viewState.zoom));
    }
    dispatch(setHoverInfo({}));
  };

  const setSelectedAlert = (id, isEdit) => {
    if (id) {
      if (id === alertId) {
        hideTooltip();
      }
      dispatch(setAlertId(id));
      let alertsToEdit = _.cloneDeep(filteredAlerts);
      let selectedAlert = _.find(alertsToEdit, { id });
      selectedAlert.isSelected = true;
      dispatch(setIconLayer(getIconLayer(alertsToEdit, MAP_TYPE)));
      dispatch(setHoverInfo({ object: selectedAlert, coordinate: selectedAlert.geometry.coordinates, isEdit }));
    } else {
      dispatch(setAlertId(undefined));
      dispatch(setIconLayer(getIconLayer(filteredAlerts, MAP_TYPE)));
    }
  }
  const updatePage = page => {
    dispatch(setAlertId(undefined));
    dispatch(setIconLayer(getIconLayer(filteredAlerts, MAP_TYPE)));
    dispatch(setCurrentPage(page));
    const to = PAGE_SIZE * page;
    const from = to - PAGE_SIZE;
    hideTooltip();
    dispatch(setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to))));
  };
  
  return(
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

export default AlertList;