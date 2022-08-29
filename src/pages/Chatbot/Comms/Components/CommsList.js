import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { getIconLayer, getViewState } from '../../../../helpers/mapHelper';
import PaginationWrapper from '../../../../components/Pagination';
import Comm from './Comm';

const MAP_TYPE = 'reports';

const CommsList = ({ commID, currentZoomLevel, setViewState, setCommID, setIconLayer }) => {
  const { allComms, filteredComms } = useSelector(state => state.comms);
  const [pageData, setPageData] = useState([]);


  const commList = filteredComms || allComms;

  const setSelectedComm = (mission_id) => {
    if (mission_id) {
      setCommID(mission_id);
      let copyCommList = _.cloneDeep(commList);
      let selectedComm = _.find(copyCommList, { id: mission_id });
      selectedComm.isSelected = true;
      setIconLayer(getIconLayer(copyCommList, MAP_TYPE));
      setViewState(getViewState(selectedComm.location, currentZoomLevel))
    } else {
      setCommID(undefined);
      setIconLayer(getIconLayer(commList, MAP_TYPE));
    }
  }
  const updatePage = data => {
    setCommID(undefined);
    setIconLayer(getIconLayer(data, MAP_TYPE));
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
              commID={commID}
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
  commID: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  setViewState: PropTypes.func,
  setCommID: PropTypes.func,
  setIconLayer: PropTypes.func,
}

export default CommsList;