import React, { useEffect, useState } from 'react';

import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Col, Button, Row } from 'reactstrap';

import { useMap } from 'components/BaseMap/MapContext';
import DateComponent from 'components/DateRangePicker/DateRange';
import { getPolygonLayer, getViewState } from 'helpers/mapHelper';
import {
  fetchAois,
  setPolygonLayer,
  selectedAoiSelector,
} from 'store/common.slice';
import {
  fetchStats,
  fetchWeatherStats,
  fetchWeatherVariables,
} from 'store/dashboard.slice';
import { fetchEventCameraMedia, fetchEventTweets } from 'store/events.slice';
import { defaultAoiSelector } from 'store/user.slice';

const SearchContainer = () => {
  const { setViewState } = useMap();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const defaultAoi = useSelector(defaultAoiSelector);
  const selectedAoi = useSelector(selectedAoiSelector);

  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    dispatch(fetchAois());
    setMapLayers(defaultAoi);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getSearchData = () => {
    const searchAoi = selectedAoi
      ? selectedAoi
      : defaultAoi.features[0].properties.id;
    const params = {};
    if (dateRange.length > 1) {
      params.startDate = moment(dateRange[0]);
      params.endDate = moment(dateRange[1]);
    }
    if (searchAoi) {
      params.aoi = searchAoi;
    }
    dispatch(fetchStats(params));
    dispatch(fetchWeatherStats(params));
    dispatch(fetchWeatherVariables(params));
    dispatch(fetchEventCameraMedia(params));
    dispatch(fetchEventTweets(params));
  };

  useEffect(() => {
    getSearchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, selectedAoi]);

  const setMapLayers = objAoi => {
    dispatch(setPolygonLayer(getPolygonLayer(objAoi)));
    dispatch(
      setViewState(
        getViewState(
          objAoi.features[0].properties.midPoint,
          objAoi.features[0].properties.zoomLevel,
        ),
      ),
    );
  };

  const setDates = dates => {
    setDateRange(dates);
    getSearchData();
  };

  return (
    <Row className="d-flex">
      <Col>
        <Button onClick={() => navigate(-1)} className="back-arrow px-0 py-0">
          <i className="bx bx-arrow-back fa-2x"></i>
        </Button>
      </Col>
      <Col md={3}>
        <DateComponent setDates={setDates} />
      </Col>
    </Row>
  );
};

export default SearchContainer;
