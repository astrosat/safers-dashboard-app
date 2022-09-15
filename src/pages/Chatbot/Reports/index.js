import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';
import toastr from 'toastr';

import 'toastr/build/toastr.min.css'
import 'rc-pagination/assets/index.css';
import SortSection from './Components/SortSection';
import MapSection from './Components/Map';
import ReportList from './Components/ReportList';
import { getAllReports, resetReportResponseState } from '../../../store/reports/action';
import { getBoundingBox, getViewState, getIconLayer } from '../../../helpers/mapHelper';

import { useTranslation } from 'react-i18next';
import { MAP_TYPES } from '../../../constants/common';

const Reports = () => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const { allReports: OrgReportList, success, filteredReports } = useSelector(state => state.reports);
  const dateRange = useSelector(state => state.common.dateRange);

  const { t } = useTranslation();

  const [reportId, setReportId] = useState(undefined);
  const [viewState, setViewState] = useState(undefined);
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState('');
  const [category, setCategory] = useState('');
  const [midPoint, setMidPoint] = useState([]);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);
  const [missionId, setMissionId] = useState('')

  const dispatch = useDispatch();

  const allReports = filteredReports || OrgReportList;
  
  useEffect(() => {
    const dateRangeParams = dateRange
      ? { start: dateRange[0], end: dateRange[1] }
      : {};

    setReportId(undefined);
    const reportParams = {
      category: category ? category : undefined,
      bbox: boundingBox?.toString(),
      default_date: false,
      default_bbox: !boundingBox,
      ...dateRangeParams
    };
    dispatch(getAllReports(reportParams));
  }, [dateRange, boundingBox, category])

  useEffect(() => {
    if (success?.detail) {
      toastr.success(success.detail, '');
    }
    dispatch(resetReportResponseState());

  }, [success]);

  useEffect(() => {
    if (allReports.length > 0) {
      setIconLayer(getIconLayer(allReports, MAP_TYPES.REPORTS, 'report', dispatch, setViewState));      
    }
    if (!viewState) {
      setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
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
      <Row className='justify-content-end mb-2'>
        <Col xl={7} className='d-flex'>
          <Button color='link'
            onClick={handleResetAOI} className='p-0'>
            {t('default-aoi', { ns: 'common' })}</Button>
        </Col>
      </Row >
      <Row>
        <Col xl={5}>
          <SortSection
            t={t}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            setCategory={setCategory}
            missionId={missionId}
            setMissionId={setMissionId}
          />
          <Row>
            <Col xl={12} className='px-3'>
              <ReportList
                reportId={reportId}
                currentZoomLevel={currentZoomLevel}
                setViewState={setViewState}
                setReportId={setReportId}
                setIconLayer={setIconLayer} 
                missionId={missionId}
                category={category}
                sortOrder={sortOrder}
              />
            </Col>
          </Row>
        </Col>
        <Col xl={7} className='mx-auto'>
          <MapSection
            viewState={viewState}
            iconLayer={iconLayer}
            setViewState={setViewState}
            getReportsByArea={getReportsByArea}
            handleViewStateChange={handleViewStateChange}
            setNewWidth={setNewWidth}
            setNewHeight={setNewHeight}
          />
        </Col>
      </Row>
    </div >
  );
}

export default Reports;
