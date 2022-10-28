import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { Badge, Card, CardBody, CardText, CardTitle, Col, Row, Button } from 'reactstrap';
import { formatDate } from '../../../../store/utility';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const Mission = ({ card, missionId, setSelectedMission/*, setFavorite*/ }) => {

  const { t } = useTranslation();

  const navigate = useNavigate();
  const [seeMore, setSeeMore] = useState(true);

  const isSelected = card.id === missionId;

  const getMsg = (msg) => {
    if(seeMore){
      return (
        <>{msg.substr(0, 80)}... <a href="javascript:void(0)" onClick={() => {setSeeMore(false)}}>See more</a></>
      )
    }
    return <>{msg} <a href="javascript:void(0)" onClick={() => {setSeeMore(true)}}>See less</a></>;
  }

  const getBadge = () => {
    let iconStatus = card.status === 'Created' ? 'fa-plus' : (card.status === 'Completed'? 'fa-check' : 'fa-hourglass-end');
    
    return (
      <>
        <Badge className='me-1 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-2'>
          <i className={`fa ${iconStatus} text-danger me-1`}></i> 
          <span className='text-capitalize'>{card.status}</span>
        </Badge>
      </>
    )
  }

  return (
    <Card
      onClick={() => setSelectedMission(!isSelected ? card.id : null)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}>
      <CardBody className='p-0 m-2'>
        <Row className='mt-2'>
          <Col>
            {getBadge()}
            <Row>
              <Col>
                <CardTitle>
                  <span className='card-title'>{card.name}</span>
                </CardTitle>
              </Col>
            </Row>
            <Row className='mt-2'>
              <Col>
                <p className="text-muted no-wrap mb-0">
                  {t('Start date', { ns: 'common' })}: {formatDate(card.start, 'YYYY-MM-DD')} | {t('End date', { ns: 'common' })}: {formatDate(card.end, 'YYYY-MM-DD')}
                </p>
                <p className="text-muted no-wrap">
                  {t('Assigned to', { ns: 'chatBot' })}: {card.organization}
                </p>
              </Col>
            </Row>
            <Row className='mt-0'>
              <Col md={10}>
                <p className="text-muted no-wrap mb-0">
                  {t('Associated reports', { ns: 'common' })}: 
                  {card?.reports.map((report) => <Button key={report.id} color='link' className='align-self-baseline pe-0' onClick={() => { navigate(`/reports-dashboard/${report.id}`)}}>{report.name}</Button>)}
                </p>
              </Col>
            </Row>
            <Row className='mt-0'>
              <Col>
                <CardText>
                  {t('Description', { ns: 'common' })}: {card?.description && getMsg(card.description)}
                </CardText>
              </Col>
              <Col md={2}>
                <CardText>
                  <span className='float-end alert-source-text me-2'>
                    {t('id', { ns: 'common' }).toUpperCase()}: {card.id}
                  </span>
                </CardText>
              </Col>
            </Row>
          </Col>
        </Row>

      </CardBody>
    </Card>
  )
}

Mission.propTypes = {
  card: PropTypes.any,
  missionId: PropTypes.string,
  setSelectedMission: PropTypes.func,
  setFavorite: PropTypes.func,
}

export default Mission;
