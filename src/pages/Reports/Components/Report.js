import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardBody, CardText, CardTitle, Col, Row, Button } from 'reactstrap';
import { formatDate } from '../../../store/utility';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

// const Report = ({ card, alertId, setSelectedAlert, setFavorite }) => {
const Report = ({ card, alertId, setSelectedAlert }) => {

  const {t} = useTranslation();

  const navigate = useNavigate();

  const isSelected = card.report_id === alertId

  return (
    <Card
      onClick={() => setSelectedAlert(!isSelected ? card.report_id : null)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}>
      <CardBody className='p-0 m-2'>
        
        <Row className='mt-2'>
          <Col>
            <Row>
              <Col>
                <CardTitle>
                  <span className='card-title'>{card.name}</span>
                </CardTitle>
                <CardText className='card-desc'>
                  {card.description}
                </CardText>
              </Col>
              <Col md={4} className='text-end'>
                <Button className="btn btn-primary px-3 py-2" onClick={()=>{navigate(`/reports-dashboard/${card.report_id}`);}}>{t('open', {ns: 'common'})}</Button>
              </Col>
            </Row>
            <Row className='mt-2'>
              <Col>
                <p className="text-muted no-wrap mb-0">
                  date: {formatDate(card.timestamp, 'YYYY-MM-DD HH:mm')}
                </p>
              </Col>
              
            </Row>
            <Row className='mt-0'>
              <Col>
                <p className="text-muted no-wrap">
                  location: {(card.location).join(', ')}
                </p>
              </Col>
              <Col md={2}>
                <CardText>
                  <span className='float-end alert-source-text me-2'>
                    SOURCE: {card.source}
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

Report.propTypes = {
  card: PropTypes.any,
  alertId: PropTypes.string,
  setSelectedAlert: PropTypes.func,
  setFavorite: PropTypes.func,
}

export default Report;
