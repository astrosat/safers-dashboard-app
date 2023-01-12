import React from 'react';
import PropTypes from 'prop-types'
import { Card, CardBody, CardText, CardTitle, Col, Row, Badge } from 'reactstrap';
import { formatDate } from '../../../../store/utility';
import { useTranslation } from 'react-i18next';

const People = ({ card, peopleId, setSelectedPeople/*, setFavorite*/ }) => {

  const { t } = useTranslation();

  const isSelected = card.id === peopleId

  if (!card) return null; // this is not set when data is polled, prevents black screen o'death

  const getBadge = () => {
    return (
      <>
        <Badge color={card.status === 'Active' ? 'success' : 'info'} className='me-1 rounded-pill alert-badge py-0 px-2 pb-0 mb-0'>
          <span className='text-capitalize'>{card.status}</span>
        </Badge>
      </>
    )
  }

  return (
    <Card
      onClick={() => setSelectedPeople(!isSelected ? card.id : null)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}>
      <CardBody className='p-0 m-2'>
        <Row className='mt-2'>
          <Col>
            <Row>
              <Col>
                <CardTitle>
                  <span className='card-title'>{card.username}</span>
                </CardTitle>
                <CardText className='card-desc'>
                  {t('status', {ns: 'common'})}: {getBadge()}
                </CardText>
                <CardText className='card-desc'>
                  {t('activity', {ns: 'common'})}: {card.activity}
                </CardText>
              </Col>
            </Row>
            <Row className='mt-0'>
              <Col>
                <p className="text-muted no-wrap text-capitalize mb-1">
                  {t('Location' , {ns: 'common'})}: {(card.location) ? (card.location).join(', '): ''}
                </p>
              </Col>
              <Col>
                <CardText>
                  <span className='float-end alert-source-text me-2 mb-1'>
                    {t('last-updated')}: {formatDate(card?.timestamp)}
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

People.propTypes = {
  card: PropTypes.any,
  peopleId: PropTypes.string,
  setSelectedPeople: PropTypes.func,
  setFavorite: PropTypes.func,
}

export default People;
