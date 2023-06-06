import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, Button } from 'reactstrap';
import toastr from 'toastr';

import useSetNewAlerts from 'customHooks/useSetNewAlerts';
import {
  setFilteredPeople,
  refreshPeople,
  allPeopleSelector,
  filteredPeopleSelector,
  peoplePollingDataSelector,
} from 'store/people.slice';

import { getFilteredRecords } from '../../filter';

const SortSection = ({
  t,
  status,
  activity,
  sortOrder,
  setStatus,
  setActivity,
  setSortOrder,
  activities,
}) => {
  const dispatch = useDispatch();

  const allPeople = useSelector(allPeopleSelector);
  const filteredPeople = useSelector(filteredPeopleSelector);
  const pollingData = useSelector(peoplePollingDataSelector);

  const [numberOfUpdates, setNumberOfUpdates] = useState(undefined);

  useEffect(() => {
    if (allPeople.length > 0) {
      const filters = { activity, status };
      const sort = { fieldName: 'timestamp', order: sortOrder };
      const filteredRecords = getFilteredRecords(allPeople, filters, sort);

      dispatch(setFilteredPeople(filteredRecords));
    }
  }, [activity, allPeople, dispatch, sortOrder, status]);

  useSetNewAlerts(
    numberOfUpdates => {
      setNumberOfUpdates(numberOfUpdates);
      if (numberOfUpdates > 0)
        toastr.success(t('update-notification', { ns: 'chatBot' }));
    },
    pollingData,
    allPeople,
    [pollingData, allPeople],
  );

  const refreshPollingData = data => {
    setSortOrder('desc');
    setStatus('');
    setActivity('');

    dispatch(refreshPeople(data));
  };

  return (
    <>
      <Row className="">
        <Col></Col>
        <Col className="d-flex justify-content-end">
          {numberOfUpdates > 0 && (
            <Button
              className="btn mt-1 py-0 px-1 me-2 bg-danger"
              onClick={() => refreshPollingData(pollingData)}
              aria-label="refresh-results"
            >
              <i className="mdi mdi-sync"></i>
              <span>
                {numberOfUpdates} {t('new-updates')}
              </span>
            </Button>
          )}
          <span className="my-auto alert-report-text">
            {t('Results')}{' '}
            {filteredPeople ? filteredPeople.length : allPeople.length}
          </span>
        </Col>
      </Row>
      <hr />
      <Row className="my-2">
        <Col className="mx-0 my-1">
          <Input
            id="sortByDate"
            className="btn-sm sort-select-input"
            name="sortByDate"
            placeholder="Sort By : Date"
            type="select"
            onChange={e => setSortOrder(e.target.value)}
            value={sortOrder}
          >
            <option value={'desc'}>
              {t('Sort By')} : {t('Date')} {t('desc')}
            </option>
            <option value={'asc'}>
              {t('Sort By')} : {t('Date')} {t('asc')}
            </option>
          </Input>
        </Col>

        <Col xl={4} className="my-1">
          <Input
            id="status"
            className="btn-sm sort-select-input"
            name="status"
            placeholder="Status"
            type="select"
            onChange={e => setStatus(e.target.value)}
            value={status}
          >
            <option value={''}>--{t('status')}--</option>
            <option value="Active">{t('active').toUpperCase()}</option>
            <option value="Off">{t('off').toUpperCase()}</option>
            <option value="Ready">{t('ready').toUpperCase()}</option>
            <option value="Moving">{t('moving').toUpperCase()}</option>
          </Input>
        </Col>

        <Col xl={4} className="my-1">
          <Input
            id="activity"
            className="btn-sm sort-select-input"
            name="activity"
            placeholder="Activity"
            type="select"
            onChange={e => setActivity(e.target.value)}
            value={activity}
            data-testid="activity"
          >
            <option value={''} className="text-capitalize">
              --{t('activity')}--
            </option>
            {activities.map(option => (
              <option key={option} value={t(`${option}`)}>
                {option}
              </option>
            ))}
          </Input>
        </Col>
      </Row>
    </>
  );
};

SortSection.propTypes = {
  status: PropTypes.any,
  activity: PropTypes.any,
  sortOrder: PropTypes.string,
  setStatus: PropTypes.func,
  setActivity: PropTypes.func,
  setSortOrder: PropTypes.func,
  activities: PropTypes.array,
  t: PropTypes.func,
};

export default withTranslation(['common'])(SortSection);
