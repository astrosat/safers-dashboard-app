import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';
import _ from 'lodash';

import 'toastr/build/toastr.min.css'
import 'rc-pagination/assets/index.css';
import SortSection from './Components/SortSection';
import MapSection from './Components/Map';
import PeopleList from './Components/PeopleList';
import { getAllPeople, resetPeopleResponseState, setFilters } from '../../../store/people/action';
import { getBoundingBox, getIconLayer, getViewState } from '../../../helpers/mapHelper';

import { useTranslation } from 'react-i18next';
import { MAP_TYPES } from '../../../constants/common';

const People = () => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const { allPeople: orgPplList, filteredPeople, success } = useSelector(state => state.people);
  const dateRange = useSelector(state => state.common.dateRange);

  let allPeople = filteredPeople || orgPplList;

  const { t } = useTranslation();

  const [peopleId, setPeopleId] = useState(undefined);
  const [viewState, setViewState] = useState(undefined);
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState('asc');
  const [status, setStatus] = useState(undefined);
  const [activity, setActivity] = useState('');
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);

  const dispatch = useDispatch();

  useEffect(() => {
    const dateRangeParams = dateRange
      ? { start: dateRange[0], end: dateRange[1] }
      : {};

    setPeopleId(undefined);
    const peopleParams = {
      order: sortOrder,
      status: status ? status : undefined,
      bbox: boundingBox?.toString(),
      default_date: false,
      default_bbox: !boundingBox,
      activity: activity == '' ? undefined : activity,
      ...dateRangeParams
    };
    dispatch(getAllPeople(peopleParams));
  }, [dateRange, status, boundingBox])

  useEffect(() => {
    if(orgPplList.length > 0) {
      let actFiltered = [...orgPplList];
      if(activity !== ''){
        actFiltered = actFiltered.filter((person) => person.activity == activity);
      }
      actFiltered = _.orderBy(actFiltered , [(o) => new Date(o.timestamp)], [sortOrder]);
      dispatch(setFilters(actFiltered));
    }
  }, [activity, sortOrder])

  useEffect(() => {
    if (success?.detail) {
      toastr.success(success.detail, '');
    }
    dispatch(resetPeopleResponseState());

  }, [success]);

  useEffect(() => {
    if (allPeople.length > 0) {
      setIconLayer(getIconLayer(allPeople, MAP_TYPES.PEOPLE));
      if (!viewState) {
        setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
      }
    }
  }, [allPeople]);

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
            setViewState={setViewState}
            getPeopleByArea={getPeopleByArea}
            handleViewStateChange={handleViewStateChange}
            setNewWidth={setNewWidth}
            setNewHeight={setNewHeight}
          />
        </Col>
      </Row>
    </div >
  );
}

export default People;
