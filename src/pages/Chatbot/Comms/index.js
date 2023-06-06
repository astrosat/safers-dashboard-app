import React, { useEffect, useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button } from 'reactstrap';

import { useMap } from 'components/BaseMap/MapContext';
import { MAP_TYPES } from 'constants/common';
import useInterval from 'customHooks/useInterval';
import { getIconLayer } from 'helpers/mapHelper';
import { dateRangeSelector } from 'store/common.slice';
import {
  fetchComms,
  allCommsSelector,
  filteredCommsSelector,
} from 'store/comms.slice';
import { defaultAoiSelector } from 'store/user.slice';

import Comm from './Components/Comm';
import CreateMessage from './Components/CreateMessage';
import SortSection from './Components/SortSection';
import MapSection from '../Components/FormMapSection';
import ListView from '../Components/ListView';

const Comms = ({ pollingFrequency }) => {
  const { deckRef, updateViewState } = useMap();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const defaultAoi = useSelector(defaultAoiSelector);
  const allComms = useSelector(allCommsSelector);
  const filteredComms = useSelector(filteredCommsSelector);
  const dateRange = useSelector(dateRangeSelector);

  const [selectedComm, setSelectedComm] = useState(undefined);
  const [iconLayer, setIconLayer] = useState(undefined);
  const [sortOrder, setSortOrder] = useState('desc');
  const [status, setStatus] = useState('');
  const [target, setTarget] = useState('');
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [coordinates, setCoordinates] = useState(null);
  const [togglePolygonMap, setTogglePolygonMap] = useState(false);
  const [toggleCreateNewMessage, setToggleCreateNewMessage] = useState(false);
  const [commsParams, setCommsParams] = useState({});
  const [pageData, setPageData] = useState([]);

  const commsList = filteredComms ?? allComms;

  // Get the index, then divide that by 4 and ceil it, gets the page.
  let selectedIndex = 1;
  if (selectedComm) {
    selectedIndex = commsList.findIndex(comm => comm.id === selectedComm.id);
  }

  useEffect(() => {
    setCommsParams(previous => {
      const options = {
        ...previous,
        bbox: boundingBox?.toString(),
        default_date: false,
        default_bbox: !boundingBox,
        ...(dateRange
          ? {
              start: dateRange[0],
              end: dateRange[1],
            }
          : {}),
      };

      const feFilters = { sortOrder, status, target };

      dispatch(
        fetchComms({
          options,
          feFilters,
        }),
      );

      return options;
    });
  }, [dateRange, boundingBox, sortOrder, status, target, dispatch]);

  useEffect(() => {
    setIconLayer(
      getIconLayer(commsList, MAP_TYPES.COMMUNICATIONS, 'communications', {
        id: selectedComm?.id,
      }),
    );
  }, [commsList, selectedComm?.id]);

  useInterval(
    () => {
      dispatch(
        fetchComms({
          options: commsParams,
          feFilters: { status, sortOrder, target },
          isPolling: true,
        }),
      );
    },
    pollingFrequency,
    [commsParams],
  );

  const getCommsByArea = () =>
    setBoundingBox(deckRef.current.deck.viewManager._viewports[0].getBounds());

  const handleResetAOI = useCallback(
    () =>
      updateViewState({
        longitude: defaultAoi.features[0].properties.midPoint[0],
        latitude: defaultAoi.features[0].properties.midPoint[1],
        zoom: defaultAoi.features[0].properties.zoomLevel,
      }),
    [defaultAoi.features, updateViewState],
  );

  const handleMapItemClick = info => {
    const id = info?.object?.properties.id;

    if (id) {
      const comm = commsList.find(c => c.id === id);

      if (comm) {
        setSelectedComm(comm);
      }
    }
  };

  const handleListItemClick = comm => {
    if (comm) {
      setSelectedComm(comm);

      updateViewState({
        longitude: comm.location[0],
        latitude: comm.location[1],
      });
    }
  };

  const onCancel = () => {
    setTogglePolygonMap(false);
    setToggleCreateNewMessage(false);
    setCoordinates('');
  };

  return (
    <div className="mx-2">
      <Row className="justify-content-end mb-2">
        <Col xl={7}>
          <Button color="link" onClick={handleResetAOI} className="p-0">
            {t('default-aoi', { ns: 'common' })}
          </Button>
        </Col>
      </Row>
      <Row>
        {!toggleCreateNewMessage ? (
          <Col xl={5}>
            <SortSection
              status={status}
              setStatus={setStatus}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              target={target}
              setTarget={setTarget}
              setTogglePolygonMap={() => {
                setTogglePolygonMap(true);
                setToggleCreateNewMessage(true);
              }}
            />

            <Row>
              <Col xl={12} className="px-3">
                <ListView
                  items={commsList}
                  selectedIndex={selectedIndex}
                  setPageData={setPageData}
                >
                  {pageData.map(comm => (
                    <Comm
                      key={comm.id}
                      comm={comm}
                      selectedComm={selectedComm}
                      selectComm={handleListItemClick}
                    />
                  ))}
                </ListView>
              </Col>
            </Row>
          </Col>
        ) : (
          <Col xl={5}>
            <CreateMessage
              onCancel={onCancel}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
            />
          </Col>
        )}

        <Col xl={7} className="mx-auto">
          <MapSection
            iconLayer={iconLayer}
            getInfoByArea={getCommsByArea}
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            togglePolygonMap={togglePolygonMap}
            onClick={handleMapItemClick}
            clearMap={() => setCoordinates([])}
          />
        </Col>
      </Row>
    </div>
  );
};

Comms.propTypes = {
  pollingFrequency: PropTypes.number,
};

export default Comms;
