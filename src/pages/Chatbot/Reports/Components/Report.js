import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardBody, CardText, CardTitle, Col, Row, Button, Badge } from 'reactstrap';
import { formatDate } from '../../../../store/utility';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

const Report = ({ card, reportId, setSelectedReport/*, setFavorite*/ }) => {

  const { t } = useTranslation();

  const navigate = useNavigate();

  const isSelected = card.report_id === reportId

  const getBadge = (category) => {
    let iconStatus = '';
    switch(category){
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
    }
    
    return (
      <>
        <Badge className='me-2 rounded-pill alert-badge event-alert-badge py-0 px-2 pb-0 mb-0'>
          <i className={`fa ${iconStatus} text-danger me-1`}></i> 
          <span className='text-capitalize'>{category}</span>
        </Badge>
      </>
    )
  }

  return (
    <Card
      onClick={() => setSelectedReport(!isSelected ? card.report_id : null)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}>
      <CardBody className='p-0 m-2'>
        {card.categories.map(cat=>getBadge(cat))}
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
                <Button className="btn btn-primary px-3 py-2" onClick={() => { navigate(`/reports-dashboard/${card.report_id}`); }}>{t('open', { ns: 'common' })}</Button>
              </Col>
            </Row>
            <Row className='mt-2'>
              <Col>
                <p className="text-muted no-wrap mb-0">
                  Date: {formatDate(card.timestamp)}
                </p>
              </Col>

            </Row>
            <Row className='mt-0'>
              <Col>
                <p className="text-muted no-wrap">
                  Location: {(card.location).join(', ')}
                </p>
              </Col>
              <Col md={2}>
                <CardText>
                  <span className='float-end alert-source-text me-2'>
                    {card.source.toUpperCase()}
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
  reportId: PropTypes.string,
  setSelectedReport: PropTypes.func,
  setFavorite: PropTypes.func,
}

export default Report;
