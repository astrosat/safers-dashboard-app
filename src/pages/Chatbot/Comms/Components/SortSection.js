import React, { useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Input, Button } from 'reactstrap';
import toastr from 'toastr';

import useSetNewAlerts from 'customHooks/useSetNewAlerts';
import {
  refreshData,
  setFilteredComms,
  allCommsSelector,
  commsPollingDataSelector,
  filteredCommsSelector,
} from 'store/comms.slice';

import { getFilteredRecords } from '../../filter';

const SortSection = ({
  status,
  setStatus,
  sortOrder,
  setSortOrder,
  target,
  setTarget,
  setTogglePolygonMap,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const allComms = useSelector(allCommsSelector);
  const filteredComms = useSelector(filteredCommsSelector);
  const pollingData = useSelector(commsPollingDataSelector);

  const [numberOfUpdates, setNumberOfUpdates] = useState(undefined);

  useEffect(() => {
    if (allComms.length > 0) {
      const filters = { target, status };
      const sort = { fieldName: 'start', order: sortOrder };
      const filteredRecords = getFilteredRecords(allComms, filters, sort);
      dispatch(setFilteredComms(filteredRecords));
    }
  }, [target, sortOrder, status, allComms, dispatch]);

  useSetNewAlerts(
    numberOfUpdates => {
      setNumberOfUpdates(numberOfUpdates);
      if (numberOfUpdates > 0)
        toastr.success(t('update-notification', { ns: 'chatBot' }));
    },
    pollingData,
    allComms,
    [pollingData, allComms],
  );

  const refreshPollingData = data => {
    setSortOrder('desc');
    setStatus('');
    setTarget('');

    dispatch(refreshData(data));
  };

  return (
    <>
      <Row>
        <Col>
          <Button onClick={setTogglePolygonMap} className="text-capitalize">
            {t('create-new-msg', { ns: 'chatBot' })}
          </Button>
        </Col>

        <Col className="d-flex justify-content-end">
          {numberOfUpdates > 0 && (
            <Button
              className="btn mt-1 py-0 px-1 me-2 bg-danger"
              onClick={() => refreshPollingData(pollingData)}
              aria-label="refresh-results"
            >
              <i className="mdi mdi-sync"></i>
              <span>
                {numberOfUpdates} {t('new-updates', { ns: 'common' })}
              </span>
            </Button>
          )}

          <span className="my-auto alert-report-text">
            {t('Results', { ns: 'common' })}{' '}
            {filteredComms ? filteredComms.length : allComms.length}
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
              {t('Sort By', { ns: 'common' })} : {t('Date', { ns: 'common' })}{' '}
              {t('desc', { ns: 'common' })}
            </option>
            <option value={'asc'}>
              {t('Sort By', { ns: 'common' })} : {t('Date', { ns: 'common' })}{' '}
              {t('asc', { ns: 'common' })}
            </option>
          </Input>
        </Col>

        <Col xl={4} className="my-1">
          <Input
            id="commStatus"
            className="btn-sm sort-select-input"
            name="status"
            placeholder="Source"
            type="select"
            onChange={e => setStatus(e.target.value)}
            value={status}
          >
            <option value={''}>--{t('status', { ns: 'common' })}--</option>
            <option value="Ongoing">
              {t('ongoing', { ns: 'common' }).toUpperCase()}
            </option>
            <option value="Expired">
              {t('expired', { ns: 'common' }).toUpperCase()}
            </option>
          </Input>
        </Col>

        <Col xl={4} className="my-1">
          <Input
            id="target"
            className="btn-sm sort-select-input"
            name="target"
            placeholder="Source"
            type="select"
            onChange={e => setTarget(e.target.value)}
            value={target}
          >
            <option value={''}>--{t('target', { ns: 'common' })}--</option>
            <option value="Public" className="text-capitalization">
              {t('public', { ns: 'common' })}
            </option>
            <option value="Citizen" className="text-capitalization">
              {t('citizen', { ns: 'common' })}
            </option>
            <option value="Professional" className="text-capitalization">
              {t('professional', { ns: 'common' })}
            </option>
            <option value="Organization" className="text-capitalization">
              {t('organisation', { ns: 'common' })}
            </option>
          </Input>
        </Col>
      </Row>
    </>
  );
};

SortSection.propTypes = {
  status: PropTypes.string,
  sortOrder: PropTypes.string,
  setStatus: PropTypes.func,
  setSortOrder: PropTypes.func,
  t: PropTypes.func,
  setTogglePolygonMap: PropTypes.func,
  target: PropTypes.string,
  setTarget: PropTypes.func,
};

export default SortSection;
