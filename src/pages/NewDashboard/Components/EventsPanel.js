import React, { useEffect, useState }  from 'react';
import { Card, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { setEventParams } from '../../../store/appAction';
import { getAllEventAlerts } from '../../../store/appAction';
import { EventItem } from './EventItem'
import { withTranslation } from 'react-i18next'
import PropTypes from 'prop-types';

const EventsPanel = ({t}) => {

  const dispatch = useDispatch();
  const { allAlerts: events } = useSelector(state => state.eventAlerts);  

  let [eventList, setEventList] = useState([]);

  useEffect (() => {
    const dateRangeParams = {};
    const eventParams = {
      order: '-date',
      status: undefined,
      bbox: '',
      default_bbox: true,
      ...dateRangeParams
    };
    dispatch(setEventParams(eventParams))
    dispatch(getAllEventAlerts(eventParams, true, true));
  }, []);

  useEffect(()=>{
    setEventList(events);
  }, [events])

  return (
    <Card>
      <Row>
        <p className='alert-title'>{t('Events')}</p>
      </Row>
      <Row>    
        { eventList && eventList.length>0 ?
          eventList.map( event => <EventItem key={event?.id} event={event} /> ) :
          <h3>No current events</h3>
        }
      </Row>
    </Card>
  );
}

EventsPanel.propTypes = {
  t: PropTypes.func
}

export default withTranslation(['common'])(EventsPanel);
