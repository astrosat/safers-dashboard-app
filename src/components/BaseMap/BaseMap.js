import React, { Fragment } from 'react';

import { MapView } from '@deck.gl/core';
import { DeckGL } from 'deck.gl';
import { FullscreenControl, NavigationControl, StaticMap } from 'react-map-gl';
import { useSelector, useDispatch } from 'react-redux';

import { MAPBOX_TOKEN } from 'config';
import { useLocalStorage } from 'customHooks/useLocalStorage';
import {
  mapStylesSelector,
  selectedMapStyleSelector,
  setSelectedMapStyle,
} from 'store/map.slice';

import { useMap } from './MapContext';
import { MapStyleSwitcher } from './MapStyleSwitcher';

const MAX_ZOOM = 20;

const BaseMap = ({
  layers = null,
  hoverInfo = null,
  renderTooltip = () => {},
  onClick,
  widgets = [],
  screenControlPosition = 'top-right',
  navControlPosition = 'bottom-right',
}) => {
  const { mapRef, deckRef, viewState, setViewState, updateViewState } =
    useMap();
  const [mapStyle, setMapStyle] = useLocalStorage('safers-map-style');
  const dispatch = useDispatch();

  const mapStyles = useSelector(mapStylesSelector);
  const selectedMapStyle = useSelector(selectedMapStyleSelector);

  const finalLayerSet = [...(layers ? layers : null)];

  const handleSelectMapStyle = mapStyle => {
    dispatch(setSelectedMapStyle(mapStyle));
    setMapStyle(mapStyle);
  };

  const handleClick = (info, event) => {
    if (info?.object?.properties?.cluster) {
      if (info?.object?.properties?.expansion_zoom <= MAX_ZOOM) {
        updateViewState({
          longitude: info.object.geometry.coordinates[0],
          latitude: info.object.geometry.coordinates[1],
          zoom: info.object.properties.expansion_zoom,
        });
      } else {
        if (onClick) {
          onClick(info, event);
        }
      }
    } else {
      if (onClick) {
        onClick(info, event);
      }
    }
  };

  const getPosition = position => {
    const props = position.split('-');
    return {
      position: 'absolute',
      [props[0]]: 10,
      [props[1]]: 10,
    };
  };

  return (
    <>
      <DeckGL
        views={new MapView({ repeat: true })}
        ref={deckRef}
        onClick={handleClick}
        initialViewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={true}
        layers={finalLayerSet}
      >
        <StaticMap
          mapboxApiAccessToken={MAPBOX_TOKEN}
          mapStyle={mapStyle ? mapStyle.uri : selectedMapStyle.uri}
          ref={mapRef}
        />
        <FullscreenControl style={getPosition(screenControlPosition)} />
        <NavigationControl
          style={getPosition(navControlPosition)}
          showCompass={false}
        />
        {widgets.map((widget, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Fragment key={index}>{widget(index)}</Fragment>
        ))}
        {hoverInfo ? renderTooltip(hoverInfo) : null}
        <MapStyleSwitcher
          mapStyles={mapStyles}
          selectMapStyle={handleSelectMapStyle}
        />
      </DeckGL>
    </>
  );
};
export default BaseMap;
