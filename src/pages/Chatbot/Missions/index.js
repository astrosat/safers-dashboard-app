import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';
import PropTypes from 'prop-types'

import 'toastr/build/toastr.min.css'
import 'rc-pagination/assets/index.css';
import SortSection from './Components/SortSection';
import MapSection from './Components/Map';
import MissionList from './Components/MissionList';
import { getAllMissions, resetMissionResponseState } from '../../../store/missions/action';
import { getBoundingBox, getViewState } from '../../../helpers/mapHelper';

import { useTranslation } from 'react-i18next';
import { MAP_TYPES } from '../../../constants/common';
import CreateMission from './Components/CreateMission';
import { getIconLayer } from '../../../helpers/mapHelper';
import useInterval from '../../../customHooks/useInterval';


const Missions = ({ pollingFrequency }) => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const { allMissions: OrgMissionList, success, filteredMissions } = useSelector(state => state.missions);
  const dateRange = useSelector(state => state.common.dateRange);

  const { t } = useTranslation();

  const [missionId, setMissionId] = useState(undefined);
  const [viewState, setViewState] = useState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel));
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState('desc');
  const [missionStatus, setMissionStatus] = useState('');
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);
  const [coordinates, setCoordinates] = useState('');
  const [togglePolygonMap, setTogglePolygonMap] = useState(false);
  const [toggleCreateNewMission, setToggleCreateNewMission] = useState(false);

  const dispatch = useDispatch();

  const allMissions = filteredMissions || OrgMissionList;

  const loadAllMissions = () => {
    const dateRangeParams = dateRange
      ? { start: dateRange[0], end: dateRange[1] }
      : {};

    setMissionId(undefined);
    const missionParams = {
      bbox: boundingBox?.toString(),
      default_date: false,
      default_bbox: !boundingBox,
      ...dateRangeParams
    };

    const feFilters = {
      order: sortOrder,
      status: missionStatus
    };

    dispatch(getAllMissions(missionParams, feFilters));
  }

  const onCancel = () => {
    setTogglePolygonMap(false);
    setToggleCreateNewMission(false);
    setCoordinates('');
    loadAllMissions();
  }

  useEffect(() => {
    loadAllMissions();
  }, [dateRange, boundingBox])

  useEffect(() => {
    if (success?.detail) {
      toastr.success(success.detail, '');
    }
    dispatch(resetMissionResponseState());

  }, [success]);

  useEffect(() => {
    if (allMissions.length > 0) {
      setIconLayer(getIconLayer(allMissions, MAP_TYPES.MISSIONS, 'target', dispatch, setViewState, {id: missionId}));
    }
  }, [allMissions, missionId]);

  useInterval(() => {
    const dateRangeParams = dateRange ? { start: dateRange[0], end: dateRange[1] } : {};
    dispatch(getAllMissions(dateRangeParams, null, true));
  }, pollingFrequency)


  const getMissionsByArea = () => {
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
    setMissionId(missionId === id ? undefined : id)
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
        {!toggleCreateNewMission && <Col xl={5}>
          <SortSection
            t={t}
            missionStatus={missionStatus}
            sortOrder={sortOrder}
            setMissionStatus={setMissionStatus}
            setSortOrder={setSortOrder}
            setTogglePolygonMap={() => { setTogglePolygonMap(true); setToggleCreateNewMission(true); }}
          />
          <Row>
            <Col xl={12} className='px-3'>
              <MissionList
                missionId={missionId}
                currentZoomLevel={currentZoomLevel}
                setViewState={setViewState}
                setMissionId={setMissionId}
                setIconLayer={setIconLayer} />
            </Col>
          </Row>
        </Col>}
        {toggleCreateNewMission && <Col xl={5}>
          <CreateMission onCancel={onCancel} t={t} coordinates={coordinates} setCoordinates={setCoordinates} />

        </Col>}
        <Col xl={7} className='mx-auto'>
          <MapSection
            viewState={viewState}
            iconLayer={iconLayer}
            setViewState={setViewState}
            getMissionsByArea={getMissionsByArea}
            handleViewStateChange={handleViewStateChange}
            setNewWidth={setNewWidth}
            setNewHeight={setNewHeight}
            setCoordinates={setCoordinates}
            togglePolygonMap={togglePolygonMap}
            coordinates={coordinates}
            onClick={onClick}
          />
        </Col>
      </Row>
    </div >
  );
}

Missions.propTypes = {
  pollingFrequency: PropTypes.number,
}

export default Missions;
