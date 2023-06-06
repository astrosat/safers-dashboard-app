import React, { useEffect, useState } from 'react';

import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';

import { PAGE_SIZE } from 'constants/common';
import { dateRangeSelector } from 'store/common.slice';
import {
  fetchNotifications,
  fetchNotificationSources,
  fetchNotificationScopeRestrictions,
  setNewNotificationState,
  setNotificationParams,
  allNotificationsSelector,
  notificationParamsSelector,
} from 'store/notifications.slice';

import NotificationsList from './Components/NotificationsList';
import SortSection from './Components/SortSection';

const Notifications = () => {
  const dispatch = useDispatch();

  const notifications = useSelector(allNotificationsSelector);
  const notificationParams = useSelector(notificationParamsSelector);
  const dateRange = useSelector(dateRangeSelector);

  const [filteredNotifications, setFilterdNotifications] = useState([]);
  const [paginatedNotifications, setPaginatedNotifications] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationSource, setNotificationSource] = useState('all');
  const [notificationScopeRestriction, setNotificationScopeRestriction] =
    useState('all');
  const [sortOrder, setSortOrder] = useState('-date');

  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchNotificationSources());
    dispatch(fetchNotificationScopeRestrictions());
  }, [dispatch]);

  useEffect(() => {
    setFilterdNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    const params = { ...notificationParams };

    if (notificationSource && notificationSource !== 'all') {
      params.source = notificationSource;
    }

    if (
      notificationScopeRestriction &&
      notificationScopeRestriction !== 'all'
    ) {
      params.scopeRestriction = notificationScopeRestriction;
    }

    if (dateRange) {
      params.start_date = dateRange[0];
      params.end_date = dateRange[1];
    } else if (!dateRange) {
      delete params.start_date;
      delete params.end_date;
    }

    if (sortOrder) {
      params.order = sortOrder;
    }

    dispatch(setNotificationParams(params));
    dispatch(fetchNotifications(params));
    dispatch(setNewNotificationState(false, true));

    return () => {
      dispatch(setNotificationParams(undefined));
      dispatch(setNewNotificationState(false, false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dateRange,
    notificationSource,
    notificationScopeRestriction,
    sortOrder,
    dispatch,
  ]);

  useEffect(() => {
    setCurrentPage(1);
    setPaginatedNotifications(
      _.cloneDeep(filteredNotifications.slice(0, PAGE_SIZE)),
    );
  }, [filteredNotifications]);

  return (
    <div className="page-content">
      <div className="mx-2 sign-up-aoi-map-bg">
        <Row>
          <Col xl={12} className="d-flex justify-content-between">
            <p className="align-self-baseline alert-title">
              {t('Notification List', { ns: 'common' })}
            </p>
          </Col>
        </Row>
        <Row>
          <Col xl={12}>
            <SortSection
              filteredNotifications={filteredNotifications}
              setFilterdNotifications={setFilterdNotifications}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              notificationSource={notificationSource}
              setNotificationSource={setNotificationSource}
              notificationScopeRestriction={notificationScopeRestriction}
              setNotificationScopeRestriction={setNotificationScopeRestriction}
            />
            <Row>
              <Col xl={12} className="px-3">
                <NotificationsList
                  filteredNotifications={filteredNotifications}
                  paginatedNotifications={paginatedNotifications}
                  setPaginatedNotifications={setPaginatedNotifications}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Notifications;
