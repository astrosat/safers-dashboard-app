import React from 'react';

import PropTypes from 'prop-types';
//i18n
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Row, Col, Input } from 'reactstrap';

import {
  notificationSourcesSelector,
  notificationScopeRestrictionsSelector,
} from 'store/notifications.slice';

const SortSection = ({
  filteredNotifications,
  notificationSource,
  setNotificationSource,
  notificationScopeRestriction,
  setNotificationScopeRestriction,
  sortOrder,
  setSortOrder,
  t,
}) => {
  const notificationSources = useSelector(notificationSourcesSelector);
  const notificationScopesRestrictions = useSelector(
    notificationScopeRestrictionsSelector,
  );

  return (
    <>
      <hr />
      <Row className="my-2">
        <Col xl={9} className="mx-0 my-1 d-flex">
          <Input
            id="sortByDate"
            className="btn-sm sort-select-input"
            name="sortByDate"
            placeholder="Sort By : Date"
            type="select"
            onChange={e => setSortOrder(e.target.value)}
            value={sortOrder}
          >
            <option value={'-date'}>
              {t('Sort By')} : {t('Date')} {t('desc')}
            </option>
            <option value={'date'}>
              {t('Sort By')} : {t('Date')} {t('asc')}
            </option>
          </Input>

          <Input
            id="notificationSource"
            className="btn-sm sort-select-input ms-3"
            name="notificationSource"
            placeholder={t('source')}
            type="select"
            onChange={e => setNotificationSource(e.target.value)}
            value={notificationSource}
          >
            <option value={'all'}>
              {' '}
              {t('source')} : {t('All')}
            </option>
            {notificationSources.map(notificationSource => (
              <option value={notificationSource} key={notificationSource}>
                {t('Source')} : {notificationSource}
              </option>
            ))}
          </Input>
          <Input
            id="notificationtScopeRestriction"
            className="btn-sm sort-select-input ms-3"
            name="notificationtScopeRestriction"
            placeholder={t('scope')}
            type="select"
            onChange={e => setNotificationScopeRestriction(e.target.value)}
            value={notificationScopeRestriction}
          >
            <option value={'all'}>
              {' '}
              {t('scope')} : {t('All')}
            </option>
            {notificationScopesRestrictions.map(
              notificationScopeRestriction => (
                <option
                  value={notificationScopeRestriction}
                  key={notificationScopeRestriction}
                >
                  {t('Scope')} : {notificationScopeRestriction}
                </option>
              ),
            )}
          </Input>
        </Col>
        <Col></Col>
        <Col xl={2} className="d-flex justify-content-end">
          <span className="my-auto alert-report-text">
            {t('Results')} {filteredNotifications.length}
          </span>
        </Col>
      </Row>
    </>
  );
};

SortSection.propTypes = {
  alertSource: PropTypes.string,
  setAlertSource: PropTypes.func,
  filteredNotifications: PropTypes.array,
  setFilterdNotifications: PropTypes.func,
  notificationSource: PropTypes.string,
  setNotificationSource: PropTypes.func,
  notificationScopeRestriction: PropTypes.string,
  setNotificationScopeRestriction: PropTypes.func,
  sortOrder: PropTypes.string,
  setSortOrder: PropTypes.func,
  t: PropTypes.func,
};

export default withTranslation(['common'])(SortSection);
