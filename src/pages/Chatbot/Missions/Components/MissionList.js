import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { getIconLayer, getViewState } from '../../../../helpers/mapHelper';
import PaginationWrapper from '../../../../components/Pagination';
import { setFavorite } from '../../../../store/missions/action';
import Mission from './Mission';
import { MAP_TYPES } from '../../../../constants/common';

const MissionList = ({ missionId, currentZoomLevel, setViewState, setMissionId, setIconLayer }) => {
  const { allMissions: OrgMissionList, filteredMissions } = useSelector(state => state.missions);
  const [pageData, setPageData] = useState([]);
  const dispatch = useDispatch();

  const allMissions = filteredMissions || OrgMissionList;

  const setFavoriteFlag = (id) => {
    let selectedMission = _.find(pageData, { id });
    selectedMission.isFavorite = !selectedMission.isFavorite;
    dispatch(setFavorite(id, selectedMission.isFavorite));
  }

  const setSelectedMission = (mission_id) => {
    if (mission_id) {
      setMissionId(mission_id);
      let missionList = _.cloneDeep(allMissions);
      let selectedMission = _.find(missionList, { id:mission_id });
      selectedMission.isSelected = true;
      setIconLayer(getIconLayer(missionList, MAP_TYPES.CHATBOT_MISSIONS));
      setViewState(getViewState(selectedMission.location, currentZoomLevel))
    } else {
      setMissionId(undefined);
      setIconLayer(getIconLayer(allMissions, MAP_TYPES.CHATBOT_MISSIONS));
    }
  }
  const updatePage = data => {
    setMissionId(undefined);
    setIconLayer(getIconLayer(data, MAP_TYPES.CHATBOT_MISSIONS));
    setPageData(data);
  };

  return (
    <>
      <Row>
        {
          pageData.map((mission) =>
            <Mission
              key={mission.mission_id}
              card={mission}
              missionId={missionId}
              setSelectedMission={setSelectedMission}
              setFavorite={setFavoriteFlag}
            />)
        }
      </Row>
      <Row className='text-center'>
        <PaginationWrapper pageSize={4} list={allMissions} setPageData={updatePage} />
      </Row>
    </>)
}

MissionList.propTypes = {
  missionId: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  setViewState: PropTypes.func,
  setMissionId: PropTypes.func,
  setIconLayer: PropTypes.func,
}

export default MissionList;
