import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Row, Col, CardText, CardSubtitle, Button } from 'reactstrap';
import { getInSituMedia } from '../../../../store/events/action';
import { formatDate } from '../../../../store/utility';

const InfoContainer = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const { id } = useParams();
  // eslint-disable-next-line no-unused-vars
  const [event, setEvent] = useState({});

  useEffect(() => {
    dispatch(getInSituMedia())
  }, [])
  
  return (
    <>
      <Row>
        <Col className=''>
          <Button onClick={() => navigate(-1)} className='back-arrow px-0 py-0'>
            <i className='bx bx-arrow-back fa-2x'></i>
          </Button>
        </Col> 
      </Row>
      
      <Col md={12} className='mb-3'>
        <span className='event-alert-title opacity-75'> Reports &gt;</span> <span className='event-alert-title'> Report Name A</span>
      </Col>

      <Col md={7}>
        <Col className='ms-2 report-info'>
          <Row className='mb-3'>
            <span className='text-title'>Report Name A</span>
          </Row>
          <Row className='my-3'>
            <span>Hazard Type: Fire</span>
          </Row>
          <Row className='my-3'>
            <span>Status: Notified</span>
          </Row>
          <Row className='mt-5 mb-2'>
            <span>Description</span>
          </Row>
          <Row>
            <span>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur

            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </span>
          </Row>
        </Col>
      </Col>
      <Col md={5} sm={12} xs={12} className='mt-2'>
        <Card className='card-weather px-0 report-detail' >
          <Col className='mx-auto' md={11}>
            <Row>
              <Col className='text-end'>
                <span className='text-username'>Username : </span><h5 className='d-inline-block text-username-org'>organization manager</h5></Col>
            </Row>
            <Row>
              <Col className='text-end'><span className='text-username'>Organization : </span><h5 className='d-inline-block text-username-org'>Test Organization</h5></Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className='mx-auto mb-0' md={10}>
            <Row className='mb-1'>
              <Col className='font-size-18'>Location</Col>
            </Row>
            <Row className='mt-2'>
              <Col md={1} className='d-flex'>
                <i className='fa fa-map-marker my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto font-size-15">
                  Filoktiti Oikonomidou, Athens 114 76, Greece
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className='mx-auto' md={10}>
            <Row className='mb-1'>
              <Col className='font-size-18'>Date of Report</Col>
            </Row>
            <Row >
              <Col md={1} className='d-flex'>
                <i className='fa fa-calendar my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto font-size-15">
                Date: { event && event.start ? formatDate(event.start) :  'not set'}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className='mx-auto' md={10}>
            <Row>
              <Col>
                <CardText>
                    Source: Chatbot
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText >
                    Report Privacy: Public
                </CardText>
              </Col>
            </Row>
          </Col>

          <Col className='mx-auto mt-3' md={10}>
            <Row>
              <Col>
                <CardText className='opacity-50'>
                    Passport ID: 1234
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText className='opacity-50'>
                    Mission ID: EZ345
                </CardText>
              </Col>
            </Row>
          </Col>
        </Card>
      </Col>
    </>     
  );
}

export default InfoContainer;
