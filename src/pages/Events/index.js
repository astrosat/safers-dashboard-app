import React, { useEffect, useState, useCallback } from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';

import { useMap } from 'components/BaseMap/MapContext';
import { MAP_TYPES, PAGE_SIZE } from 'constants/common';
import { getBoundingBox, getViewState, getIconLayer } from 'helpers/mapHelper';
import { dateRangeSelector } from 'store/common.slice';
import {
  fetchEvents,
  fetchEventDetail,
  setNewEventState,
  setEventFavorite,
  setEventParams,
  setFilteredEvents,
  resetEventResponseState,
  allEventsSelector,
  filteredEventsSelector,
  eventsSuccessSelector,
  eventsErrorSelector,
} from 'store/events.slice';
import { defaultAoiSelector } from 'store/user.slice';

import EventList from './Components/EventList';
import MapSection from './Components/Map';
import SortSection from './Components/SortSection';

const EventAlerts = ({ t }) => {
  const { viewState, setViewState } = useMap();
  const defaultAoi = useSelector(defaultAoiSelector);

  const alerts = useSelector(allEventsSelector);
  const filteredAlerts = useSelector(filteredEventsSelector);
  const success = useSelector(eventsSuccessSelector);
  const error = useSelector(eventsErrorSelector);

  const dateRange = useSelector(dateRangeSelector);

  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState(undefined);
  const [checkedStatus, setCheckedStatus] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [alertId, setAlertId] = useState(undefined);
  const [hoverInfo, setHoverInfo] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedAlerts, setPaginatedAlerts] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isViewStateChanged, setIsViewStateChanged] = useState(false);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);

  const dispatch = useDispatch();

  const getEventsLayer = useCallback((alerts, selectedAlert = {}) => {
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

    return getIconLayer(data, MAP_TYPES.EVENTS, 'flag', selectedAlert);
  }, []);

  const getEvents = useCallback(
    (isLoading = true) => {
      const dateRangeParams = dateRange
        ? { start_date: dateRange[0], end_date: dateRange[1] }
        : {};

      setAlertId(undefined);
      const eventParams = {
        order: sortOrder ? sortOrder : '-date',
        status: checkedStatus.length > 0 ? checkedStatus.toString() : undefined,
        bbox: boundingBox?.toString(),
        default_bbox: !boundingBox,
        ...dateRangeParams,
      };

      dispatch(setEventParams(eventParams));
      dispatch(
        fetchEvents({ options: eventParams, fromPage: true, isLoading }),
      );
    },
    [boundingBox, checkedStatus, dateRange, dispatch, sortOrder],
  );

  useEffect(() => {
    dispatch(setNewEventState(false, true));
    return () => {
      dispatch(setEventParams(undefined));
      dispatch(setNewEventState(false, false));
    };
  }, [dispatch]);

  useEffect(() => {
    getEvents();
  }, [dateRange, sortOrder, boundingBox, checkedStatus, getEvents]);

  useEffect(() => {
    if (success) toastr.success(success, '');
    else if (error) toastr.error(error, '');
    setIsEdit(false);
    dispatch(resetEventResponseState());
  }, [success, error, dispatch]);

  useEffect(() => {
    if (alerts.length > filteredAlerts.length) {
      toastr.success('New events are received. Please refresh the list.', '', {
        preventDuplicates: true,
      });
    }
  }, [alerts, filteredAlerts.length]);

  useEffect(() => {
    setIconLayer(getEventsLayer(filteredAlerts));
    if (!viewState) {
      setViewState(
        getViewState(
          defaultAoi.features[0].properties.midPoint,
          defaultAoi.features[0].properties.zoomLevel,
        ),
      );
    }
    setCurrentPage(1);
    hideTooltip();
    setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(0, PAGE_SIZE)));
  }, [
    defaultAoi.features,
    filteredAlerts,
    getEventsLayer,
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

  const handleResetAOI = useCallback(() => {
    setBoundingBox(undefined);
    setViewState(
      getViewState(
        defaultAoi.features[0].properties.midPoint,
        defaultAoi.features[0].properties.zoomLevel,
      ),
    );
  }, [defaultAoi.features, setViewState]);

  const hideTooltip = () => {
    setHoverInfo({});
  };

  const showTooltip = info => {
    if (info.picked && info.object) {
      setSelectedAlert(info.object.properties.id);
      setHoverInfo(info);
    } else {
      setHoverInfo({});
    }
  };

  const setFavorite = id => {
    const selectedAlert = filteredAlerts.find(alert => alert.id === id);
    dispatch(
      setEventFavorite({ eventId: id, isFavorite: !selectedAlert.favorite }),
    )
      .then(() => {
        selectedAlert.favorite = !selectedAlert.favorite;
        hoverInfo.object &&
          setHoverInfo({
            object: selectedAlert,
            coordinate: selectedAlert.center,
          });
        const to = PAGE_SIZE * currentPage;
        const from = to - PAGE_SIZE;
        setPaginatedAlerts(_.cloneDeep(filteredAlerts.slice(from, to)));

        return;
      })
      .catch(error => console.error(error));
  };

  const setSelectedAlert = (id, isEdit) => {
    if (id) {
      dispatch(fetchEventDetail(id));
      let clonedAlerts = _.cloneDeep(filteredAlerts);
      let selectedAlert = clonedAlerts.find(alert => alert.id === id);
      selectedAlert.isSelected = true;
      const pickedInfo = {
        object: {
          properties: selectedAlert,
        },
        coordinate: selectedAlert.center,
      };
      setIsEdit(isEdit);
      !_.isEqual(viewState.midPoint, selectedAlert.center) || isViewStateChanged
        ? setViewState(
            getViewState(
              selectedAlert.center,
              viewState.zoom,
              selectedAlert,
              setHoverInfo,
              setIsViewStateChanged,
            ),
          )
        : setHoverInfo(pickedInfo);
      setAlertId(id);
      setIconLayer(getIconLayer(clonedAlerts, selectedAlert));
    } else {
      setAlertId(undefined);
      setIconLayer(getIconLayer(filteredAlerts));
    }
  };

  return (
    <div className="page-content">
      <div className="mx-2 sign-up-aoi-map-bg">
        <Row>
          <Col xl={12} className="d-flex justify-content-between">
            <p className="align-self-baseline alert-title">
              {t('Events', { ns: 'common' })}
              <button
                type="button"
                className="btn float-end mt-1 py-0 px-1"
                aria-label="refresh-events"
                onClick={() => {
                  dispatch(setFilteredEvents(alerts));
                }}
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
            <SortSection
              sortOrder={sortOrder}
              filteredAlerts={filteredAlerts}
              checkedStatus={checkedStatus}
              setAlertId={setAlertId}
              setSortOrder={setSortOrder}
              setCheckedStatus={setCheckedStatus}
            />
            <Row>
              <Col xl={12} className="px-3">
                <EventList
                  alertId={alertId}
                  setAlertId={setAlertId}
                  filteredAlerts={filteredAlerts}
                  paginatedAlerts={paginatedAlerts}
                  hideTooltip={hideTooltip}
                  setIconLayer={setIconLayer}
                  setPaginatedAlerts={setPaginatedAlerts}
                  setSelectedAlert={setSelectedAlert}
                  setFavorite={setFavorite}
                />
              </Col>
            </Row>
          </Col>
          <Col xl={7} className="mx-auto">
            <MapSection
              viewState={viewState}
              hoverInfo={hoverInfo}
              iconLayer={iconLayer}
              filteredAlerts={filteredAlerts}
              currentPage={currentPage}
              isEdit={isEdit}
              hideTooltip={hideTooltip}
              showTooltip={showTooltip}
              getAlertsByArea={getAlertsByArea}
              setPaginatedAlerts={setPaginatedAlerts}
              setIsEdit={setIsEdit}
              setFavorite={setFavorite}
              setNewWidth={setNewWidth}
              setNewHeight={setNewHeight}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

EventAlerts.propTypes = {
  t: PropTypes.any,
};

export default withTranslation(['common'])(EventAlerts);
