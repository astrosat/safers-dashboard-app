import React from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Row, Card } from 'reactstrap';

import { allReportsSelector } from 'store/reports.slice';

import Report from '../../Chatbot/Reports/Components/Report';
import { MAX_REPORTS } from '../constants';

const ReportBar = ({ t }) => {
  const allReports = useSelector(allReportsSelector);
  const truncatedReports = allReports.slice(0, MAX_REPORTS);

  return (
    <Container fluid="true">
      <Card>
        <Row className="align-self-baseline alert-title mx-3">
          <Link to="/chatbot?tab=4">
            <p>
              {t('Reports', { ns: 'common' })}{' '}
              <i className="fas fa-file-image float-right"></i>
            </p>
          </Link>
        </Row>
        <Row xs={1} sm={1} md={2} lg={2} xl={3} className="mx-4 gx-2">
          {allReports && allReports.length === 0 ? (
            <div>
              <p className="ml-3">{t('No new reports in AOI')}</p>
            </div>
          ) : null}
          {truncatedReports
            ? truncatedReports.map(report => (
                <Card className="my-3" key={`report_${report.report_id}`}>
                  <Report
                    key={report.report_id}
                    report={report}
                    selectReport={() => {}}
                  />
                </Card>
              ))
            : null}
        </Row>
        {allReports && allReports.length > MAX_REPORTS ? (
          <Row xs={1} className="mx-4">
            <Link to="/chatbot?tab=4">
              <p>
                {t('See more reports...', { ns: 'common' })}{' '}
                <i className="fas fa-file-image float-right"></i>
              </p>
            </Link>
          </Row>
        ) : null}
      </Card>
    </Container>
  );
};

ReportBar.propTypes = {
  t: PropTypes.func,
};

export default withTranslation(['dashboard'])(ReportBar);
