import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';
import PropTypes from 'prop-types'


import 'toastr/build/toastr.min.css'
import 'rc-pagination/assets/index.css';
import SortSection from './Components/SortSection';
import MapSection from './Components/Map';
import PeopleList from './Components/PeopleList';
import { getAllPeople, resetPeopleResponseState } from '../../../store/people/action';
import { getBoundingBox, getViewState, getIconLayer } from '../../../helpers/mapHelper';

import { useTranslation } from 'react-i18next';
import { MAP_TYPES } from '../../../constants/common';
import { fetchEndpoint } from '../../../helpers/apiHelper';
import useInterval from '../../../customHooks/useInterval';

const People = ({ pollingFrequency }) => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const { allPeople: orgPplList, filteredPeople, success } = useSelector(state => state.people);
  const { dateRange } = useSelector(state => state.common);

  let allPeople = filteredPeople || orgPplList;

  const { t } = useTranslation();

  const [peopleId, setPeopleId] = useState(undefined);
  const [viewState, setViewState] = useState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel));
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState('desc');
  const [status, setStatus] = useState('');
  const [activity, setActivity] = useState('');
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);
  const [activitiesOptions, setActivitiesOptions] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const activitiesOptions = await fetchEndpoint(
        '/chatbot/people/activities'
      );
      setActivitiesOptions(activitiesOptions);
    })();
  }, [])

  useEffect(() => {
    const dateRangeParams = dateRange
      ? { start: dateRange[0], end: dateRange[1] }
      : {};

    setPeopleId(undefined);
    const peopleParams = {
      bbox: boundingBox?.toString(),
      default_date: false,
      default_bbox: !boundingBox,
      ...dateRangeParams
    };
    const feFilters = {      
      activity,
      status,
      sortOrder
    }
    dispatch(getAllPeople(peopleParams, feFilters));
  }, [dateRange, boundingBox])

  useEffect(() => {
    if (success?.detail) {
      toastr.success(success.detail, '');
    }
    dispatch(resetPeopleResponseState());

  }, [success]);

  useEffect(() => {
    if (allPeople.length > 0) {
      setIconLayer(getIconLayer(allPeople, MAP_TYPES.PEOPLE, 'people', dispatch, setViewState, {id: peopleId}));
    }
  }, [allPeople, peopleId]);

  useInterval(() => {
    const dateRangeParams = dateRange ? { start: dateRange[0], end: dateRange[1] } : {};
    dispatch(getAllPeople(dateRangeParams, null, true));
  }, pollingFrequency)

  const getPeopleByArea = () => {
    setBoundingBox(getBoundingBox(midPoint, currentZoomLevel, newWidth, newHeight));
  }

  const handleViewStateChange = (e) => {
    if (e && e.viewState) {
      setMidPoint([e.viewState.longitude, e.viewState.latitude]);
      setCurrentZoomLevel(e.viewState.zoom);
    }
  };

  const handleResetAOI = useCallback(() => {
    setBoundingBox(undefined);
    setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
  }, []);

  const onClick = (info) => {
    const { id } = info?.object?.properties ?? {};
    setPeopleId(peopleId === id ? undefined : id)
  }

  return (
    <div className='mx-2'>
      <Row className="justify-content-end mb-2">
        <Col xl={7}>
          <Button color='link'
            onClick={handleResetAOI} className='p-0'>
            {t('default-aoi', { ns: 'common' })}</Button>
        </Col>
      </Row >
      <Row>
        <Col xl={5}>
          <SortSection
            status={status}
            activity={activity}
            sortOrder={sortOrder}
            setStatus={setStatus}
            setActivity={setActivity}
            setSortOrder={setSortOrder}
            activitiesOptions={activitiesOptions}
          />
          <Row>
            <Col xl={12} className='px-3'>
              <PeopleList
                peopleId={peopleId}
                currentZoomLevel={currentZoomLevel}
                setViewState={setViewState}
                setPeopleId={setPeopleId}
                setIconLayer={setIconLayer} />
            </Col>
          </Row>
        </Col>
        <Col xl={7} className='mx-auto'>
          <MapSection
            viewState={viewState}
            iconLayer={iconLayer}
            getPeopleByArea={getPeopleByArea}
            setViewState={setViewState}
            handleViewStateChange={handleViewStateChange}
            setNewWidth={setNewWidth}
            setNewHeight={setNewHeight}
            onClick={onClick}
          />
        </Col>
      </Row>
    </div >
  );
}

People.propTypes = {
  pollingFrequency: PropTypes.number,
}

export default People;
