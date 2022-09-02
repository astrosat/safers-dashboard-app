/* eslint-disable react/prop-types */
import React, { useEffect, useRef } from 'react';
import { FullscreenControl, NavigationControl, MapContext, StaticMap } from 'react-map-gl';
import { MapView } from '@deck.gl/core';
import DeckGL from 'deck.gl';
import { MAPBOX_TOKEN } from '../../config';
import { FlyToInterpolator } from '@deck.gl/core';

const INITIAL_VIEW_STATE = {
  longitude: 9.56005296,
  latitude: 43.02777403,
  zoom: 4,
  bearing: 0,
  pitch: 0
};
const MAP_STYLE = {
  mb_streets: 'mapbox://styles/mapbox/streets-v11',
  mb_satellite: 'mapbox://styles/mapbox/satellite-v9',
  mb_lite: 'mapbox://styles/mapbox/light-v10',
  mb_nav: 'mapbox://styles/mapbox/navigation-day-v1'
};

const MAX_ZOOM = 20;

const easeInOutCubic = x =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const BaseMap = ({
  setViewState,
  layers = null,
  initialViewState = INITIAL_VIEW_STATE,
  hoverInfo = null,
  renderTooltip = () => { },
  onClick = () => { },
  onViewStateChange = () => { },
  onViewportLoad = () => { },
  setWidth = () => { },
  setHeight = () => { },
  widgets = [],
  screenControlPosition = 'top-left',
  navControlPosition = 'bottom-left',
  mapStyle = 'mb_streets'
}) => {

  const mapRef = useRef();
  const finalLayerSet = [
    ...layers ? layers : null
  ];

  useEffect(() => {
    window.addEventListener('resize', getMapSize);
  }, []);

  useEffect(() => {
    getMapSize();
  }, [layers]);

  const handleClick = (info, event) => {
    if (info?.object?.properties?.cluster) {
      if (info.object.properties.expansion_zoom <= MAX_ZOOM)
        setViewState({
          longitude: info.object.geometry.coordinates[0],
          latitude: info.object.geometry.coordinates[1],
          zoom: info.object.properties.expansion_zoom,
          transitionDuration: 1000,
          transitionEasing: easeInOutCubic,
          transitionInterpolator: new FlyToInterpolator(),
        });
    } else {
      onClick(info, event);
    }
  }

  const getMapSize = () => {
    const newWidth = mapRef?.current?.deck?.width;
    newWidth && setWidth(newWidth);

    const newHeight = mapRef?.current?.deck.height;
    newHeight && setHeight(newHeight);
  };

  const getPosition = (position) => {
    const props = position.split('-');
    return {
      position: 'absolute',
      [props[0]]: 10,
      [props[1]]: 10
    };
  }
  return (
    <>
      <DeckGL
        ref={mapRef}
        views={new MapView({ repeat: true })}
        onClick={handleClick}
        onViewStateChange={onViewStateChange}
        onViewportLoad={onViewportLoad}
        initialViewState={initialViewState}
        controller={true}
        layers={finalLayerSet}
        ContextProvider={MapContext.Provider}
      >
        <StaticMap
          mapboxApiAccessToken={MAPBOX_TOKEN}
          initialViewState={initialViewState}
          mapStyle={MAP_STYLE[mapStyle]}
        />
        <FullscreenControl style={getPosition(screenControlPosition)} />
        <NavigationControl style={getPosition(navControlPosition)} showCompass={false} />
        {widgets.map((widget, index) => widget(index))}
        {hoverInfo ? renderTooltip(hoverInfo) : null}
      </DeckGL>
    </>
  );
}
export default BaseMap;
