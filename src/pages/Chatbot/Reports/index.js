import React, { useEffect, useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';

import { useMap } from 'components/BaseMap/MapContext';
import { MAP_TYPES } from 'constants/common';
import useInterval from 'customHooks/useInterval';
import { getIconLayer } from 'helpers/mapHelper';
import { dateRangeSelector } from 'store/common.slice';
import {
  fetchReports,
  allReportsSelector,
  filteredReportsSelector,
  reportsBoundingBoxSelector,
} from 'store/reports.slice';
import { defaultAoiSelector } from 'store/user.slice';

import ReportList from './Components/ReportList';
import SortSection from './Components/SortSection';
import MapSection from '../Components/DefaultMapSection';

const Reports = ({ pollingFrequency }) => {
  const { deckRef, viewState, updateViewState } = useMap();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const defaultAoi = useSelector(defaultAoiSelector);
  const allReports = useSelector(allReportsSelector);
  const filteredReports = useSelector(filteredReportsSelector);
  const dateRange = useSelector(dateRangeSelector);

  const gBbox = useSelector(reportsBoundingBoxSelector);

  const [selectedReport, setSelectedReport] = useState(undefined);
  const [iconLayer, setIconLayer] = useState(undefined);
  const [boundingBox, setBoundingBox] = useState(gBbox);
  const [reportParams, setReportParams] = useState({});

  const reportsList = filteredReports || allReports;

  useEffect(() => {
    setReportParams(previous => {
      const options = {
        ...previous,
        bbox: boundingBox?.toString(),
        default_date: false,
        default_bbox: !boundingBox,
        ...(dateRange
          ? {
              start: dateRange[0],
              end: dateRange[1],
            }
          : {}),
      };
      dispatch(fetchReports({ options }));
      return options;
    });
  }, [boundingBox, dateRange, dispatch]);

  useEffect(() => {
    const reports = reportsList.map(report => {
      const { report_id: id, ...rest } = report;
      return { id, ...rest };
    });

    setIconLayer(
      getIconLayer(reports, MAP_TYPES.REPORTS, 'report', {
        id: selectedReport?.report_id,
      }),
    );
  }, [reportsList, selectedReport?.report_id]);

  useInterval(
    () => dispatch(fetchReports({ options: reportParams, isPoling: true })),
    pollingFrequency,
    [reportParams],
  );

  const getReportsByArea = () =>
    setBoundingBox(deckRef.current.deck.viewManager._viewports[0].getBounds());

  const handleResetAOI = useCallback(
    () =>
      updateViewState({
        longitude: defaultAoi.features[0].properties.midPoint[0],
        latitude: defaultAoi.features[0].properties.midPoint[1],
        zoom: defaultAoi.features[0].properties.zoomLevel,
      }),
    [defaultAoi.features, updateViewState],
  );

  const onClick = info => {
    const id = info?.object?.properties.id;

    if (id) {
      const report = reportsList.find(r => r.report_id === id);

      if (report) {
        setSelectedReport(report);
      }
    }
  };

  return (
    <div className="mx-2">
      <Row className="justify-content-end mb-2">
        <Col xl={7} className="d-flex">
          <Button color="link" onClick={handleResetAOI} className="p-0">
            {t('default-aoi', { ns: 'common' })}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xl={5}>
          <SortSection
            t={t}
            boundingBox={boundingBox}
            mapFilter={{
              midPoint: [viewState.longitude, viewState.latitude],
              currentZoomLevel: viewState.zoom,
            }}
          />
          <Row>
            <Col xl={12} className="px-3">
              <ReportList
                selectedReport={selectedReport}
                setSelectedReport={setSelectedReport}
              />
            </Col>
          </Row>
        </Col>
        <Col xl={7} className="mx-auto">
          <MapSection
            iconLayer={iconLayer}
            getInfoByArea={getReportsByArea}
            onClick={onClick}
          />
        </Col>
      </Row>
    </div>
  );
};

Reports.propTypes = {
  pollingFrequency: PropTypes.number,
};

export default Reports;
