import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
  Button,
} from 'reactstrap';

import { formatDate } from 'utility';

const getMsg = (msg, seeMore, setSeeMore) => {
  if (seeMore) {
    return (
      <>
        {msg.substr(0, 80)}...{' '}
        <a
          onClick={() => {
            setSeeMore(false);
          }}
        >
          See more
        </a>
      </>
    );
  }
  return (
    <>
      {msg}{' '}
      <a
        onClick={() => {
          setSeeMore(true);
        }}
      >
        See less
      </a>
    </>
  );
};

const getBadge = mission => {
  let iconStatus =
    mission.status === 'Created'
      ? 'fa-plus'
      : mission.status === 'Completed'
      ? 'fa-check'
      : 'fa-hourglass-end';

  return (
    <>
      <Badge className="me-1 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-2">
        <i className={`fa ${iconStatus} text-danger me-1`}></i>
        <span className="text-capitalize">{mission.status}</span>
      </Badge>
    </>
  );
};

const Mission = ({ mission, selectedMission, selectMission }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [seeMore, setSeeMore] = useState(true);

  const isSelected = mission.id === selectedMission?.id;

  return (
    <Card
      onClick={() => selectMission(mission)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}
    >
      <CardBody className="p-0 m-2">
        <Row className="mt-2">
          <Col>
            {getBadge(mission)}
            <Row>
              <Col>
                <CardTitle>
                  <span className="card-title">{mission.name}</span>
                </CardTitle>
              </Col>
            </Row>

            <Row className="mt-2">
              <Col>
                <p className="text-muted no-wrap mb-0">
                  {`${t('Start', { ns: 'common' })} ${t('Date', {
                    ns: 'common',
                  })}`}
                  : {formatDate(mission.start, 'YYYY-MM-DD')} |{' '}
                  {`${t('End', { ns: 'common' })} ${t('Date', {
                    ns: 'common',
                  })}`}
                  : {formatDate(mission.end, 'YYYY-MM-DD')}
                </p>
                <p className="text-muted no-wrap">
                  {t('Assigned to', { ns: 'chatBot' })}: {mission.organization}
                </p>
              </Col>
            </Row>

            <Row className="mt-0">
              <Col md={10}>
                <p className="text-muted no-wrap mb-0">
                  {t('associated-reports', { ns: 'chatBot' })}:
                  {mission?.reports.map(report => (
                    <Button
                      key={report.id}
                      color="link"
                      className="align-self-baseline pe-0"
                      onClick={() => {
                        navigate(`/reports-dashboard/${report.id}`);
                      }}
                    >
                      {report.name}
                    </Button>
                  ))}
                </p>
              </Col>
            </Row>

            <Row className="mt-0">
              <Col>
                <CardText>
                  {t('description', { ns: 'common' })}:{' '}
                  {mission?.description &&
                    getMsg(mission.description, seeMore, setSeeMore)}
                </CardText>
              </Col>

              <Col md={2}>
                <CardText>
                  <span className="float-end alert-source-text me-2">
                    {t('id', { ns: 'common' }).toUpperCase()}: {mission.id}
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

Mission.propTypes = {
  mission: PropTypes.object,
  selectedMission: PropTypes.object,
  selectMission: PropTypes.func,
};

export default Mission;
