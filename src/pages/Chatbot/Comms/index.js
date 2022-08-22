import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';

import 'toastr/build/toastr.min.css'
import 'rc-pagination/assets/index.css';
import SortSection from './Components/SortSection';
import MapSection from './Components/Map';
import CommsList from './Components/CommsList';
import CreateMessage from './Components/CreateMessage';
import { getAllComms, resetCommsResponseState } from '../../../store/comms/action';
import { getBoundingBox, getIconLayer, getViewState } from '../../../helpers/mapHelper';

import { useTranslation } from 'react-i18next';
import { MAP_TYPES } from '../../../constants/common';

const Comms = () => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const { allComms, success, filteredComms } = useSelector(state => state.comms);
  const dateRange = useSelector(state => state.common.dateRange);

  const { t } = useTranslation();

  const [commID, setCommID] = useState(undefined);
  const [viewState, setViewState] = useState(undefined);
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState('desc');
  const [commStatus, setcommStatus] = useState('');
  const [target, setTarget] = useState('');
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);
  const [coordinates, setCoordinates] = useState('');
  const [togglePolygonMap, setTogglePolygonMap] = useState(false);
  const [toggleCreateNewMessage, setToggleCreateNewMessage] = useState(false);

  const dispatch = useDispatch();

  const allReports = filteredComms || allComms;

  useEffect(() => {
    const dateRangeParams = dateRange
      ? { start: dateRange[0], end: dateRange[1] }
      : {};

    setCommID(undefined);
    const reportParams = {
      bbox: boundingBox?.toString(),
      default_date: false,
      default_bbox: !boundingBox,
      ...dateRangeParams
    };
    dispatch(getAllComms(reportParams, {sortOrder, status:commStatus, target}));
  }, [dateRange, boundingBox])

  useEffect(() => {
    if (success?.detail) {
      toastr.success(success.detail, '');
    }
    dispatch(resetCommsResponseState());

  }, [success]);

  useEffect(() => {
    if (allReports.length > 0) {
      setIconLayer(getIconLayer(allReports, MAP_TYPES.REPORTS));
      if (!viewState) {
        setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
      }
    }
  }, [allReports]);

  const getReportsByArea = () => {
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
        {!toggleCreateNewMessage && <Col xl={5}>
          <SortSection
            commStatus={commStatus}
            sortOrder={sortOrder}
            setcommStatus={setcommStatus}
            setSortOrder={setSortOrder}
            setTogglePolygonMap={() => { setTogglePolygonMap(true); setToggleCreateNewMessage(true); }}
            target={target}
            setTarget={setTarget}
          />
          <Row>
            <Col xl={12} className='px-3'>
              <CommsList
                commID={commID}
                currentZoomLevel={currentZoomLevel}
                setViewState={setViewState}
                setCommID={setCommID}
                setIconLayer={setIconLayer} />
            </Col>
          </Row>
        </Col>}
        {toggleCreateNewMessage && <Col xl={5}>
          <CreateMessage
            onCancel={() => {
              setTogglePolygonMap(false);
              setToggleCreateNewMessage(false);
              setCoordinates('');
            }}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
          />
        </Col>}
        <Col xl={7} className='mx-auto'>
          <MapSection
            viewState={viewState}
            iconLayer={iconLayer}
            setViewState={setViewState}
            getReportsByArea={getReportsByArea}
            handleViewStateChange={handleViewStateChange}
            setNewWidth={setNewWidth}
            setNewHeight={setNewHeight}
            setCoordinates={setCoordinates}
            togglePolygonMap={togglePolygonMap}
            coordinates={coordinates}
          />
        </Col>
      </Row>
    </div >
  );
}

export default Comms;
