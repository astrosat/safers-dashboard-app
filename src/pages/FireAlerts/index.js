import React, { useEffect, useState, useCallback } from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import Pagination from 'rc-pagination';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Input, Card } from 'reactstrap';
import toastr from 'toastr';

import BaseMap from 'components/BaseMap/BaseMap';
import { useMap } from 'components/BaseMap/MapContext';
import SearchButton from 'components/SearchButton';
import { MAP_TYPES, PAGE_SIZE } from 'constants/common';
import { getBoundingBox, getViewState, getIconLayer } from 'helpers/mapHelper';
import {
  fetchAlerts,
  fetchAlertSource,
  setAlertFavorite,
  validateAlert,
  editAlertInfo,
  setAlertApiParams,
  setNewAlertState,
  setFilteredAlerts,
  resetAlertResponseState,
  allAlertsSelector,
  filteredAlertsSelector,
  alertSourcesSelector,
  alertSuccessSelector,
  alertErrorSelector,
} from 'store/alerts.slice';
import { dateRangeSelector } from 'store/common.slice';
import { defaultAoiSelector } from 'store/user.slice';

import Alert from './Alert';
import Tooltip from './Tooltip';

const FireAlerts = ({ t }) => {
  const { viewState, setViewState } = useMap();
  const defaultAoi = useSelector(defaultAoiSelector);
  const alerts = useSelector(allAlertsSelector);
  const filteredAlerts = useSelector(filteredAlertsSelector);
  const sources = useSelector(alertSourcesSelector);
  const success = useSelector(alertSuccessSelector);
  const error = useSelector(alertErrorSelector);
  const dateRange = useSelector(dateRangeSelector);

  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortByDate, setSortByDate] = useState(undefined);
  const [alertSource, setAlertSource] = useState(undefined);
  const [, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [, setCurrentZoomLevel] = useState(undefined);
  const [alertId, setAlertId] = useState(undefined);
  const [isEdit, setIsEdit] = useState(false);
  const [, setIsViewStateChanged] = useState(false);
  const [hoverInfo, setHoverInfo] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedAlerts, setPaginatedAlerts] = useState([]);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);

  const dispatch = useDispatch();

  const getAlerts = useCallback(
    (isLoading = true) => {
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
        ...dateRangeParams,
      };

      dispatch(setAlertApiParams(alertParams));
      dispatch(
        fetchAlerts({ options: alertParams, fromPage: true, isLoading }),
      );
    },
    [alertSource, boundingBox, dateRange, dispatch, sortByDate],
  );

  const getFireAlertLayer = useCallback((alerts, selectedAlert = {}) => {
    const data = alerts.map(alert => {
      const { center, id, ...properties } = alert;
      return {
        type: 'Feature',
        properties: {
          id,
          ...properties,
        },
        geometry: {
          type: 'Point',
          coordinates: center,
        },
      };
    });

    return getIconLayer(data, MAP_TYPES.ALERTS, 'flag', {});
  }, []);

  useEffect(() => {
    dispatch(fetchAlertSource());
    dispatch(setNewAlertState({ isNewAlert: false, isPageActive: true }));
    return () => {
      dispatch(setAlertApiParams(undefined));
      dispatch(setNewAlertState({ isNewAlert: false, isPageActive: false }));
    };
  }, [dispatch]);

  useEffect(() => {
    getAlerts();
  }, [sortByDate, alertSource, dateRange, boundingBox, getAlerts]);

  useEffect(() => {
    if (success) toastr.success(success, '');
    else if (error) toastr.error(error, '');

    setIsEdit(false);
    dispatch(resetAlertResponseState());
  }, [success, error, dispatch]);

  useEffect(() => {
    if (alerts.length > filteredAlerts.length) {
      toastr.success(t('polling-alert-msg', { ns: 'fireAlerts' }), '', {
        preventDuplicates: true,
      });
    }
  }, [alerts, filteredAlerts.length, t]);

  useEffect(() => {
    setIconLayer(getFireAlertLayer(filteredAlerts));
    if (!viewState) {
      setViewState(
        getViewState(
          defaultAoi.features[0].properties.midPoint,
          defaultAoi.features[0].properties.zoomLevel,
        ),
      );
    }
    setCurrentPage(1);
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(0, PAGE_SIZE)));
  }, [
    defaultAoi.features,
    filteredAlerts,
    getFireAlertLayer,
    setViewState,
    viewState,
  ]);

  const getAlertsByArea = () => {
    setBoundingBox(
      getBoundingBox(
        [viewState.longitude, viewState.latitude],
        viewState.zoom,
        newWidth,
        newHeight,
      ),
    );
  };

  const setFavorite = id => {
    const alerts = _.cloneDeep(filteredAlerts);
    const selectedAlert = alerts.find(alert => alert.id === id);
    selectedAlert.favorite = !selectedAlert.favorite;
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? selectedAlert : alert,
    );

    dispatch(setFilteredAlerts(updatedAlerts));

    dispatch(
      setAlertFavorite({ alertId: id, isFavorite: selectedAlert.favorite }),
    )
      .then(() => {
        hoverInfo?.object &&
          setHoverInfo({
            object: {
              properties: selectedAlert,
            },
            coordinate: selectedAlert.center,
          });

        const to = PAGE_SIZE * currentPage;
        const from = to - PAGE_SIZE;
        setPaginatedAlerts(updatedAlerts.slice(from, to));

        return;
      })
      .catch(error => console.error(error));
  };

  const validateEvent = id => {
    let selectedAlert = { ...filteredAlerts.find(alert => alert.id === id) };
    selectedAlert.type = 'VALIDATED';
    dispatch(validateAlert(id));
    hideTooltip();

    const to = PAGE_SIZE * currentPage;
    const from = to - PAGE_SIZE;
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
  };

  const editInfo = (id, desc) => {
    dispatch(editAlertInfo({ alertId: id, editInfo: desc }));

    const to = PAGE_SIZE * currentPage;
    const from = to - PAGE_SIZE;
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
  };

  const updatePage = page => {
    setAlertId(undefined);
    setIconLayer(getFireAlertLayer(filteredAlerts));
    setCurrentPage(page);
    const to = PAGE_SIZE * page;
    const from = to - PAGE_SIZE;
    hideTooltip();
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));
  };

  const setSelectedAlert = (id, isEdit) => {
    if (id) {
      let clonedAlerts = _.cloneDeep(filteredAlerts);
      let selectedAlert = clonedAlerts.find(alert => alert.id === id);
      selectedAlert.isSelected = true;
      setAlertId(id);
      const pickedInfo = {
        object: {
          properties: selectedAlert,
        },
        coordinate: selectedAlert.center,
      };
      setIsEdit(isEdit);
      setHoverInfo(pickedInfo);
      setViewState(
        getViewState(
          selectedAlert.center,
          viewState.zoom,
          selectedAlert,
          undefined,
          setIsViewStateChanged,
        ),
      );
      setIconLayer(getFireAlertLayer(clonedAlerts, selectedAlert));
    } else {
      setAlertId(undefined);
      setIconLayer(getFireAlertLayer(filteredAlerts));
    }
  };

  const handleResetAOI = useCallback(() => {
    setBoundingBox(undefined);
    setViewState(
      getViewState(
        defaultAoi.features[0].properties.midPoint,
        defaultAoi.features[0].properties.zoomLevel,
      ),
    );
  }, [defaultAoi.features, setViewState]);

  const hideTooltip = e => {
    if (e && e.viewState) {
      setMidPoint([e.viewState.longitude, e.viewState.latitude]);
      setCurrentZoomLevel(e.viewState.zoom);
    }
    setIsViewStateChanged(true);
    setHoverInfo(undefined);
  };

  const showTooltip = info => {
    if (info.objects) {
      // Prevents clicks on grouped icons
      return;
    } else if (info.picked && info.object) {
      setSelectedAlert(info.object.id);
      setHoverInfo(info);
    } else {
      setHoverInfo(undefined);
    }
  };

  const renderTooltip = info => {
    const { object, coordinate: tempCoords } = info;
    const coordinate = tempCoords || object?.geometry.coordinates;
    if (object) {
      return (
        <Tooltip
          key={object.id}
          object={object?.properties}
          coordinate={coordinate}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          setFavorite={setFavorite}
          validateEvent={validateEvent}
          editInfo={editInfo}
        />
      );
    }
    if (!object) {
      return null;
    }
  };

  const getCard = card => {
    return (
      <Alert
        key={card.id}
        card={card}
        setSelectedAlert={setSelectedAlert}
        setFavorite={setFavorite}
        alertId={alertId}
      />
    );
  };

  const getSearchButton = index => {
    return <SearchButton index={index} getInfoByArea={getAlertsByArea} />;
  };

  return (
    <div className="page-content">
      <div className="mx-2 sign-up-aoi-map-bg">
        <Row>
          <Col xl={12} className="d-flex justify-content-between">
            <p className="align-self-baseline alert-title">
              {t('Alert List', { ns: 'fireAlerts' })}
              <button
                type="button"
                className="btn float-end mt-1 py-0 px-1"
                onClick={() => {
                  dispatch(setFilteredAlerts(alerts));
                }}
                aria-label="refresh-results"
              >
                <i className="mdi mdi-sync"></i>
              </button>
            </p>
            <Button
              color="link"
              onClick={handleResetAOI}
              className="align-self-baseline pe-0"
            >
              {t('default-aoi')}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xl={5}>
            <hr />
            <Row>
              <Col className="mx-0">
                <Input
                  id="sortByDate"
                  className="btn-sm sort-select-input"
                  name="sortByDate"
                  placeholder="Sort By : Date"
                  type="select"
                  onChange={e => setSortByDate(e.target.value)}
                  value={sortByDate}
                >
                  <option value={'-date'}>
                    {t('Sort By')} : {t('Date')} {t('desc')}
                  </option>
                  <option value={'date'}>
                    {t('Sort By')} : {t('Date')} {t('asc')}
                  </option>
                </Input>
              </Col>
              <Col xl={4}>
                <Input
                  id="alertSource"
                  className="btn-sm sort-select-input"
                  name="alertSource"
                  placeholder="Source"
                  type="select"
                  onChange={e => setAlertSource(e.target.value)}
                  value={alertSource}
                  data-testid="fireAlertSource"
                >
                  <option value={''}>
                    {t('source')} : {t('all')}
                  </option>
                  {sources.map(source => {
                    return (
                      <option key={source} value={source}>
                        {t('source')} : {source}
                      </option>
                    );
                  })}
                </Input>
              </Col>
              <Col
                xl={3}
                className="d-flex justify-content-end"
                data-testid="results-section"
              >
                <span className="my-auto alert-report-text">
                  {t('Results')} {filteredAlerts.length}
                </span>
              </Col>
            </Row>
            <Row>
              <Col xl={12} className="p-3">
                <Row>{paginatedAlerts.map(alert => getCard(alert))}</Row>
                <Row className="text-center">
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
          <Col xl={7} className="mx-auto">
            <Card className="map-card mb-0" style={{ height: 670 }}>
              <BaseMap
                layers={[iconLayer]}
                hoverInfo={hoverInfo}
                renderTooltip={renderTooltip}
                onClick={showTooltip}
                widgets={[getSearchButton]}
                setWidth={setNewWidth}
                setHeight={setNewHeight}
                screenControlPosition="top-right"
                navControlPosition="bottom-right"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

FireAlerts.propTypes = {
  t: PropTypes.any,
};

export default withTranslation(['common'])(FireAlerts);
