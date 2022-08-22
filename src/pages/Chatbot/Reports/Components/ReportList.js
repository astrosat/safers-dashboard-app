import _ from 'lodash';
import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux';
import { Row } from 'reactstrap';
import { getIconLayer, getViewState } from '../../../../helpers/mapHelper';
import PaginationWrapper from '../../../../components/Pagination';
import { setFavorite } from '../../../../store/reports/action';
import Report from './Report';
import { MAP_TYPES } from '../../../../constants/common';


const ReportList = ({ reportId, currentZoomLevel, setViewState, setReportId, setIconLayer }) => {
  const { allReports: OrgReportList, filteredReports } = useSelector(state => state.reports);
  const [pageData, setPageData] = useState([]);

  const dispatch = useDispatch();


  const allReports = filteredReports || OrgReportList;

  const setFavoriteFlag = (id) => {
    let selectedReport = _.find(pageData, { id });
    selectedReport.isFavorite = !selectedReport.isFavorite;
    dispatch(setFavorite(id, selectedReport.isFavorite));
  }

  const setSelectedReport = (report_id) => {
    if (report_id) {
      setReportId(report_id);
      let reportList = _.cloneDeep(allReports);
      let selectedReport = _.find(reportList, { report_id });
      selectedReport.isSelected = true;
      setIconLayer(getIconLayer(reportList, MAP_TYPES.CHATBOT_REPORTS));
      setViewState(getViewState(selectedReport.location, currentZoomLevel))
    } else {
      setReportId(undefined);
      setIconLayer(getIconLayer(allReports, MAP_TYPES.CHATBOT_REPORTS));
    }
  }
  const updatePage = data => {
    setReportId(undefined);
    setIconLayer(getIconLayer(data, MAP_TYPES.CHATBOT_REPORTS));
    setPageData(data);
  };

  return (
    <>
      <Row>
        {
          pageData.map((report) =>
            <Report
              key={report.report_id}
              card={report}
              reportId={reportId}
              setSelectedReport={setSelectedReport}
              setFavorite={setFavoriteFlag}
            />)
        }
      </Row>
      <Row className='text-center'>
        <PaginationWrapper pageSize={4} list={allReports} setPageData={updatePage} />
      </Row>
    </>)
}

ReportList.propTypes = {
  reportId: PropTypes.any,
  currentZoomLevel: PropTypes.any,
  setViewState: PropTypes.func,
  setReportId: PropTypes.func,
  setIconLayer: PropTypes.func,
}

export default ReportList;
