import React from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
//i18n
import { Row, Col, Input, Label, FormGroup, InputGroup } from 'reactstrap';

import { setFilteredEvents, allEventsSelector } from 'store/events.slice';

const SortSection = ({
  t,
  checkedStatus,
  sortOrder,
  filteredAlerts,
  setCheckedStatus,
  setAlertId,
  setSortOrder,
}) => {
  const alerts = useSelector(allEventsSelector);

  const ongoing = alerts.filter(alert => alert.status === 'Ongoing').length;
  const closed = alerts.filter(alert => alert.status === 'Closed').length;
  const dispatch = useDispatch();

  const handleChecked = value => {
    if (checkedStatus.includes(value)) {
      setCheckedStatus(_.without(checkedStatus, value));
    } else {
      setCheckedStatus([...checkedStatus, value]);
    }
  };
  const filterByDate = sortOrder => {
    setAlertId(undefined);
    setSortOrder(sortOrder);
  };

  const filterBySearchText = query => {
    setAlertId(undefined);
    if (query === '') dispatch(setFilteredEvents(alerts));
    else
      dispatch(
        setFilteredEvents(
          alerts.filter(alert =>
            alert.title.toLowerCase().includes(query.toLowerCase()),
          ),
        ),
      );
  };

  return (
    <>
      <div data-testid="status-section">
        <FormGroup className="form-group d-inline-block" check>
          <Input
            id="onGoing"
            data-testid="onGoing"
            name="status"
            type="checkbox"
            value="Ongoing"
            onChange={e => handleChecked(e.target.value)}
          />
          <Label check for="onGoing">
            {t('Ongoing', { ns: 'events' })} ({ongoing})
          </Label>
        </FormGroup>
        <FormGroup className="form-group d-inline-block ms-4" check>
          <Input
            id="closedEvents"
            data-testid="closedEvents"
            name="status"
            type="checkbox"
            value="Closed"
            onChange={e => handleChecked(e.target.value)}
          />
          <Label check for="closedEvents">
            {t('Closed', { ns: 'events' })} ({closed})
          </Label>
        </FormGroup>
      </div>

      <Row data-testid="results-section">
        <Col></Col>
        <Col xl={3} className="d-flex justify-content-end">
          <span className="my-auto alert-report-text">
            {t('Results')} {filteredAlerts.length}
          </span>
        </Col>
      </Row>
      <hr />
      <Row className="my-2">
        <Col className="mx-0 my-1">
          <Input
            id="sortOrder"
            className="btn-sm sort-select-input"
            name="sortOrder"
            placeholder="Sort By : Date"
            type="select"
            onChange={e => filterByDate(e.target.value)}
            value={sortOrder}
          >
            <option value={'-date'}>
              {t('Sort By')} : {t('Date')} {t('desc')}
            </option>
            <option value={'date'}>
              {t('Sort By')} : {t('Date')} {t('asc')}
            </option>
          </Input>
        </Col>
        <Col xl={7} />
      </Row>
      <Row className="mt-3">
        <Col xs={12}>
          <FormGroup>
            <InputGroup>
              <div className="bg-white d-flex border-none search-left">
                <i className="fa fa-search px-2 m-auto calender-icon"></i>
              </div>
              <Input
                id="searchEvents"
                data-testid="searchEvents"
                name="searchEvents"
                className="search-input"
                placeholder={t('search-input-txt', { ns: 'events' })}
                onChange={e => filterBySearchText(e.target.value)}
              />
            </InputGroup>
          </FormGroup>
        </Col>
      </Row>
    </>
  );
};

SortSection.propTypes = {
  checkedStatus: PropTypes.any,
  sortOrder: PropTypes.string,
  filteredAlerts: PropTypes.array,
  setCheckedStatus: PropTypes.func,
  setSortOrder: PropTypes.func,
  setAlertId: PropTypes.func,
  t: PropTypes.func,
};

export default withTranslation(['common'])(SortSection);
