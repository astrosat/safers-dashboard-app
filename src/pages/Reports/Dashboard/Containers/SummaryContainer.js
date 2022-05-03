import React from 'react';
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, CardText, CardSubtitle, Button } from 'reactstrap';
import { formatDate } from '../../../../store/utility';

const SummaryContainer = ({reportDetail}) => {
  const navigate = useNavigate();

  if(!reportDetail) 
    return null;
  
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
        <span className='event-alert-title opacity-75'> Reports &gt;</span> <span className='event-alert-title'>{reportDetail.name}</span>
      </Col>

      <Col md={7}>
        <Col className='ms-2 report-info'>
          <Row className='mb-3'>
            <span className='text-title'>{reportDetail.name}</span>
          </Row>
          <Row className='my-3'>
            <span>Hazard Type: {reportDetail.hazardType}</span>
          </Row>
          <Row className='my-3'>
            <span>Status: {reportDetail.status}</span>
          </Row>
          <Row className='mt-5 mb-2'>
            <span>Description</span>
          </Row>
          <Row>
            <span>{reportDetail.description}</span>
          </Row>
        </Col>
      </Col>
      <Col md={5} sm={12} xs={12} className='mt-2'>
        <Card className='card-weather px-0 report-detail text-light' >
          <Col className='mx-auto' md={11}>
            <Row>
              <Col className='text-end'>
                <span className='text-username'>Username : </span><h5 className='d-inline-block text-username-org'>{reportDetail.userName}</h5></Col>
            </Row>
            <Row>
              <Col className='text-end'><span className='text-username'>Organization : </span><h5 className='d-inline-block text-username-org'>{reportDetail.organization}</h5></Col>
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
                  {reportDetail.location}
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
                  {formatDate(reportDetail.date, 'll, mm:hh')}
                </CardSubtitle>
              </Col>
            </Row>
          </Col>
          <hr></hr>
          <Col className='mx-auto' md={10}>
            <Row>
              <Col>
                <CardText>
                    Source: {reportDetail.source}
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText >
                    Report Privacy: {reportDetail.reportPrivacy}
                </CardText>
              </Col>
            </Row>
          </Col>

          <Col className='mx-auto mt-3' md={10}>
            <Row>
              <Col>
                <CardText className='opacity-50'>
                    Passport ID: {reportDetail.passportID}
                </CardText>
              </Col>
            </Row>
            <Row>
              <Col>
                <CardText className='opacity-50'>
                    Mission ID: {reportDetail.missionId}
                </CardText>
              </Col>
            </Row>
          </Col>
        </Card>
      </Col>
    </>     
  );
}

SummaryContainer.propTypes = {
  reportDetail: PropTypes.object,
}

export default SummaryContainer;