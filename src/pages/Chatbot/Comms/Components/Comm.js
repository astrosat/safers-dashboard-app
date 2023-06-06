import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardText, Col, Row, Badge } from 'reactstrap';

import { formatDate } from 'utility';

const TAG_ONGOING = 'ONGOING';
const TAG_PUBLIC = 'Public';

const getMsg = (msg, seeMore, setSeeMore) =>
  seeMore ? (
    <>
      {msg.substr(0, 100)}...{' '}
      <span
        className="user-select-auto text-primary"
        onClick={() => {
          setSeeMore(false);
        }}
      >
        See more
      </span>
    </>
  ) : (
    <>
      {msg}{' '}
      <span
        className="user-select-auto text-primary"
        onClick={() => {
          setSeeMore(true);
        }}
      >
        See less
      </span>
    </>
  );

const getBadge = comm => {
  const iconStatus =
    comm.status === TAG_ONGOING ? 'fa-retweet' : 'fa-hourglass-end';
  const iconTarget = comm.scope === TAG_PUBLIC ? 'fa-users' : 'fa-user';

  return (
    <>
      <Badge className="me-1 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-0">
        <i className={`fa ${iconStatus} text-danger me-1`}></i>
        <span className="text-capitalize">{comm.status}</span>
      </Badge>

      <Badge className="me-1 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-0">
        <i className={`fa ${iconTarget}  text-danger me-1`}></i>
        <span className="text-capitalize">
          {comm.scope === TAG_PUBLIC ? comm.scope : comm.target}
        </span>
      </Badge>
    </>
  );
};

const Comm = ({ comm, selectedComm, selectComm }) => {
  const { t } = useTranslation();

  const [seeMore, setSeeMore] = useState(true);

  const isSelected = comm.id === selectedComm?.id;

  return (
    <Card
      onClick={() => selectComm(comm)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}
    >
      <CardBody className="py-2 px-0 m-2">
        {getBadge(comm)}
        <Row className="mt-2">
          <Col>
            <Row className="mt-2">
              <Col>
                <p className="text-muted no-wrap mb-0">
                  {`${t('Start', { ns: 'common' })} ${t('Date', {
                    ns: 'common',
                  })}`}
                  : {formatDate(comm.start, 'YYYY-MM-DD')} |{' '}
                  {`${t('End', { ns: 'common' })} ${t('Date', {
                    ns: 'common',
                  })}`}
                  : {formatDate(comm.end, 'YYYY-MM-DD')}
                </p>
              </Col>
            </Row>
            <Row className="mt-0 mb-1 mt-3">
              <Col>
                <CardText>
                  {t('Message', { ns: 'common' })}:{' '}
                  {comm?.message && getMsg(comm.message, seeMore, setSeeMore)}
                </CardText>
              </Col>
              <Col
                md={3}
                className="d-flex align-items-end justify-content-end"
              >
                <CardText>
                  <span className="float-end alert-source-text no-wrap">
                    {comm.source_organization?.toUpperCase()}
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

Comm.propTypes = {
  comm: PropTypes.object,
  selectedComm: PropTypes.object,
  selectComm: PropTypes.func,
};

export default Comm;
