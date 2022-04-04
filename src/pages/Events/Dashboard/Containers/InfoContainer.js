import _ from 'lodash';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, CardText, CardSubtitle } from 'reactstrap';
import { formatDate } from '../../../../store/utility';
import MapComponent from '../Components/Map';

const InfoContainer = () => {
  const weatherStats = useSelector(state => state.dashboard.weatherStats);
  const { id } = useParams();
  const { allAlerts }  = useSelector(state => state.eventAlerts);
  let event = null
  useEffect(() => {
    event = _.find(allAlerts, { id: id })
  }, [allAlerts])
  
  
  return (
    <>
      
      <Col md={12} className='mb-2'>
        <span className='event-alert-title '> Events &gt;</span> <span className='event-alert-title'> {event ? event.title : '' }</span>
      </Col>
      
      <Col md={7}>
        <MapComponent weatherStats={weatherStats}/>
      </Col>
      <Col md={5} sm={12} xs={12} >
        <Card className='card-weather px-0' >
          <Col className='mx-auto mt-1' md={11}>
            <Row className='mb-2 '>
              <span className='weather-text font-size-22'>Important Info</span>
            </Row>
          </Col>
          <Col className='mx-auto mt-2 mb-0' md={10}>
            <Row>
              <Col className='my-2 font-size-16'>Location</Col>
            </Row>
            <Row>
              <Col md={1} className='d-flex'>
                <i className='fa fa-map-marker my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto">
                  {event ? event.location : 'N/A'}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className='mx-auto' md={10}>
            <Row>
              <Col className='my-2 font-size-16'>Date of Event</Col>
            </Row>
            <Row >
              <Col md={1} className='d-flex'>
                <i className='fa fa-calendar my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto">
              Start: { event && event.start ? formatDate(event.start) :  'not set'} <br></br>
              End: {  event && event.end ? formatDate(event.end) :  'not set'}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className='mx-auto' md={10}>
            <Row>
              <Col className='my-2 font-size-16'>Damages</Col>
            </Row>
            <Row >
              <Col md={1} className='d-flex'>
                <i className='fa fa-user my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto">
                  People Affected : {event && event.people_affected ? event.people_affected :  'not recorded'}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>

          <Col className='mx-auto my-2' md={10}>
            <Row >
              <Col md={1} className='d-flex'>
                <i className='fa fa-ambulance my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto">
                  Casualties: {event && event.casualties ? event.casualties :  'not recorded'}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>

          <Col className='mx-auto ' md={10}>
            <Row >
              <Col md={1} className='d-flex'>
                <i className='fas fa-euro-sign my-auto'></i>
              </Col>
              <Col md={10}>
                <CardSubtitle className="my-auto">
                Estimated damage: {event && event.casualties ? event.casualties :  'not recorded'}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>

          <Col className='mx-auto my-2' md={10}>
            <Row className='mt-1'>
              <Col >
                <CardText className='mb-2'>
                  <span className='mb-5 font-size-16'>Info </span>
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText>
                  {event && event.description ? event.description : 'not recorded'}
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col md={2}>
                <CardText className='mb-2'>
                  <small className="font-italic">
                  Source: 
                  </small>
                </CardText>
              </Col>
              <Col>
                <CardText className='mb-2'>
                  <small className="font-italic">
                    {event ? (event.source).join(', ') : 'not set'}</small>
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
