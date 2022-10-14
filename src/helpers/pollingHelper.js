import React, { useEffect, useRef, useState } from 'react';

import {
  useDispatch,
  useSelector
} from 'react-redux';
import { 
  getAllFireAlerts, 
  setNewAlertState, 
  getAllEventAlerts, 
  setNewEventState,
  getAllNotifications,
  setNewNotificationState,
  getAllMapRequests,
  setNewMapRequestState
} from '../store/appAction';

const MILLISECONDS = 1000;
const pollingHelper = (props) => {
  const dispatch = useDispatch();
  const timer = useRef(null)

  // Map Requests
  const {
    allMapRequests,
    params: mapRequestParams,
    isPageActive: isMapRequestPageActive
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
    params: eventParams, 
    isPageActive: isEventPageActive 
  } = useSelector(state => state.eventAlerts);

  // Notifications
  const { 
    allNotifications, 
    params: notificationParams, 
    isPageActive: isNotificationPageActive 
  } = useSelector(state => state.notifications);

  const {config, dateRange} = useSelector(state => state.common);
  const pollingFrequency = config ? config.polling_frequency : undefined;

  const [currentEventCount, setCurrentEventCount] = useState(undefined);
  const [currentNotificationCount, setCurrentNotificationCount] = useState(undefined);
  const [currentMapRequestCount, setCurrentMapRequestCount] = useState(undefined);

  let dateRangeParams = {};

  if(dateRange) {
    delete alertParams.default_date;
    delete eventParams.default_date;
    delete notificationParams.default_date;
    dateRangeParams = dateRange 
      ? { start_date: dateRange[0], end_date: dateRange[1] }
      : {}
  }

  const callAPIs = () => {
    dispatch(getAllFireAlerts({...alertParams, ...dateRangeParams}));
    dispatch(getAllEventAlerts({...eventParams, ...dateRangeParams}));
    dispatch(getAllNotifications({...notificationParams, ...dateRangeParams}));
    dispatch(getAllMapRequests({...mapRequestParams, ...dateRangeParams}));
  };

  useEffect(() => {
    if (pollingFrequency && pollingFrequency > 0) {
      timer.current = setInterval(callAPIs, pollingFrequency * MILLISECONDS);
      return () => clearInterval(timer.current);
    }
  }, []);

  useEffect(() => {
    if (pollingFrequency && pollingFrequency > 0) {
      clearInterval(timer.current);
      timer.current = setInterval(callAPIs, pollingFrequency * MILLISECONDS);
    }
  }, [alertParams, eventParams, notificationParams]);

  useEffect(() => {
    /*
      filteredAlerts - one user viewed
      allAlerts - one fetched by polling - latest data set
      Compare two arrays with each object and see if any difference which becomes new alerts
    */
    const comparedArr = allAlerts.filter(obj => !filteredAlerts.includes(obj));
    if (comparedArr.length) {
      if (!isAlertPageActive){
        dispatch(setNewAlertState(true, false, comparedArr.length));
      }
    }
  }, [allAlerts]);
  
  useEffect(() => {
    const newEventsCount = allEvents.length
    if (currentEventCount && newEventsCount > currentEventCount) {
      let difference = newEventsCount - currentEventCount;
      if (!isEventPageActive)
        dispatch(setNewEventState(true, false, difference));
    }
    setCurrentEventCount(newEventsCount);
  }, [allEvents]);

  useEffect(() => {
    const newNotificationsCount = allNotifications.length
    if (currentNotificationCount && newNotificationsCount > currentNotificationCount) {
      let difference = newNotificationsCount - currentNotificationCount;
      if (!isNotificationPageActive)
        dispatch(setNewNotificationState(true, false, difference));
    }
    setCurrentNotificationCount(newNotificationsCount);
  }, [allNotifications]);

  useEffect(() => {
    const newMapRequestCount = allMapRequests.length;

    const count = newMapRequestCount > currentMapRequestCount;

    if (currentMapRequestCount && count) {
      let difference = newMapRequestCount - currentMapRequestCount;
      dispatch(setNewMapRequestState(true, isMapRequestPageActive, difference));
    }
    setCurrentMapRequestCount(newMapRequestCount);
  }, [allMapRequests]);

  return (
    <>
      {props.children}
    </>
  );
}

export default pollingHelper;
