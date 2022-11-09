import React from 'react';
import PropTypes from 'prop-types'
import {
  Col,
  Row
} from 'reactstrap';
import { Popup } from 'react-map-gl';
import { formatDate } from '../../../store/utility';

//i18n
import { withTranslation } from 'react-i18next'

const Tooltip = ({ object, t }) => {
  const obj = (object?.objects) ? object.objects : [object.object];

  return (
    <Popup
      longitude={obj[0].geometry.coordinates[0]}
      latitude={obj[0].geometry.coordinates[1]}
      offsetLeft={15}
      dynamicPosition={true}
      captureScroll={true}
      anchor='left'
      className="cameras-tooltip"
      style={{ borderRadius: '10px' }}>
      <div>
        {obj.map(({properties: { id, direction, last_update, description, location }}) => (
          <React.Fragment key={id}>
            <div className='my-2 m-4 map-tooltip'>
              <Row className='mb-2'>
                <Col md={2} className='d-flex g-0 text-white'>
                  <b>{t('cam-data')}:</b>
                </Col>
                <Col md={10} className='text-white ms-auto'>
                  <p className='mb-1'>{t('cam-number')}: {id}</p>
                  <p className='mb-1'>
                    {t('cam-location')}: Lon. {location.longitude}, 
                    Lat. {location.latitude}
                  </p>
                  <p className='mb-1'>{t('cam-direction')}: {direction}&#176;</p>
                  <p className='mb-1'>
                    {t('cam-last-feed')}: {last_update ? formatDate(last_update) : '-'}
                  </p>
                </Col>
              </Row>
              <Row>
                <Col md={2} className='d-flex g-0 text-white'>
                  <b>{t('Info', {ns: 'common'})}:</b>
                </Col>
                <Col md={10}>
                  {description}
                </Col>
              </Row>
            </div>
            {obj.length > 1 ? <hr /> : null}
          </React.Fragment>
        )
        )}
      </div>
    </Popup>
  )
};

Tooltip.propTypes = {
  coordinate: PropTypes.array,
  object: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  t: PropTypes.func
}

export default withTranslation(['inSitu'])(Tooltip);
