import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  // Card,
  CardImg,
  CardSubtitle,
  CardText,
  CardTitle,
  Col,
  Input,
  Modal,
  Row
} from 'reactstrap';
import { Popup } from 'react-map-gl';
import { formatDate } from '../../store/utility';

//i18n
import { withTranslation } from 'react-i18next'

const Tooltip = ({ object, coordinate, isEdit = false, setIsEdit, setFavorite, validateEvent, editInfo, t }) => {
  const [confirmEventToggle, setConfirmEventToggle] = useState(false);
  const [editToggle, setEditToggle] = useState(isEdit);
  const [favToggle, setFavToggle] = useState(object.favorite);
  const [information, setInformation] = useState(object.information);

  useEffect(() => {
    setEditToggle(isEdit);
  }, [isEdit]);

  useEffect(() => {
    setFavToggle(object.favorite);
  }, [object.favorite]);

  return (
    <Popup
      longitude={coordinate[0]}
      latitude={coordinate[1]}
      offsetTop={-15}
      offsetLeft={15}
      anchor='left'
      style={{ borderRadius: '10px' }}
    >

      <div className='my-2 mx-4 map-tooltip'>
        <Row className='mb-2'>
          <Col md={1}>
            <button
              type="button"
              className="btn px-0"
              onClick={(e) => {
                e.stopPropagation();
                setFavorite(object.id);
                setFavToggle(!favToggle);
              }}
            >
              <i className={`mdi mdi-star${!favToggle ? '-outline' : ''} card-title`}></i>
            </button>
          </Col>
          <Col >
            <CardTitle className="mt-0 card-title">{object.title}</CardTitle>
            <CardSubtitle className="font-14 text-muted">
              {formatDate(object.timestamp)}
            </CardSubtitle>
          </Col>
        </Row>
        {
          object.media && object.media.length > 0 &&
          <Row className='no-gutters mx-0 text-center'>
            {
              object.media[0] &&
              <Col className='px-1'>
                <CardImg
                  className="img-fluid tooltip-img"
                  src={object.media[0]} alt="" />
              </Col>
            }
            {
              object.media[1] &&
              <Col className='px-1'>
                <CardImg
                  className="img-fluid tooltip-img"
                  src={object.media[1]} alt="" />
              </Col>
            }
          </Row>
        }
        <Row className='mt-3 px-1 g-0'>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <span className='float-start mb-5'>{t('Info')}: </span>
              </CardText>
            </Col>
            <Col>
              <CardText>
                {
                  editToggle ?
                    <Input type='textarea' rows="2" value={information || ''} onChange={(e) => { setInformation(e.target.value) }} />
                    : information
                }
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {t('source')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.source}</small>
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic text-capitalize">
                  {t('category')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.category}</small>
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic text-capitalize">
                  {t('event')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.event}</small>
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic text-capitalize">
                  {t('urgency')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.urgency}</small>
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic text-capitalize">
                  {t('severity')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.severity}</small>
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic text-capitalize">
                  {t('certainty')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.certainty}</small>
              </CardText>
            </Col>
          </Row>
          <Row className='g-0'>
            <Col md={3}>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {t('description')}:
                </small>
              </CardText>
            </Col>
            <Col>
              <CardText className='mb-2'>
                <small className="font-italic">
                  {object.description}</small>
              </CardText>
            </Col>
          </Row>
          {editToggle ?
            <>
              <Row className='align-middle g-0'>
                <Button
                  color="primary"
                  className='save-event-button'
                  onClick={() => {
                    setEditToggle(false);
                    editInfo(object.id, information);
                  }} >
                  {t('save')}
                </Button>
              </Row>
              <Row className='g-0'>
                <Button className='link-button' color="link" onClick={() => {
                  setEditToggle(false);
                  setInformation(object.information);
                  setIsEdit(false);
                }} >
                  {t('cancel')}
                </Button>
              </Row>
            </>
            : <>
              <Row className={`g-0 ${object.type == 'UNVALIDATED' ? 'd-contents' : 'd-none'}`}>
                <Button color="primary" className='create-event-button' onClick={() =>
                  setConfirmEventToggle(true)
                }>
                  {t('create-event')}
                </Button>
              </Row>
              <Row className='g-0'>
                <Button className='link-button' color="link" onClick={() =>
                  setEditToggle(true)
                } >
                  {t('edit')}
                </Button>
              </Row>
            </>
          }
        </Row>
      </div>
      <Modal
        isOpen={confirmEventToggle}
        toggle={() => {
          setConfirmEventToggle(!confirmEventToggle)
        }}
        scrollable={true}
        id="staticBackdrop"
      >
        <div className="modal-header">
          <h5 className="modal-title" id="staticBackdropLabel">{t('Warning', { ns: 'common' })}!</h5>
          <button type="button" className="btn-close"
            onClick={() => {
              setConfirmEventToggle(false);
            }} aria-label="Close"></button>
        </div>
        <div className="modal-body">
          <p>{t('Confirm Event Alert', { ns: 'fireAlerts' })}</p>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-light" onClick={() => {
            setConfirmEventToggle(false);
          }}>{t('Close', { ns: 'common' })}</button>
          <button type="button" className="btn btn-primary" onClick={() => {
            validateEvent(object.id);
            setConfirmEventToggle(false);
          }}>{t('Yes', { ns: 'common' })}</button>
        </div>
      </Modal>
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
  setIsEdit: PropTypes.func,
  t: PropTypes.func
}

export default withTranslation(['common'])(Tooltip);
