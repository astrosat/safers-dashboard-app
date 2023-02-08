import React, { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import useSetNewAlerts from '../customHooks/useSetNewAlerts';
import {
  getAllFireAlerts,
  setNewAlertState,
  getAllEventAlerts,
  setNewEventState,
  getAllNotifications,
  setNewNotificationState,
  getAllMapRequests,
  setNewMapRequestState,
  getAllPeople,
} from '../store/appAction';

const MILLISECONDS = 1000;
const PollingHelper = props => {
  const dispatch = useDispatch();
  const timer = useRef(null);

  // Map Requests
  const {
    allMapRequests,
    params: mapRequestParams,
    isPageActive: isMapRequestPageActive,
  } = useSelector(state => state.dataLayer);

  // Alerts
  const {
    allAlerts,
    filteredAlerts,
    params: alertParams,
    isPageActive: isAlertPageActive,
  } = useSelector(state => state.alerts);

  // Events
  const {
    allAlerts: allEvents,
    filteredAlerts: filteredEvents,
    params: eventParams,
    isPageActive: isEventPageActive,
  } = useSelector(state => state.eventAlerts);

  // Notifications
  const {
    allNotifications,
    params: notificationParams,
    isPageActive: isNotificationPageActive,
  } = useSelector(state => state.notifications);

  const { config, dateRange } = useSelector(state => state.common);
  const pollingFrequency = config ? config.polling_frequency : undefined;

  const [currentNotificationCount, setCurrentNotificationCount] =
    useState(undefined);
  const [currentMapRequestCount, setCurrentMapRequestCount] =
    useState(undefined);

  let dateRangeParams = {};

  if (dateRange) {
    delete alertParams.default_date;
    delete eventParams.default_date;
    delete notificationParams.default_date;
    dateRangeParams = dateRange
      ? { start_date: dateRange[0], end_date: dateRange[1] }
      : {};
  }

  const callAPIs = () => {
    dispatch(getAllFireAlerts({ ...alertParams, ...dateRangeParams }));
    dispatch(getAllEventAlerts({ ...eventParams, ...dateRangeParams }));
    dispatch(
      getAllNotifications({ ...notificationParams, ...dateRangeParams }),
    );
    dispatch(getAllMapRequests({ ...mapRequestParams, ...dateRangeParams }));
  };

  useEffect(() => {
    if (pollingFrequency && pollingFrequency > 0) {
      timer.current = setInterval(callAPIs, pollingFrequency * MILLISECONDS);
      return () => clearInterval(timer.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pollingFrequency && pollingFrequency > 0) {
      clearInterval(timer.current);
      timer.current = setInterval(callAPIs, pollingFrequency * MILLISECONDS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertParams, eventParams, notificationParams]);

  useSetNewAlerts(
    noOfMessages => {
      if (!isAlertPageActive) {
        dispatch(setNewAlertState(true, false, noOfMessages));
      }
    },
    allAlerts,
    filteredAlerts,
    [allAlerts],
  );

  useSetNewAlerts(
    noOfMessages => {
      if (!isEventPageActive) {
        dispatch(setNewEventState(true, false, noOfMessages));
      }
    },
    allEvents,
    filteredEvents,
    [allEvents],
  );

  useEffect(() => {
    const newNotificationsCount = allNotifications.length;
    if (
      currentNotificationCount &&
      newNotificationsCount > currentNotificationCount
    ) {
      let difference = newNotificationsCount - currentNotificationCount;
      if (!isNotificationPageActive)
        dispatch(setNewNotificationState(true, false, difference));
    }
    setCurrentNotificationCount(newNotificationsCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allNotifications]);

  useEffect(() => {
    const newMapRequestCount = allMapRequests.length;

    const count = newMapRequestCount > currentMapRequestCount;

    if (currentMapRequestCount && count) {
      let difference = newMapRequestCount - currentMapRequestCount;
      dispatch(setNewMapRequestState(true, isMapRequestPageActive, difference));
    }
    setCurrentMapRequestCount(newMapRequestCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMapRequests]);

  return <>{props.children}</>;
};

export default PollingHelper;
