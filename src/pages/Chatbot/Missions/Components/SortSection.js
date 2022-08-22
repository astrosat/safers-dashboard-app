import React, { useEffect } from 'react';
import { Row, Col, Input, Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';

//i18N
import { withTranslation } from 'react-i18next';

import { setFilterdMissions } from '../../../../store/missions/action';
import { getFilteredRec } from '../../filter';

const SortSection = ({ t, missionStatus, sortOrder, setMissionStatus, setSortOrder, setTogglePolygonMap }) => {
  const { allMissions } = useSelector(state => state.missions);
  const dispatch = useDispatch();

  useEffect(() => {
    if(allMissions.length > 0) {
      const filters = { status: missionStatus };
      const sort = {fieldName: 'start', order: sortOrder};
      const actFiltered = getFilteredRec(allMissions, filters, sort);
      dispatch(setFilterdMissions(actFiltered));
    }
  }, [sortOrder, missionStatus]);

  return (
    <>

      <Row className=''>
        <Col>
          <Button
            onClick={setTogglePolygonMap}>
            Create New Mission
          </Button>
        </Col>
        <Col xl={3} className="d-flex justify-content-end">
          <span className='my-auto alert-report-text'>{t('Results')} {allMissions.length}</span>
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
        <Col xl={6} className='my-1'>
          <Input
            id="missionStatus"
            className="btn-sm sort-select-input"
            name="missionStatus"
            placeholder="Source"
            type="select"
            onChange={(e) => setMissionStatus(e.target.value)}
            value={missionStatus}
            data-testid='missionStatus'
          >
            <option value={''} >--Status--</option>
            <option value="Created" >{t('created').toUpperCase()}</option>
            <option value="TakenInCharge" >{t('taken in charge').toUpperCase()}</option>
            <option value="Completed" >{t('completed').toUpperCase()}</option>
          </Input>
        </Col>
      </Row>
    </>
  )
}

SortSection.propTypes = {
  missionStatus: PropTypes.any,
  sortOrder: PropTypes.string,
  setMissionStatus: PropTypes.func,
  setSortOrder: PropTypes.func,
  t: PropTypes.func,
  setTogglePolygonMap: PropTypes.func
}

export default withTranslation(['common'])(SortSection);
