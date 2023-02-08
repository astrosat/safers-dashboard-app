import React, { useState } from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Row } from 'reactstrap';

import { ZOOM_LEVEL } from 'pages/Chatbot/constants';

import People from './People';
import PaginationWrapper from '../../../../components/Pagination';
import { MAP_TYPES } from '../../../../constants/common';
import { getViewState, getIconLayer } from '../../../../helpers/mapHelper';

const PeopleList = ({ peopleId, setViewState, setPeopleId, setIconLayer }) => {
  const { allPeople: OrgPeopleList, filteredPeople } = useSelector(state => {
    return state.people;
  });
  const [pageData, setPageData] = useState([]);
  const dispatch = useDispatch();

  const allPeople = filteredPeople || OrgPeopleList;

  const setSelectedPeople = people_id => {
    if (people_id) {
      setPeopleId(people_id);
      let peopleList = _.cloneDeep(allPeople);
      let selectedPeople = _.find(peopleList, { id: people_id });
      selectedPeople.isSelected = true;
      setIconLayer(
        getIconLayer(
          peopleList,
          MAP_TYPES.PEOPLE,
          'people',
          dispatch,
          setViewState,
          selectedPeople,
        ),
      );
      setViewState(getViewState(selectedPeople.location, ZOOM_LEVEL));
    } else {
      setPeopleId(undefined);
      setIconLayer(
        getIconLayer(
          allPeople,
          MAP_TYPES.PEOPLE,
          'people',
          dispatch,
          setViewState,
          {},
        ),
      );
    }
  };
  const updatePage = data => {
    setPeopleId(undefined);
    setIconLayer(
      getIconLayer(
        data,
        MAP_TYPES.PEOPLE,
        'people',
        dispatch,
        setViewState,
        {},
      ),
    );
    setPageData(data);
  };

  return (
    <>
      <Row>
        {pageData.map(people => (
          <People
            key={people.id}
            card={people}
            peopleId={peopleId}
            setSelectedPeople={setSelectedPeople}
          />
        ))}
      </Row>
      <Row className="text-center">
        <PaginationWrapper
          pageSize={4}
          list={allPeople}
          setPageData={updatePage}
        />
      </Row>
    </>
  );
};

PeopleList.propTypes = {
  peopleId: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  setViewState: PropTypes.func,
  setPeopleId: PropTypes.func,
  setIconLayer: PropTypes.func,
};

export default PeopleList;
