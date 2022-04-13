import React, { useEffect, useState } from 'react';
import { Col, Button, Row,  } from 'reactstrap';


import { useSelector, useDispatch } from 'react-redux';
import { getAllAreas } from '../../../../store/appAction';
import { setPolygonLayer, setViewState } from '../../../../store/common/action';
import {  getStats, getWeatherStats, getWeatherVariables } from '../../../../store/dashboard/action';

import { getPolygonLayer, getViewState } from '../../../../helpers/mapHelper';
import moment from 'moment';
import DateComponent from '../../../../components/DateRangePicker/DateRange';
import { useNavigate } from 'react-router-dom';
import { getInSituMedia, getTweets } from '../../../../store/events/action';

const SearchContainer = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const selectedAoi = useSelector(state => state.common.selectedAoi);
  
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    dispatch(getAllAreas())
    setMapLayers(defaultAoi)
  }, []);

  const getSearchData = () => {
    const searchAoi = selectedAoi ? selectedAoi : defaultAoi.features[0].properties.id
    const params = {};
    if(dateRange.length>1){
      params.startDate = moment(dateRange[0])
      params.endDate = moment(dateRange[1])
    }
    if(searchAoi) {
      params.aoi = searchAoi
    }
    dispatch(getStats(params))
    dispatch(getWeatherStats(params))
    dispatch(getWeatherVariables(params))
    dispatch(getInSituMedia(params))
    dispatch(getTweets(params))
  }

  useEffect(() => {
    getSearchData()
  }, [dateRange, selectedAoi]);

  const setMapLayers = (objAoi) => {
    dispatch(setPolygonLayer(getPolygonLayer(objAoi)));
    dispatch(setViewState(getViewState(objAoi.features[0].properties.midPoint, objAoi.features[0].properties.zoomLevel)))
  }

  const setDates = (dates) => {
    setDateRange(dates)
    getSearchData()
  }

  return(
    <Row className='d-flex'>
      <Col >
        <Button onClick={() => navigate(-1)} className='back-arrow px-0 py-0'>
          <i className='bx bx-arrow-back fa-2x'></i>
        </Button>
      </Col>
      <Col md={3}>
        <DateComponent setDates={setDates} />
      </Col> 
    </Row>
  )}

export default SearchContainer;
