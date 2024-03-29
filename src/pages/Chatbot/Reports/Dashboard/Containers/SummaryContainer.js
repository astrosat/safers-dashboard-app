import React from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, CardText, CardSubtitle, Button } from 'reactstrap';

import { MAP_TYPES } from 'constants/common';
import { getIconLayer } from 'helpers/mapHelper';
import { formatDate } from 'utility';

import MapSection from '../Components/Map';

const NO_AVAILABLE_DATA = 'no-data-available';

const SummaryContainer = ({ reportDetail, t }) => {
  const navigate = useNavigate();

  if (!reportDetail) return null;

  const iconLayer = getIconLayer([reportDetail], MAP_TYPES.REPORTS, 'report');

  const dateDisplay = reportDetail?.timestamp
    ? formatDate(reportDetail.timestamp)
    : t(NO_AVAILABLE_DATA, { ns: 'common' });
  return (
    <>
      <Row>
        <Col className="">
          <Button
            onClick={() => navigate('/chatbot?tab=4')}
            className="back-arrow px-0 py-0"
          >
            <i className="bx bx-arrow-back fa-2x"></i>
          </Button>
        </Col>
      </Row>

      <Col md={12} className="mb-3">
        <span className="event-alert-title opacity-75">
          {' '}
          {t('Results')} &gt;
        </span>{' '}
        <span className="event-alert-title">{reportDetail.name}</span>
      </Col>

      <Col md={3}>
        <Col className="ms-2 report-info">
          <Row className="mb-3">
            <span className="text-title">{reportDetail.name}</span>
          </Row>
          <Row className="my-2">
            <span>
              {t('Hazard Type')}:{' '}
              {reportDetail.hazard ?? t(NO_AVAILABLE_DATA, { ns: 'common' })}
            </span>
          </Row>
          <Row className="my-2">
            <span>
              {t('status', { ns: 'common' })}:{' '}
              {reportDetail.status ?? t(NO_AVAILABLE_DATA, { ns: 'common' })}
            </span>
          </Row>
          <Row className="my-2">
            <span>
              {t('category', { ns: 'common' })}:{' '}
              {reportDetail?.categories.length > 0
                ? reportDetail.categories.join(', ')
                : t(NO_AVAILABLE_DATA, { ns: 'common' })}
            </span>
          </Row>
          <Row className="my-2">
            <Col lg={2} id="cat-info">
              <span>{t('Details')}: </span>
            </Col>
            <Col lg={1}>&nbsp;</Col>
            <Col
              lg={9}
              className="mt-lg-0 ms-lg-0 mt-sm-2 ms-sm-2"
              aria-labelledby="cat-info"
            >
              {reportDetail?.categories_info.length > 0
                ? reportDetail.categories_info.map(info => (
                    <div key={info}>{info}</div>
                  ))
                : t(NO_AVAILABLE_DATA, { ns: 'common' })}
            </Col>
          </Row>
          <Row className="mt-3 mb-2">
            <span>{t('Description')}:</span>
          </Row>
          <Row>
            <span>
              {reportDetail.description ??
                t(NO_AVAILABLE_DATA, { ns: 'common' })}
            </span>
          </Row>
        </Col>
      </Col>
      <Col md={3}>
        <Card className="card-weather px-0 report-detail">
          <Col className="ps-3 pt-3">
            <Row>
              <Col>
                <span className="font-size-18">{t('Username')}</span> :{' '}
                {reportDetail.reporter?.name ??
                  t(NO_AVAILABLE_DATA, { ns: 'common' })}
              </Col>
            </Row>
            <Row>
              <Col>
                <span className="font-size-18">
                  {t('Organization', { ns: 'common' })}
                </span>{' '}
                :{' '}
                {reportDetail.reporter?.organization ??
                  t(NO_AVAILABLE_DATA, { ns: 'common' })}
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className="ps-3 mb-0">
            <Row className="mb-1">
              <Col className="font-size-18">
                {t('Location', { ns: 'common' })}:{' '}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={1} className="d-flex">
                <i className="fa fa-map-marker my-auto"></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto font-size-15">
                  {reportDetail.location.length > 0
                    ? reportDetail.location?.join(', ')
                    : t(NO_AVAILABLE_DATA, { ns: 'common' })}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className="ps-3">
            <Row className="mb-1">
              <Col className="font-size-18">{t('Date of Report')}: </Col>
            </Row>
            <Row>
              <Col md={1} className="d-flex">
                <i className="fa fa-calendar my-auto"></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto font-size-15">
                  {dateDisplay}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className="ps-3 pb-5">
            <Row>
              <Col>
                <CardText>
                  {t('Source', { ns: 'common' })}: {reportDetail.source}
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText>
                  {t('Report Privacy')}:{' '}
                  {reportDetail.visibility ??
                    t(NO_AVAILABLE_DATA, { ns: 'common' })}
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText>
                  {t('Report ID')}:{' '}
                  {reportDetail.report_id ??
                    t(NO_AVAILABLE_DATA, { ns: 'common' })}
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText>
                  {t('Mission ID')}:{' '}
                  {reportDetail.mission_id ??
                    t(NO_AVAILABLE_DATA, { ns: 'common' })}
                </CardText>
              </Col>
            </Row>
          </Col>
        </Card>
      </Col>
      <Col className="mx-auto">
        <MapSection iconLayer={iconLayer} />
      </Col>
    </>
  );
};

SummaryContainer.propTypes = {
  reportDetail: PropTypes.object,
  t: PropTypes.func,
};

export default withTranslation(['reports'])(SummaryContainer);
