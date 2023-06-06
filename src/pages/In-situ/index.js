import React, { useEffect, useState, useCallback } from 'react';

import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';

import { GeoJsonPinLayer } from 'components/BaseMap/GeoJsonPinLayer';
import { useMap } from 'components/BaseMap/MapContext';
import { MAP_TYPES, PAGE_SIZE } from 'constants/common';
import {
  getBoundingBox,
  getViewState,
  getAlertIconColorFromContext,
} from 'helpers/mapHelper';
import { dateRangeSelector } from 'store/common.slice';
import {
  fetchCameras,
  fetchCameraSources,
  fetchCameraAlerts,
  resetCameraAlertsResponseState,
  setFilteredCameraAlerts,
  setCurrentPage,
  setPaginatedAlerts,
  allInSituAlertsSelector,
  filteredCameraAlertsSelector,
  cameraListSelector,
  cameraAlertsSuccessSelector,
  cameraAlertsErrorSelector,
} from 'store/insitu.slice';
import { defaultAoiSelector } from 'store/user.slice';

import AlertList from './Components/AlertList';
import MapSection from './Components/Map';
import SortSection from './Components/SortSection';

//i18n

const InSituAlerts = () => {
  const { viewState, setViewState } = useMap();
  const defaultAoi = useSelector(defaultAoiSelector);
  const alerts = useSelector(allInSituAlertsSelector);
  const filteredAlerts = useSelector(filteredCameraAlertsSelector);
  const cameraList = useSelector(cameraListSelector);
  const success = useSelector(cameraAlertsSuccessSelector);
  const error = useSelector(cameraAlertsErrorSelector);
  const dateRange = useSelector(dateRangeSelector);

  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState(undefined);
  const [inSituSource, setInSituSource] = useState(undefined);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [alertId, setAlertId] = useState(undefined);
  const [hoverInfo, setHoverInfo] = useState(undefined);
  const [checkedStatus, setCheckedStatus] = useState([]);
  const [isViewStateChanged, setIsViewStateChanged] = useState(false);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);

  const { t } = useTranslation();
  const dispatch = useDispatch();

  const getIconLayer = useCallback(
    alerts => {
      return new GeoJsonPinLayer({
        data: alerts,
        dispatch,
        getPosition: feature => feature.geometry.coordinates,
        getPinColor: feature =>
          getAlertIconColorFromContext(MAP_TYPES.IN_SITU, feature),
        icon: 'camera',
        iconColor: [255, 255, 255],
        clusterIconSize: 35,
        getPinSize: () => 35,
        pixelOffset: [-18, -18],
        pinSize: 25,
        onGroupClick: true,
        onPointClick: true,
      });
    },
    [dispatch],
  );

  useEffect(() => {
    dispatch(fetchCameraSources());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchCameras({
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
      fetchCameraAlerts({
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
    dispatch(resetCameraAlertsResponseState());
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
    dispatch(setFilteredCameraAlerts(alerts));
  }, [alerts, defaultAoi.features, dispatch, setViewState, viewState]);

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
  }, [defaultAoi.features, dispatch, filteredAlerts, setViewState, viewState]);

  const handleResetAOI = useCallback(() => {
    setViewState(
      getViewState(
        defaultAoi.features[0].properties.midPoint,
        defaultAoi.features[0].properties.zoomLevel,
      ),
    );
  }, [defaultAoi.features, setViewState]);

  const showTooltip = info => {
    if (info) {
      setHoverInfo(info);
    } else {
      setHoverInfo(undefined);
    }
  };

  const hideTooltip = () => {
    setHoverInfo(undefined);
  };

  const getCamByArea = () => {
    setBoundingBox(
      getBoundingBox(
        [viewState.longitude, viewState.latitude],
        viewState.zoom,
        newWidth,
        newHeight,
      ),
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
                  isViewStateChanged={isViewStateChanged}
                  alertId={alertId}
                  setAlertId={setAlertId}
                  setIconLayer={setIconLayer}
                  setHoverInfo={setHoverInfo}
                  hideTooltip={hideTooltip}
                  setViewState={useCallback(() => setViewState, [setViewState])}
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
