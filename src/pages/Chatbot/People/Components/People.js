import React from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Row,
  Badge,
} from 'reactstrap';

import { formatDate } from 'utility';

const getBadge = person => {
  return (
    <>
      <Badge
        color={person.status === 'Active' ? 'success' : 'info'}
        className="me-1 rounded-pill alert-badge py-0 px-2 pb-0 mb-0"
      >
        <span className="text-capitalize">{person.status}</span>
      </Badge>
    </>
  );
};

const Person = ({ person, selectedPerson, selectPerson }) => {
  const { t } = useTranslation();

  const isSelected = person.id === selectedPerson?.id;

  return (
    <Card
      onClick={() => selectPerson(person)}
      className={'alerts-card mb-2 ' + (isSelected ? 'alert-card-active' : '')}
    >
      <CardBody className="p-0 m-2">
        <Row className="mt-2">
          <Col>
            <Row>
              <Col>
                <CardTitle>
                  <span className="card-title">{person.username}</span>
                </CardTitle>
                <CardText className="card-desc">
                  {t('status', { ns: 'common' })}: {getBadge(person)}
                </CardText>
                <CardText className="card-desc">
                  {t('activity', { ns: 'common' })}: {person.activity}
                </CardText>
              </Col>
            </Row>
            <Row className="mt-0">
              <Col>
                <p className="text-muted no-wrap text-capitalize mb-1">
                  {t('Location', { ns: 'common' })}:{' '}
                  {person.location ? person.location.join(', ') : ''}
                </p>
              </Col>
              <Col>
                <CardText>
                  <span className="float-end alert-source-text me-2 mb-1">
                    {t('last-updated')}: {formatDate(person.timestamp)}
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

Person.propTypes = {
  person: PropTypes.object,
  selectedPerson: PropTypes.object,
  selectPerson: PropTypes.func,
};

export default Person;
