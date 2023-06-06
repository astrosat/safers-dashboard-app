import React, { Fragment } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
  Button,
  Badge,
} from 'reactstrap';

import { formatDate } from 'utility';

const getBadge = (t, category) => {
  let iconStatus = '';
  switch (category.toLowerCase()) {
    case 'effects':
      iconStatus = 'fa-dice';
      break;
    case 'people':
      iconStatus = 'fa-users';
      break;
    case 'damages':
      iconStatus = 'fa-dumpster-fire';
      break;
    case 'measurements':
      iconStatus = 'fa-ruler';
      break;
    default:
      throw new Error(t('Unknown category'));
  }

  return (
    <Fragment key={category}>
      <Badge className="me-1 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-0">
        <i className={`fa ${t(iconStatus)} text-danger me-1`}></i>
        <span className="text-capitalize">{t(category)}</span>
      </Badge>
    </Fragment>
  );
};

const Report = ({ report, selectedReport, selectReport }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isSelected = report.report_id === selectedReport?.report_id;

  return (
    <Card
      onClick={() => selectReport(report)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}
    >
      <CardBody className="p-0 m-2">
        {report.mission_id ? (
          <Badge className="me-1 rounded-pill alert-badge mission-assigned-badge py-0 px-2 pb-0 mb-0">
            <span className="text-capitalize">Mission {report.mission_id}</span>
          </Badge>
        ) : null}
        {report.categories.map(cat => getBadge(t, cat))}
        <Row className="mt-2">
          <Col>
            <Row>
              <Col>
                <CardTitle>
                  <span className="card-title">{report.name}</span>
                </CardTitle>
                <CardText className="card-desc">{report.description}</CardText>
              </Col>
              <Col md={4} className="text-end">
                <Button
                  className="btn btn-primary px-3 py-2"
                  onClick={() => {
                    navigate(`/reports-dashboard/${report.report_id}`);
                  }}
                >
                  {t('open', { ns: 'common' })}
                </Button>
              </Col>
            </Row>
            <Row className="mt-2">
              <Col>
                <p className="text-muted no-wrap mb-0">
                  {t('Date', { ns: 'common' })}: {formatDate(report.timestamp)}
                </p>
              </Col>
            </Row>
            <Row className="mt-0">
              <Col>
                <p className="text-muted no-wrap">
                  {t('Location', { ns: 'common' })}:{' '}
                  {report.location.join(', ')}
                </p>
              </Col>
              <Col
                md={3}
                className="d-flex align-items-end justify-content-end"
              >
                <CardText>
                  <span className="float-end alert-source-text">
                    {t('id', { ns: 'common' }).toUpperCase()}:{' '}
                    {report.report_id} / {report.source.toUpperCase()}
                  </span>
                </CardText>
              </Col>
            </Row>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

Report.propTypes = {
  report: PropTypes.object,
  selectedReport: PropTypes.object,
  selectReport: PropTypes.func,
};

export default Report;
