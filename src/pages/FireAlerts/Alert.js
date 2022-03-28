import React from 'react';
import PropTypes from 'prop-types'
import { Badge, Card, CardBody, CardText, CardTitle, Col, Row } from 'reactstrap';

const Alert = ({ card, alertId, setSelectedAlert, setFavorite }) => {

  const getBadge = () => {
    let status ='';
    switch(card.status) {
    case 'VALIDATED':
      status = 'validated';
      break;
    default:
      status = 'to-verify';
    }
    return (
      <Badge className={`me-1 rounded-pill alert-badge ${status} py-0 px-2 pb-0 mb-0`}>
        <span>{card.status}</span>
      </Badge>
    )
  }

  return (
    <Card
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
              <CardTitle>
                <span className='card-title'>{card.title}</span>
              </CardTitle>
              <CardText className='card-desc'>
                {card.description}
              </CardText>
            </Row>
            <Row className='mt-2'>
              <Col>
                <small className="text-muted card-desc">
                  {card.timestamp}
                </small></Col>
              <Col>
                <CardText>
                  <span className='float-end alert-source-text me-2'>{card.source}</span>
                </CardText></Col>
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
