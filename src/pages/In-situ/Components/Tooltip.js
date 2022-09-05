import React from 'react';
import PropTypes from 'prop-types'
import {
  Col,
  Row
} from 'reactstrap';
import { Popup } from 'react-map-gl';
import { formatDate } from '../../../store/utility';

const Tooltip = ({ object = {}, coordinate }) => {
  const { id, description, location, direction, last_update } = object.properties.properties;
  return (
    <Popup
      longitude={coordinate[0]}
      latitude={coordinate[1]}
      offsetLeft={15}
      dynamicPosition={true}
      anchor='left'
      style={{ borderRadius: '10px' }}
    >
      <div className='my-2 mx-4 map-tooltip'>
        <Row className='mb-2'>
          <Col md={2} className='d-flex g-0 text-white'>
            <b>Data:</b>
          </Col>
          <Col md={10} className='text-white ms-auto'>
            <p className='mb-1'>Camera Number: {id}</p>
            <p className='mb-1'>
              Camera Location:
              <br />
              Lon. {location?.longitude}, 
              Lat. {location?.latitude}
            </p>
            <p className='mb-1'>Camera Direction: {direction}&#176;</p>
            <p className='mb-1'>
              Last Uploaded feed: 
              {last_update ? formatDate(last_update) : '-'}
            </p>
          </Col>
        </Row>
        <Row>
          <Col md={2} className='d-flex g-0 text-white'>
            <b>Info:</b>
          </Col>
          <Col md={10}>
            {description}
          </Col>
        </Row>
      </div>
    </Popup >
  )
}

Tooltip.propTypes = {
  coordinate: PropTypes.array,
  object: PropTypes.object,
}

export default Tooltip;
