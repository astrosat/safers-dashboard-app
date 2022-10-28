import React from 'react';
import PropTypes from 'prop-types'
import { Badge, Card, CardBody, CardText, CardTitle, Col, Row } from 'reactstrap';
import { formatDate } from '../../../store/utility';

const Alert = ({ card, alertId, setSelectedAlert, setFavorite }) => {

  const getBadge = () => {
    let iconColor = card.status == 'ONGOING' ? 'text-danger' : '';

    return (
      <Badge className='me-1 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-0'>
        <i className={`bx bxs-hot ${iconColor} fa-lg me-1' color='danger'`}></i>
        <span>{card.status}</span>
      </Badge>
    )
  }

  return (
    <Card
      data-testid={card.id}
      onClick={() => setSelectedAlert(card.id)}
      className={'alerts-card mb-2 ' + (card.id == alertId ? 'alert-card-active' : '')}>
      <CardBody className='p-0 m-2'>
        <Row>
          <Col md={1}>
          </Col>
          <Col>
            <CardText className='mb-2'>
              {getBadge()}
              <button
                type="button"
                className="btn float-end py-0 px-1"
                aria-label='event-edit-button'
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAlert(card.id, true);
                }}
              >
                <i className="mdi mdi-pencil d-block font-size-16"></i>
              </button>
            </CardText>
          </Col>
        </Row>
        <Row>
          <Col md={1}>
            <button
              type="button"
              className="btn float-start py-0 px-1"
              aria-label='event-favorite-button'
              onClick={(e) => {
                e.stopPropagation();
                setFavorite(card.id);
              }}
            >
              <i className={`mdi mdi-star${!card.favorite ? '-outline' : ' text-primary'} card-title`}></i>
            </button>
          </Col>
          <Col>
            <Row>
              <CardTitle>
                <span className='card-title'>{card.title}</span>
              </CardTitle>
              <CardText className='card-desc'>
                {card.description}
              </CardText>
            </Row>
            <Row className='mt-2'>
              <Col>
                <small className="text-muted card-desc date no-wrap">
                  Start: {formatDate(card.start_date)} - End: {card.end_date ? formatDate(card.end_date, 'YYYY-MM-DD') : '-'}
                </small>
              </Col>
              <Col md={2}>
                <CardText>
                  <span className='float-end alert-source-text me-2'>{card.alerts.map((alert) => alert.title).join(',  ')}</span>
                </CardText>
              </Col>
            </Row>
          </Col>
        </Row>

      </CardBody>
    </Card>
  )
}

Alert.propTypes = {
  card: PropTypes.any,
  alertId: PropTypes.string,
  setSelectedAlert: PropTypes.func,
  setFavorite: PropTypes.func,
}

export default Alert;
