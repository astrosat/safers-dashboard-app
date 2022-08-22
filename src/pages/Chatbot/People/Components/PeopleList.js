import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { getIconLayer, getViewState } from '../../../../helpers/mapHelper';
import PaginationWrapper from '../../../../components/Pagination';
import People from './People';
import { MAP_TYPES } from '../../../../constants/common';

const PeopleList = ({ peopleId, currentZoomLevel, setViewState, setPeopleId, setIconLayer }) => {
  const { allPeople: OrgPeopleList, filteredPeople } = useSelector(state => { return state.people });
  const [pageData, setPageData] = useState([]);

  const allPeople = filteredPeople || OrgPeopleList;

  const setSelectedPeople = (people_id) => {
    if (people_id) {
      setPeopleId(people_id);
      let peopleList = _.cloneDeep(allPeople);
      let selectedPeople = _.find(peopleList, { id:people_id });
      selectedPeople.isSelected = true;
      setIconLayer(getIconLayer(peopleList, MAP_TYPES.CHATBOT_PEOPLE));
      setViewState(getViewState(selectedPeople.location, currentZoomLevel))
    } else {
      setPeopleId(undefined);
      setIconLayer(getIconLayer(allPeople, MAP_TYPES.CHATBOT_PEOPLE));
    }
  }
  const updatePage = data => {
    setPeopleId(undefined);
    setIconLayer(getIconLayer(data, MAP_TYPES.CHATBOT_PEOPLE));
    setPageData(data);
  };

  return (
    <>
      <Row>
        {
          pageData.map((people) =>
            <People
              key={people.id}
              card={people}
              peopleId={peopleId}
              setSelectedPeople={setSelectedPeople}
            />)
        }
      </Row>
      <Row className='text-center'>
        <PaginationWrapper pageSize={4} list={allPeople} setPageData={updatePage} />
      </Row>
    </>)
}

PeopleList.propTypes = {
  peopleId: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  setViewState: PropTypes.func,
  setPeopleId: PropTypes.func,
  setIconLayer: PropTypes.func,
}

export default PeopleList;
