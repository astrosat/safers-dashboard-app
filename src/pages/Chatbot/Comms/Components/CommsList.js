import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { getIconLayer, getViewState } from '../../../../helpers/mapHelper';
import PaginationWrapper from '../../../../components/Pagination';
import Comm from './Comm';
import { MAP_TYPES } from '../../../../constants/common';

const CommsList = ({ reportId, currentZoomLevel, setViewState, setReportId, setIconLayer }) => {
  const { allComms, filteredComms } = useSelector(state => state.comms);
  const [pageData, setPageData] = useState([]);


  const commList = filteredComms || allComms;

  const setSelectedComm = (mission_id) => {
    if (mission_id) {
      setReportId(mission_id);
      let copyCommList = _.cloneDeep(commList);
      let selectedComm = _.find(copyCommList, { mission_id });
      selectedComm.isSelected = true;
      setIconLayer(getIconLayer(copyCommList, MAP_TYPES.CHATBOT_COMMS));
      setViewState(getViewState(selectedComm.location, currentZoomLevel))
    } else {
      setReportId(undefined);
      setIconLayer(getIconLayer(commList, MAP_TYPES.CHATBOT_COMMS));
    }
  }
  const updatePage = data => {
    setReportId(undefined);
    setIconLayer(getIconLayer(data, MAP_TYPES.CHATBOT_COMMS));
    setPageData(data);
  };

  return (
    <>
      <Row>
        {
          pageData.map((comm) =>
            <Comm
              key={comm.mission_id}
              card={comm}
              reportId={reportId}
              setSelectedComm={setSelectedComm}
            />)
        }
      </Row>
      <Row className='text-center'>
        <PaginationWrapper pageSize={4} list={commList} setPageData={updatePage} />
      </Row>
    </>)
}

CommsList.propTypes = {
  reportId: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  setViewState: PropTypes.func,
  setReportId: PropTypes.func,
  setIconLayer: PropTypes.func,
}

export default CommsList;
