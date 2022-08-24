import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Input, Card } from 'reactstrap';
//import { IconLayer } from 'deck.gl';
import _ from 'lodash';
import Pagination from 'rc-pagination';
import toastr from 'toastr';
//i18n
import { withTranslation } from 'react-i18next'

import BaseMap from '../../components/BaseMap/BaseMap';
import { getAllFireAlerts, setFavoriteAlert, validateAlert, editAlertInfo, setAlertApiParams, resetAlertsResponseState, setNewAlertState, getSource, setFilteredAlerts } from '../../store/appAction';
import Alert from './Alert';
import Tooltip from './Tooltip';
import { SET_FAV_ALERT_SUCCESS } from '../../store/alerts/types'

import 'toastr/build/toastr.min.css'
import 'rc-pagination/assets/index.css';
import { getBoundingBox, getViewState } from '../../helpers/mapHelper';
import SearchButton from '../../components/SearchButton';
import { getIconLayer } from '../../helpers/mapHelper';
import { MAP_TYPES } from '../../constants/common';


const PAGE_SIZE = 4;

const FireAlerts = ({ t }) => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const alerts = useSelector(state => state.alerts.allAlerts);
  const filteredAlerts = useSelector(state => state.alerts.filteredAlerts);
  const sources = useSelector(state => state.alerts.sources);
  const success = useSelector(state => state.alerts.success);
  const error = useSelector(state => state.alerts.error);
  const dateRange = useSelector(state => state.common.dateRange)

  const [iconLayer, setIconLayer] = useState(undefined);
  const [viewState, setViewState] = useState(undefined);
  const [sortByDate, setSortByDate] = useState(undefined);
  const [alertSource, setAlertSource] = useState(undefined);
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [alertId, setAlertId] = useState(undefined);
  const [isEdit, setIsEdit] = useState(false);
  const [isViewStateChanged, setIsViewStateChanged] = useState(false);
  const [hoverInfo, setHoverInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedAlerts, setPaginatedAlerts] = useState([]);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSource());
    dispatch(setNewAlertState(false, true));
    return () => {
      dispatch(setAlertApiParams(undefined));
      dispatch(setNewAlertState(false, false));
    }
  }, []);

  useEffect(() => {
    getAlerts();
  }, [sortByDate, alertSource, dateRange, boundingBox]);

  useEffect(() => {
    if (success)
      toastr.success(success, '');
    else if (error)
      toastr.error(error, '');

    setIsEdit(false);
    dispatch(resetAlertsResponseState());
  }, [success, error]);

  useEffect(() => {
    if (alerts.length > filteredAlerts.length) {
      toastr.success('New alerts are received. Please refresh the list.', '', { preventDuplicates: true, });
    }
  }, [alerts]);

  useEffect(() => {
    setAlertId(undefined);
    setIconLayer(getIconLayer(filteredAlerts, MAP_TYPES.ALERTS));
    if (!viewState) {
      setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel));
    }
    setCurrentPage(1);
    hideTooltip();
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(0, PAGE_SIZE)));
  }, [filteredAlerts]);

  const getAlertsByArea = () => {
    setBoundingBox(getBoundingBox(midPoint, currentZoomLevel, newWidth, newHeight));
  }

  const setFavorite = (id) => {
    const selectedAlert = _.find(filteredAlerts, { id });
    dispatch(setFavoriteAlert(id, !selectedAlert.favorite)).then((result) => {
      if (result.type === SET_FAV_ALERT_SUCCESS) {
        selectedAlert.favorite = !selectedAlert.favorite
        hoverInfo.object && setHoverInfo({ object: selectedAlert, coordinate: selectedAlert.center });
        const to = PAGE_SIZE * currentPage;
        const from = to - PAGE_SIZE;
        setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
      }
    })
  }

  const validateEvent = (id) => {
    let selectedAlert = _.find(filteredAlerts, { id });
    selectedAlert.type = 'VALIDATED';
    dispatch(validateAlert(id));
    hideTooltip();
    console.log('validateEvent')
    const to = PAGE_SIZE * currentPage;
    const from = to - PAGE_SIZE;
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
  }

  const editInfo = (id, desc) => {
    let selectedAlert = _.find(filteredAlerts, { id });
    selectedAlert.information = desc;
    dispatch(editAlertInfo(id, desc));
    console.log('editInfo')
    const to = PAGE_SIZE * currentPage;
    const from = to - PAGE_SIZE;
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
  }

  const updatePage = page => {
    setAlertId(undefined);
    setIconLayer(getIconLayer(filteredAlerts, MAP_TYPES.ALERTS));
    setCurrentPage(page);
    const to = PAGE_SIZE * page;
    const from = to - PAGE_SIZE;
    hideTooltip();
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
  };

  const getAlerts = () => {
    const dateRangeParams = dateRange
      ? { start_date: dateRange[0], end_date: dateRange[1] }
      : {};

    setAlertId(undefined);
    const alertParams = {
      order: sortByDate ? sortByDate : '-date',
      source: alertSource ? alertSource : undefined,
      default_date: false,
      default_bbox: !boundingBox,
      bbox: boundingBox ? boundingBox.toString() : undefined,
      ...dateRangeParams
    };

    dispatch(setAlertApiParams(alertParams));
    dispatch(getAllFireAlerts(alertParams, true));
  }

  const setSelectedAlert = (id, isEdit) => {
    if (id) {
      let clonedAlerts = _.cloneDeep(filteredAlerts);
      let selectedAlert = _.find(clonedAlerts, { id });
      selectedAlert.isSelected = true;
      setIsEdit(isEdit);
      !_.isEqual(viewState.midPoint, selectedAlert.center) || isViewStateChanged ?
        setViewState(getViewState(selectedAlert.center, currentZoomLevel, selectedAlert, setHoverInfo, setIsViewStateChanged))
        : setHoverInfo({ object: selectedAlert, coordinate: selectedAlert.center });
      setAlertId(id);
      setIconLayer(getIconLayer(clonedAlerts, MAP_TYPES.ALERTS));
    } else {
      setAlertId(undefined);
      setIconLayer(getIconLayer(filteredAlerts, MAP_TYPES.ALERTS));
    }
  }

  const handleResetAOI = useCallback(() => {
    setBoundingBox(undefined);
    setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
  }, []);

  const hideTooltip = (e) => {
    if (e && e.viewState) {
      setMidPoint([e.viewState.longitude, e.viewState.latitude]);
      setCurrentZoomLevel(e.viewState.zoom);
    }
    setIsViewStateChanged(true);
    setHoverInfo({});
  };

  const showTooltip = info => {
    if (info.picked && info.object) {
      setSelectedAlert(info.object.id);
      setHoverInfo(info);
    } else {
      setHoverInfo({});
    }
  };

  const renderTooltip = (info) => {
    const { object, coordinate } = info;
    if (object) {
      return <Tooltip
        key={object.id}
        object={object}
        coordinate={coordinate}
        isEdit={isEdit}
        setIsEdit={setIsEdit}
        setFavorite={setFavorite}
        validateEvent={validateEvent}
        editInfo={editInfo}
      />
    }
    if (!object) {
      return null;
    }
  }

  const getCard = (card, index) => {
    return (
      <Alert
        key={index}
        card={card}
        setSelectedAlert={setSelectedAlert}
        setFavorite={setFavorite}
        alertId={alertId} />
    )
  }

  const getSearchButton = (index) => {
    return (
      <SearchButton
        index={index}
        getInfoByArea={getAlertsByArea}
      />
    )
  }

  return (
    <div className='page-content'>
      <div className='mx-2 sign-up-aoi-map-bg'>
        <Row>
          <Col xl={12} className='d-flex justify-content-between'>
            <p className='align-self-baseline alert-title'>{t('Alert List', { ns: 'fireAlerts' })}
              <button
                type="button"
                className="btn float-end mt-1 py-0 px-1"
                onClick={() => {
                  dispatch(setFilteredAlerts(alerts));
                }}
                aria-label='refresh-results'
              >
                <i className="mdi mdi-sync"
                ></i>
              </button>
            </p>
            <Button color='link'
              onClick={handleResetAOI} className='align-self-baseline pe-0'>
              {t('default-aoi')}</Button>
          </Col>
        </Row>
        <Row>
          <Col xl={5}>
            <hr />
            <Row>
              <Col className='mx-0'>
                <Input
                  id="sortByDate"
                  className="btn-sm sort-select-input"
                  name="sortByDate"
                  placeholder="Sort By : Date"
                  type="select"
                  onChange={(e) => setSortByDate(e.target.value)}
                  value={sortByDate}
                >
                  <option value={'-date'} >{t('Sort By')} : {t('Date')} {t('desc')}</option>
                  <option value={'date'}  >{t('Sort By')} : {t('Date')} {t('asc')}</option>
                </Input>
              </Col>
              <Col xl={4}>
                <Input
                  id="alertSource"
                  className="btn-sm sort-select-input"
                  name="alertSource"
                  placeholder="Source"
                  type="select"
                  onChange={(e) => setAlertSource(e.target.value)}
                  value={alertSource}
                  data-testid='fireAlertSource'
                >
                  <option value={''} >Source : All</option>
                  {sources.map((source, index) => { return <option key={index} value={source} >Source : {source}</option> }
                  )}
                </Input>
              </Col>
              <Col xl={3} className="d-flex justify-content-end" data-testid='results-section'>
                <span className='my-auto alert-report-text'>{t('Results')} {filteredAlerts.length}</span></Col>
            </Row>
            <Row>
              <Col xl={12} className='p-3'>
                <Row>
                  {
                    paginatedAlerts.map((alert, index) => getCard(alert, index))
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
              </Col>
            </Row>
          </Col>
          <Col xl={7} className='mx-auto'>
            <Card className='map-card mb-0' style={{ height: 670 }}>
              <BaseMap
                layers={[iconLayer]}
                initialViewState={viewState}
                hoverInfo={hoverInfo}
                renderTooltip={renderTooltip}
                onClick={showTooltip}
                onViewStateChange={hideTooltip}
                widgets={[getSearchButton]}
                setWidth={setNewWidth}
                setHeight={setNewHeight}
                screenControlPosition='top-right'
                navControlPosition='bottom-right'
              />
            </Card>

          </Col>
        </Row>
      </div>
    </div >
  );
}

FireAlerts.propTypes = {
  t: PropTypes.any,
}

export default withTranslation(['common'])(FireAlerts);
