import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardBody, CardText, CardTitle, Col, Row, Button } from 'reactstrap';
import { formatDate } from '../../../store/utility';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const Report = ({ card, alertId, setSelectedAlert, setFavorite }) => {

  const {t} = useTranslation();

  const navigate = useNavigate();

  return (
    <Card
      onClick={() => setSelectedAlert(card.id)}
      className={'alerts-card mb-2 ' + (card.id == alertId ? 'alert-card-active' : '')}>
      <CardBody className='p-0 m-2'>
        
        <Row className='mt-4'>
          <Col md={1}>
            <button
              type="button"
              className="btn float-start py-0 px-1"
              aria-label='report-favorite-button'
              onClick={(e) => {
                e.stopPropagation();
                setFavorite(card.id);
              }}
            >
              <i className={`mdi mdi-star${!card.isFavorite ? '-outline' : ''} card-title`}></i>
            </button>
          </Col>
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
                <Button className="btn btn-primary px-3 py-2" onClick={()=>{navigate(`/reports-dashboard/${card.id}`);}}>{t('open', {ns: 'common'})}</Button>
              </Col>
            </Row>
            <Row className='mt-2'>
              <Col>
                <p className="text-muted no-wrap mb-0">
                  {formatDate(card.date, 'YYYY-MM-DD HH:mm')}
                </p>
              </Col>
              
            </Row>
            <Row className='mt-0'>
              <Col>
                <p className="text-muted no-wrap">
                  {card.location}
                </p>
              </Col>
              <Col md={2}>
                <CardText>
                  <span className='float-end alert-source-text me-2'>{(card.source).join(', ')}</span>
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
