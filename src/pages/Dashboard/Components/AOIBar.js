import React, { useCallback, useEffect, useState } from 'react';

import moment from 'moment';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Card, Input, Button } from 'reactstrap';

import { useMap } from 'components/BaseMap/MapContext';
import { getViewState } from 'helpers/mapHelper';
import { dateRangeSelector } from 'store/common.slice';
import { flattenedMapRequestsSelector } from 'store/datalayer.slice';
import {
  fetchEvents,
  setEventParams,
  filteredEventsSelector,
} from 'store/events.slice';
import { defaultAoiSelector } from 'store/user.slice';

import EventsPanel from './EventsPanel';
import MapComponent from './Map';

const DATE_FORMAT = 'YYYY-MM-DD';

const AOIBar = ({
  orgPplList,
  orgReportList,
  commsList,
  missionsList,
  alertsList,
  visibleLayers,
  t,
}) => {
  const { setViewState } = useMap();
  const dispatch = useDispatch();

  const [selectedLayer, setSelectedLayer] = useState(null);

  const defaultAoi = useSelector(defaultAoiSelector);
  const dateRange = useSelector(dateRangeSelector);

  // start with filtered alerts, looks better starting with none and showing
  // the right number in a few seconds, than starting with lots and then
  // shortening the list
  const filteredEvents = useSelector(filteredEventsSelector);
  const mapRequests = useSelector(flattenedMapRequestsSelector);

  const updateEventList = useCallback(() => {
    // default to last 3 days, else use date range selector
    const dateRangeParams = dateRange
      ? { start_date: dateRange[0], end_date: dateRange[1] }
      : {
          start_date: moment().subtract(3, 'days').format(DATE_FORMAT),
          end_date: moment().format(DATE_FORMAT),
        };

    const eventParams = {
      order: '-date',
      status: undefined,
      bbox: undefined,
      default_bbox: true,
      ...dateRangeParams,
    };
    dispatch(setEventParams(eventParams));
    dispatch(
      fetchEvents({ options: eventParams, fromPage: true, isLoading: false }),
    );
  }, [dateRange, dispatch]);

  useEffect(() => {
    updateEventList();
  }, [dateRange, updateEventList]);

  const updateRasterLayer = newLayerId => {
    const selectedNode = mapRequests.find(layer => layer.key === newLayerId);
    setSelectedLayer(selectedNode);
  };

  const handleResetAOI = useCallback(() => {
    setViewState(
      getViewState(
        defaultAoi.features[0].properties.midPoint,
        defaultAoi.features[0].properties.zoomLevel,
      ),
    );
  }, [defaultAoi.features, setViewState]);

  return (
    <Container fluid="true">
      <Card className="px-3">
        <Row xs={1} sm={1} md={1} lg={2} xl={2} className="p-2 gx-2 row-cols-2">
          <Card className="gx-2">
            <Row xs={4} className="d-flex justify-content-end">
              <Button
                color="link"
                onClick={handleResetAOI}
                className="align-self-baseline pe-0"
              >
                {t('default-aoi')}
              </Button>
            </Row>
            {
              <Input
                id="sortByDate"
                className="btn-sm sort-select-input"
                name="sortByDate"
                placeholder={'Select a layer'}
                type="select"
                onChange={e => {
                  updateRasterLayer(e.target.value);
                }}
                value={selectedLayer?.key}
              >
                {mapRequests?.length === 0 ? (
                  <option value={''}>--{t('No layers in this AOI')}--</option>
                ) : (
                  <option disabled={true} value={''}>
                    --{t('Select a layer')}--
                  </option>
                )}
                {mapRequests
                  ? mapRequests.map(request => (
                      <option
                        key={request.key}
                        value={request.key}
                      >{`${request.parentTitle} - ${request.title} (${request.datatype_id})`}</option>
                    ))
                  : null}
              </Input>
            }
            <MapComponent
              selectedLayer={selectedLayer}
              eventList={filteredEvents}
              orgPplList={orgPplList}
              orgReportList={orgReportList}
              commsList={commsList}
              missionsList={missionsList}
              alertsList={alertsList}
              visibleLayers={visibleLayers}
            />
          </Card>
          <Container className="px-4 container">
            <Row>
              <EventsPanel eventList={filteredEvents} />
            </Row>
            <Row>
              <Card
                className="card alert-card-secondary"
                style={{ minHeight: 300 }}
              >
                <div className="alert-title">
                  <p>Pin Values panel</p>
                </div>
                <div>
                  <p>To be done</p>
                </div>
              </Card>
            </Row>
          </Container>
        </Row>
      </Card>
    </Container>
  );
};

export default withTranslation(['common'])(AOIBar);
