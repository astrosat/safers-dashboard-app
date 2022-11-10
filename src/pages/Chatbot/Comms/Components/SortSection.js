import React, { useEffect, useState } from 'react';
import { Row, Col, Input, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
//i18N
import { withTranslation } from 'react-i18next';

import { setFilterdComms, refreshData } from '../../../../store/comms/action';
import { getFilteredRec } from '../../filter';
import useSetNewAlerts from '../../../../customHooks/useSetNewAlerts';
import toastr from 'toastr';

const SortSection = ({ t, commStatus, sortOrder, setcommStatus, setSortOrder, target, setTarget, setTogglePolygonMap }) => {
  const { allComms, filteredComms, pollingData } = useSelector(state => state.comms);
  const [numberOfUpdates, setNumberOfUpdates] = useState(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    if(allComms.length > 0) {
      const filters = {target, status:commStatus};
      const sort = {fieldName: 'start', order: sortOrder};
      const actFiltered = getFilteredRec(allComms, filters, sort);
      dispatch(setFilterdComms(actFiltered));
    }
  }, [target, sortOrder, commStatus])

  useSetNewAlerts((numberOfUpdates) => {
    setNumberOfUpdates(numberOfUpdates);
    if(numberOfUpdates > 0)
      toastr.success(t('update-notification', { ns: 'chatBot' }));
  }, pollingData, allComms, [pollingData, allComms])

  const refreshPollingData = (data) => {
    setSortOrder('desc');
    setcommStatus('');
    setTarget('');
    dispatch(refreshData(data));
  }

  return (
    <>
      <Row>
        <Col>      
          <Button onClick={setTogglePolygonMap} className="text-capitalize">
            {t('create-new-msg' , {ns: 'chatBot'})}
          </Button>   
        </Col>
        <Col className="d-flex justify-content-end">
          {numberOfUpdates > 0 && 
          <Button className="btn mt-1 py-0 px-1 me-2 bg-danger"
            onClick={() => refreshPollingData(pollingData)}
            aria-label="refresh-results"
          >
            <i className="mdi mdi-sync"></i><span>{numberOfUpdates} {t('new-updates')}</span>
          </Button>}
          <span className='my-auto alert-report-text'>{t('Results')} { filteredComms ? filteredComms.length : allComms.length }</span>
        </Col>
      </Row>
      <hr />
      <Row className='my-2'>
        <Col className='mx-0 my-1'>
          <Input
            id="sortByDate"
            className="btn-sm sort-select-input"
            name="sortByDate"
            placeholder="Sort By : Date"
            type="select"
            onChange={(e) => setSortOrder(e.target.value)}
            value={sortOrder}
          >
            <option value={'desc'} >{t('Sort By')} : {t('Date')} {t('desc')}</option>
            <option value={'asc'} >{t('Sort By')} : {t('Date')} {t('asc')}</option>
          </Input>
        </Col>
        <Col xl={4} className='my-1'>
          <Input
            id="commStatus"
            className="btn-sm sort-select-input"
            name="commStatus"
            placeholder="Source"
            type="select"
            onChange={(e) => setcommStatus(e.target.value)}
            value={commStatus}
            data-testid='commStatus'
          >
            <option value={''} >--{t('status')}--</option>
            <option value="Ongoing" >{t('ongoing').toUpperCase()}</option>
            <option value="Expired" >{t('expired').toUpperCase()}</option>
          </Input>
        </Col>
        <Col xl={4} className='my-1'>
          <Input
            id="target"
            className="btn-sm sort-select-input"
            name="target"
            placeholder="Source"
            type="select"
            onChange={(e) => setTarget(e.target.value)}
            value={target}
            data-testid='target'
          >
            <option value={''} >--{t('target')}--</option>
            <option value="Public" className='text-capitalization'>{t('public')}</option>
            <option value="Citizen" className='text-capitalization'>{t('citizen')}</option>
            <option value="Professional" className='text-capitalization'>{t('professional')}</option>
            <option value="Organization" className='text-capitalization'>{t('organisation')}</option>
          </Input>
        </Col>
      </Row>
    </>
  )
}

SortSection.propTypes = {
  commStatus: PropTypes.string,
  sortOrder: PropTypes.string,
  setcommStatus: PropTypes.func,
  setSortOrder: PropTypes.func,
  t: PropTypes.func,
  setTogglePolygonMap: PropTypes.func,
  target: PropTypes.string,
  setTarget: PropTypes.func
}

export default withTranslation(['common'])(SortSection);
