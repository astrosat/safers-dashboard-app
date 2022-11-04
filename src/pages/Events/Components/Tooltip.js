import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import {
  Button,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Input,
  Row
} from 'reactstrap';
import { Popup } from 'react-map-gl';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../../store/utility';
import classnames from 'classnames';
import DatePicker from '../../../components/DateRangePicker/DatePicker';

//i18n
import { withTranslation } from 'react-i18next'
import { editEventAlertInfo } from '../../../store/events/action';
import { useDispatch, useSelector } from 'react-redux';
import { getGeneralErrors } from '../../../helpers/errorHelper';

const Tooltip = ({ object, coordinate, isEdit = false, setIsEdit, setFavorite, t }) => {
  const { updateError: genError, event } = useSelector(state => state.eventAlerts);
  const [editToggle, setEditToggle] = useState(isEdit);
  const [favToggle, setFavToggle] = useState('');

  const [casualties, setCasualties] = useState('');
  const [damage, setDamage] = useState('');
  const [endDate, setEndDate] = useState('');
  const [peopleAffected, setPeoppleAffected] = useState('');
  const [description, setDescription] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (event) {
      setFavToggle(event.favorite)
      setCasualties(event.causalties)
      setDamage(event.estimated_damage)
      setEndDate(event.end_date)
      setPeoppleAffected(event.people_affected)
      setDescription(event.description)
    }
  }, [event])

  useEffect(() => {
    setEditToggle(isEdit);
  }, [isEdit]);

  useEffect(() => {
    setFavToggle(object.favorite);
  }, [object.favorite]);

  const editInfo = (id) => {
    const payload = {
      description: description,
      end_date: endDate,
      people_affected: peopleAffected,
      causalties: casualties,
      estimated_damage: damage
    }
    dispatch(editEventAlertInfo(id, payload));
  }

  return (
    <Popup
      longitude={coordinate[0]}
      latitude={coordinate[1]}
      offsetTop={-15}
      offsetLeft={15}
      anchor='left'
      style={{ borderRadius: '10px' }}
    >

      <div className='my-2 mx-4 map-tooltip' data-testid='event-tooltip'>
        {getGeneralErrors(genError)}
        <Col>
          <Row className='mb-2'>
            <Col md={1} sm={1} className='d-flex'>

              <i
                onClick={(e) => {
                  e.stopPropagation();
                  setFavorite(object.id);
                  setFavToggle(!favToggle);
                }}
                className={`mdi mdi-star${!favToggle ? '-outline' : ''} card-title my-auto`}></i>

            </Col>
            <Col>
              <CardTitle className="card-title h-100 d-flex">
                { }
                <p className='my-auto'>{event ? event.title : 'N/A'}</p>
              </CardTitle>
            </Col>
          </Row>
          <Row>
            <Col md={1} sm={1} className='d-flex'>
              <i className='fa fa-map-marker my-auto'></i>
            </Col>
            <Col md={10} sm={10}>
              <CardSubtitle className="my-auto">
                {event?.center ? `${t('center', { ns: 'common' })}: ${event.center[0]}, ${event.center[1]}` : 'N/A'}
              </CardSubtitle>
            </Col>
          </Row>
          <Row className='my-1'>
            <Col md={1} sm={1} className='d-flex'>
              <i className='fa fa-calendar my-auto'></i>
            </Col>
            <Col>
              <CardSubtitle className="my-auto">
                {t('Start', { ns: 'common' })} :&nbsp;{event && event.start_date ? formatDate(event.start_date) : 'N/A'} <br></br>
                <div className='d-flex text-nowrap'>
                  {t('End', { ns: 'common' })} : &nbsp;
                  {
                    editToggle ?
                      <DatePicker
                        type='text'
                        setDate={setEndDate}
                        isTooltipInput={true}
                        date={endDate}
                      />
                      : event && event.end_date ? formatDate(event.end_date, 'YYYY-MM-DD') : 'not set'
                  }
                </div>
              </CardSubtitle>
            </Col>
          </Row>
          <Row className={classnames({
            'opacity-50': !peopleAffected,
          }, 'my-2')}>
            <Col md={1} sm={1} className=''>
              <i className='fa fa-user my-auto'></i>
            </Col>
            <Col >
              <CardSubtitle className="my-auto d-flex text-nowrap">
                {t('People Affected')} : &nbsp;
                {
                  editToggle ?
                    <Input type='text' value={peopleAffected ? peopleAffected : ''} className='tootip-input ms-2' onChange={(e) => { setPeoppleAffected(e.target.value) }} />
                    : event ? event.people_affected : 'not recorded'
                }
              </CardSubtitle>
            </Col>
          </Row>
          <Row className={classnames({
            'opacity-50': !casualties,
          }, 'my-2')}>
            <Col md={1} sm={1} className=''>
              <i className='fa fa-ambulance my-auto'></i>
            </Col>
            <Col >
              <CardSubtitle className="my-auto d-flex text-nowrap">
                {t('Casualties')}: &nbsp;
                {
                  editToggle ?
                    <Input type='text' className='tootip-input ms-2' value={casualties ? casualties : ''} onChange={(e) => { setCasualties(e.target.value) }} />
                    : event ? event.causalties : 'not recorded'
                }
              </CardSubtitle>
            </Col>
          </Row>
          <Row className={classnames({
            'opacity-50': !damage,
          }, 'my-2')}>
            <Col md={1} sm={1} className=''>
              <i className='fas fa-euro-sign my-auto'></i>
            </Col>
            <Col >
              <CardSubtitle className="my-auto text-muted d-flex text-nowrap">
                {t('estimated-damage')} : &nbsp;
                {
                  editToggle ?
                    <Input type='text' className='tootip-input ms-2' value={damage ? damage : ''} onChange={(e) => { setDamage(e.target.value) }} />
                    : event ? event.estimated_damage : 'not recorded'
                }
              </CardSubtitle>
            </Col>
          </Row>

          <Row className='mt-3 my-2'>
            <Col md={2} sm={2} className="">
              <CardText className='mb-2 px-0'>
                <span className='mb-5'>{t('Info', { ns: 'common' })}: </span>
              </CardText>
            </Col>
            <Col>
              <CardText>
                {
                  editToggle ?
                    <Input type='textarea' className='tootip-input' rows="6" value={description ? description : ''} onChange={(e) => { setDescription(e.target.value) }} />
                    : description
                }
              </CardText>
            </Col>
          </Row>

          <Row className='my-2'>
            <Col md={2} sm={2} className='pe-0'>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {t('Source', { ns: 'common' })}:
                </small>
              </CardText>
            </Col>

            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {event && event.alerts ? event.alerts.map((alert) => alert.title).join(', ') : ''}
                </small>
              </CardText>
            </Col>
          </Row>

          {editToggle ?
            <>
              <Row>
                <Button
                  color="primary"
                  className='save-event-button'
                  onClick={() => {
                    setEditToggle(false);
                    editInfo(object.id);
                  }} >
                  {t('save', { ns: 'common' })}
                </Button>
              </Row>
              <Row>
                <Button className='link-button' color="link" onClick={() => {
                  setEditToggle(false);
                  setIsEdit(false);
                }} >
                  {t('cancel', { ns: 'common' })}
                </Button>
              </Row>
            </>
            : <>
              <Row className='g-0'>
                {event &&
                  <Button disabled color="primary" className='create-event-button' onClick={() => {
                    navigate(`/event-dashboard/${object.id}`);
                  }}>
                    {t('show-info', { ns: 'common' })}
                  </Button>}
              </Row>
              <Row className='g-0'>
                <Button className='link-button' color="link" onClick={() =>
                  setEditToggle(true)
                } >
                  {t('edit', { ns: 'common' })}
                </Button>
              </Row>
            </>
          }
        </Col>
      </div>
    </Popup >
  )
}

Tooltip.propTypes = {
  object: PropTypes.any,
  coordinate: PropTypes.array,
  isEdit: PropTypes.bool,
  setFavorite: PropTypes.func,
  validateEvent: PropTypes.func,
  editInfo: PropTypes.func,
  t: PropTypes.func,
  setIsEdit: PropTypes.func
}

export default withTranslation(['events'])(Tooltip);
