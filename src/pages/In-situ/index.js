import React, { useEffect, useState, useCallback } from 'react';

import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';

import 'toastr/build/toastr.min.css';
import 'rc-pagination/assets/index.css';
import AlertList from './Components/AlertList';
import MapSection from './Components/Map';
import SortSection from './Components/SortSection';
import { GeoJsonPinLayer } from '../../components/BaseMap/GeoJsonPinLayer';
import { MAP_TYPES } from '../../constants/common';
import {
  getBoundingBox,
  getViewState,
  getAlertIconColorFromContext,
} from '../../helpers/mapHelper';
import {
  getAllInSituAlerts,
  resetInSituAlertsResponseState,
  setCurrentPage,
  setFilteredInSituAlerts,
  setPaginatedAlerts,
  getCameraList,
  getCameraSources,
} from '../../store/appAction';
import { PAGE_SIZE } from '../../store/events/types';

//i18n

const InSituAlerts = () => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const {
    filteredAlerts,
    allAlerts: alerts,
    success,
    error,
    cameraList,
  } = useSelector(state => state.inSituAlerts);
  const dateRange = useSelector(state => state.common.dateRange);

  const [viewState, setViewState] = useState(undefined);
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState(undefined);
  const [inSituSource, setInSituSource] = useState(undefined);
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [alertId, setAlertId] = useState(undefined);
  const [hoverInfo, setHoverInfo] = useState(undefined);
  const [checkedStatus, setCheckedStatus] = useState([]);
  const [isViewStateChanged, setIsViewStateChanged] = useState(false);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const getIconLayer = alerts => {
    return new GeoJsonPinLayer({
      data: alerts,
      dispatch,
      setViewState,
      getPosition: feature => feature.geometry.coordinates,
      getPinColor: feature =>
        getAlertIconColorFromContext(MAP_TYPES.IN_SITU, feature),
      icon: 'camera',
      iconColor: '#ffffff',
      clusterIconSize: 35,
      getPinSize: () => 35,
      pixelOffset: [-18, -18],
      pinSize: 25,
      onGroupClick: true,
      onPointClick: true,
    });
  };

  useEffect(() => {
    dispatch(getCameraSources());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getCameraList({
        camera_id: inSituSource,
        bbox: boundingBox ? boundingBox.toString() : undefined,
        default_bbox: !boundingBox,
      }),
    );
  }, [inSituSource, boundingBox, dispatch]);

  useEffect(() => {
    const dateRangeParams = dateRange
      ? { start_date: dateRange[0], end_date: dateRange[1] }
      : {};

    setAlertId(undefined);
    dispatch(
      getAllInSituAlerts({
        type: checkedStatus.length > 0 ? checkedStatus.toString() : undefined,
        order: sortOrder ? sortOrder : '-date',
        camera_id: inSituSource,
        bbox: boundingBox ? boundingBox.toString() : undefined,
        default_date: false,
        default_bbox: !boundingBox,
        ...dateRangeParams,
      }),
    );
  }, [
    sortOrder,
    inSituSource,
    dateRange,
    boundingBox,
    checkedStatus,
    dispatch,
  ]);

  useEffect(() => {
    if (success) {
      toastr.success(success, '');
    } else if (error) {
      toastr.error(error, '');
    }
    dispatch(resetInSituAlertsResponseState());
  }, [success, error, dispatch]);

  useEffect(() => {
    setIconLayer(getIconLayer(cameraList.features, MAP_TYPES.IN_SITU));
  }, [cameraList, getIconLayer]);

  useEffect(() => {
    if (!viewState) {
      setViewState(
        getViewState(
          defaultAoi.features[0].properties.midPoint,
          defaultAoi.features[0].properties.zoomLevel,
        ),
      );
    }
    dispatch(setFilteredInSituAlerts(alerts));
  }, [alerts]);

  useEffect(() => {
    if (!viewState) {
      setViewState(
        getViewState(
          defaultAoi.features[0].properties.midPoint,
          defaultAoi.features[0].properties.zoomLevel,
        ),
      );
    }
    dispatch(setCurrentPage(1));
    hideTooltip();
    dispatch(
      setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(0, PAGE_SIZE))),
    );
  }, [filteredAlerts]);

  const handleResetAOI = useCallback(() => {
    setViewState(
      getViewState(
        defaultAoi.features[0].properties.midPoint,
        defaultAoi.features[0].properties.zoomLevel,
      ),
    );
  }, []);

  const showTooltip = info => {
    if (info) {
      setHoverInfo(info);
    } else {
      setHoverInfo(undefined);
    }
  };

  const hideTooltip = (e, viewStateCHanged) => {
    if (e && e.viewState) {
      setMidPoint([e.viewState.longitude, e.viewState.latitude]);
      setCurrentZoomLevel(e.viewState.zoom);
    }
    setIsViewStateChanged(viewStateCHanged);
    setHoverInfo(undefined);
  };

  const getCamByArea = () => {
    setBoundingBox(
      getBoundingBox(midPoint, currentZoomLevel, newWidth, newHeight),
    );
  };

  return (
    <div className="page-content">
      <div className="mx-2 sign-up-aoi-map-bg">
        <Row>
          <Col xl={12} className="d-flex justify-content-between">
            <p className="align-self-baseline alert-title">
              {t('In Situ Cameras', { ns: 'inSitu' })}
            </p>
            <Button
              color="link"
              onClick={handleResetAOI}
              className="align-self-baseline pe-0"
            >
              {t('default-aoi', { ns: 'common' })}
            </Button>
          </Col>
        </Row>
        <Row>
          <Col xl={5}>
            <SortSection
              sortOrder={sortOrder}
              checkedStatus={checkedStatus}
              inSituSource={inSituSource}
              setSortOrder={setSortOrder}
              setCheckedStatus={setCheckedStatus}
              setInSituSource={setInSituSource}
            />
            <Row>
              <Col xl={12} className="px-3">
                <AlertList
                  viewState={viewState}
                  currentZoomLevel={currentZoomLevel}
                  isViewStateChanged={isViewStateChanged}
                  alertId={alertId}
                  setAlertId={setAlertId}
                  setIconLayer={setIconLayer}
                  setHoverInfo={setHoverInfo}
                  hideTooltip={hideTooltip}
                  setViewState={setViewState}
                  setIsViewStateChanged={setIsViewStateChanged}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={7} className="mx-auto">
            <MapSection
              viewState={viewState}
              iconLayer={iconLayer}
              hoverInfo={hoverInfo}
              setMidPoint={setMidPoint}
              setHoverInfo={setHoverInfo}
              showTooltip={showTooltip}
              hideTooltip={hideTooltip}
              getCamByArea={getCamByArea}
              setNewWidth={setNewWidth}
              setNewHeight={setNewHeight}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default InSituAlerts;
