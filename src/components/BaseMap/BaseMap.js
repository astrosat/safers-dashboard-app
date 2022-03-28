/* eslint-disable react/prop-types */
import React, { /*useState, useEffect */ } from 'react';
import /*Map,*/ { FullscreenControl, NavigationControl, MapContext,/* StaticMap*/ } from 'react-map-gl';
import { MapView } from '@deck.gl/core';
import DeckGL, { TileLayer, BitmapLayer } from 'deck.gl';

const INITIAL_VIEW_STATE = {
  longitude: 9.56005296,
  latitude: 43.02777403,
  zoom: 4,
  bearing: 0,
  pitch: 0
};
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const BaseMap = ({
  layers = null,
  initialViewState = INITIAL_VIEW_STATE,
  hoverInfo = null,
  renderTooltip = () => { },
  onClick = () => { },
  onViewStateChange = () => { },
  widgets = [],
  screenControlPosition = 'top-left',
  navControlPosition = 'bottom-left'
}) => {

  const tileLayer = new TileLayer({
    // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
    data: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
    ],

    // Since these OSM tiles support HTTP/2, we can make many concurrent requests
    // and we aren't limited by the browser to a certain number per domain.
    maxRequests: 20,
    pickable: true,
    onViewportLoad: null,
    autoHighlight: false,
    highlightColor: [60, 60, 60, 40],
    // https://wiki.openstreetmap.org/wiki/Zoom_levels
    minZoom: 0,
    maxZoom: 19,
    tileSize: 256,
    zoomOffset: devicePixelRatio === 1 ? -1 : 0,
    renderSubLayers: props => {
      const {
        bbox: { west, south, east, north }
      } = props.tile;

      return [
        new BitmapLayer(props, {
          data: null,
          image: props.data,
          bounds: [west, south, east, north]
        }),
      ];
    }
  });

  const finalLayerSet = [
    tileLayer,
    ...layers ? layers : null
  ];

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
        views={new MapView({ repeat: true })}
        //effects={theme.effects}
        onClick={onClick}
        onViewStateChange={onViewStateChange}
        onViewportLoad={(e) => { console.log(e) }}
        initialViewState={initialViewState}
        controller={true}
        layers={finalLayerSet}
        ContextProvider={MapContext.Provider}
      >
        {/* <StaticMap
        mapboxAccessToken='pk.eyJ1IjoidGlsYW5wZXJ1bWEiLCJhIjoiY2wwamF1aGZ0MGF4MTNlb2EwcDBpNGR6YSJ9.ay3qveZBddbe4zVS78iM3w'
        initialViewState={initialViewState}
        mapStyle={MAP_STYLE}
      /> */}
        <FullscreenControl style={getPosition(screenControlPosition)} />
        <NavigationControl style={getPosition(navControlPosition)} showCompass={false} />
        {widgets.map((widget, index) => widget(index))}
        {renderTooltip(hoverInfo)}
      </DeckGL>
    </>
  );
}
export default BaseMap;