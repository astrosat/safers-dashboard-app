/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useState } from 'react';

import { MapView } from '@deck.gl/core';
import MapGL, {
  FullscreenControl,
  NavigationControl,
  MapContext,
} from 'react-map-gl';
import {
  Editor,
  DrawPolygonMode,
  DrawLineStringMode,
  EditingMode,
  RENDER_STATE,
} from 'react-map-gl-draw';
import { useSelector, useDispatch } from 'react-redux';

import {
  selectedFireBreakSelector,
  setSelectedFireBreak,
} from 'store/datalayer/datalayer.slice';
import {
  mapStylesSelector,
  selectedMapStyleSelector,
  setSelectedMapStyle,
} from 'store/map/map.slice';

import { useMap } from './MapContext';
import { MapStyleSwitcher } from './MapStyleSwitcher';
import { MAPBOX_TOKEN } from '../../config';
import { useLocalStorage } from '../../customHooks/useLocalStorage';
import { FIRE_BREAK_STROKE_COLORS } from '../../pages/DataLayer/constants';

const POLYGON_LINE_COLOR = 'rgb(38, 181, 242)';
const POLYGON_FILL_COLOR = 'rgba(255, 255, 255, 0.5)';
const POLYGON_LINE_DASH = '10,2';
const POLYGON_ERROR_COLOR = 'rgba(255, 0, 0, 0.5)';
const TRANSPARENT_COLOR = 'rgba(0, 0, 0, 0)';

const POINT_RADIUS = 8;

const PolygonMap = ({
  layers = null,
  hoverInfo = null,
  renderTooltip = () => {},
  onClick = () => {},
  clearMap,
  onViewStateChange = () => {},
  onViewportLoad = () => {},
  setWidth = () => {},
  setHeight = () => {},
  screenControlPosition = 'top-left',
  navControlPosition = 'bottom-left',
  setCoordinates,
  coordinates,
  handleAreaValidation,
  singlePolygonOnly = false,
}) => {
  const { mapRef, viewState, setViewState } = useMap();
  const [mapStyle, setMapStyle] = useLocalStorage('safers-map-style');
  const dispatch = useDispatch();

  const selectedFireBreak = useSelector(selectedFireBreakSelector);
  const mapStyles = useSelector(mapStylesSelector);
  const selectedMapStyle = useSelector(selectedMapStyleSelector);

  const finalLayerSet = [...(layers ? layers : null)];

  const MODES = [
    { id: 'editing', text: 'Edit Feature', handler: EditingMode },
    { id: 'drawPolygon', text: 'Draw Polygon', handler: DrawPolygonMode },
    {
      id: 'drawLineString',
      text: 'Draw Line String',
      handler: DrawLineStringMode,
    },
  ];

  const DRAW_TYPES = {
    LINE_STRING: 'drawLineString',
    POLYGON: 'drawPolygon',
  };

  const [modeId, setModeId] = useState(null);
  const [modeHandler, setModeHandler] = useState(null);
  const [selectedFeatureData, setSelectedFeatureData] = useState(null);
  const [areaIsValid, setAreaIsValid] = useState(true);

  const getMapSize = useCallback(() => {
    const newWidth = mapRef?.current?.deck?.width;
    newWidth && setWidth(newWidth);

    const newHeight = mapRef?.current?.deck.height;
    newHeight && setHeight(newHeight);
  }, [setHeight, setWidth]);

  useEffect(() => {
    window.addEventListener('resize', getMapSize);
  }, [getMapSize]);

  useEffect(() => {
    getMapSize();
  }, [getMapSize, layers]);

  const getPosition = position => {
    const props = position.split('-');
    return {
      position: 'absolute',
      [props[0]]: 10,
      [props[1]]: 10,
    };
  };

  const toggleMode = evt => {
    if (evt !== modeId) {
      const tempModeId = evt ? evt : null;
      const mode = MODES.find(m => m.id === tempModeId);
      const modeHandler = mode ? new mode.handler() : null;
      setModeId(tempModeId);
      setModeHandler(modeHandler);
    }
  };

  const _updateViewport = tempViewport => setViewState(tempViewport);

  const editToggle = mode => {
    if (mode == DRAW_TYPES.LINE_STRING) {
      toggleMode(
        modeId == DRAW_TYPES.LINE_STRING ? 'editing' : DRAW_TYPES.LINE_STRING,
      );
    } else if (mode == DRAW_TYPES.POLYGON) {
      if (singlePolygonOnly) {
        setAreaIsValid(true);
        setCoordinates([]);
      }
      toggleMode(modeId == DRAW_TYPES.POLYGON ? 'editing' : DRAW_TYPES.POLYGON);
    }
  };

  const handleClearMap = () => {
    setAreaIsValid(true);
    if (selectedFeatureData?.selectedFeature) {
      clearMap(selectedFeatureData);
    }
  };

  const MapControlButton = ({
    top = '90px',
    style = {},
    onClick,
    children,
  }) => (
    <div style={{ position: 'absolute', top, right: '10px' }}>
      <div className="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button
          style={{ ...style }}
          onClick={onClick}
          className="mapboxgl-ctrl-icon d-flex justify-content-center align-items-center"
          type="button"
        >
          {children}
        </button>
      </div>
    </div>
  );

  const renderToolbar = () => (
    <>
      {selectedFireBreak ? (
        <MapControlButton
          top="50px"
          style={
            modeId === DRAW_TYPES.LINE_STRING
              ? { backgroundColor: 'lightgray' }
              : {}
          }
          onClick={() => editToggle(DRAW_TYPES.LINE_STRING)}
        >
          <i className="bx bx-minus" style={{ fontSize: '20px' }}></i>
        </MapControlButton>
      ) : (
        <MapControlButton
          top="50px"
          style={
            modeId === DRAW_TYPES.POLYGON
              ? { backgroundColor: 'lightgray' }
              : {}
          }
          onClick={() => editToggle(DRAW_TYPES.POLYGON)}
        >
          <i className="bx bx-shape-triangle" style={{ fontSize: '20px' }}></i>
        </MapControlButton>
      )}
      <MapControlButton onClick={handleClearMap}>
        <i className="bx bx-trash" style={{ fontSize: '20px' }}></i>
      </MapControlButton>
    </>
  );

  const handleUpdate = val => {
    let areaValidation = true;
    if (val.editType === 'addFeature') {
      if (handleAreaValidation) {
        areaValidation = handleAreaValidation(val.data[0]);
      }
      setCoordinates(val.data, areaValidation);
      toggleMode('editing');
    } else if (val.editType === 'movePosition') {
      setCoordinates(val.data, areaValidation);
    }
  };

  const handleSelectMapStyle = mapStyle => {
    dispatch(setSelectedMapStyle(mapStyle));
    setMapStyle(mapStyle);
  };

  const handleViewStateChange = ({ viewState: { width, height, ...rest } }) => {
    onViewStateChange({ viewState: { width, height, ...rest } });
    setViewState(rest);
  };

  return (
    <>
      <MapGL
        {...viewState}
        width="100%"
        height="100%"
        mapboxApiAccessToken={MAPBOX_TOKEN}
        mapStyle={mapStyle ? mapStyle.uri : selectedMapStyle.uri}
        onViewportChange={_updateViewport}
        ContextProvider={MapContext.Provider}
        onClick={onClick}
        onViewStateChange={handleViewStateChange}
        onViewportLoad={onViewportLoad}
        layers={finalLayerSet}
        views={new MapView({ repeat: true })}
      >
        <Editor
          clickRadius={12}
          mode={modeHandler}
          features={coordinates}
          onUpdate={handleUpdate}
          onSelect={selected => {
            const id = selected?.selectedFeature?.properties?.id;
            if (id) {
              const [type, position] = id.split('-');
              dispatch(
                setSelectedFireBreak({ type, position: Number(position) }),
              );
            }
            setSelectedFeatureData(selected);
          }}
          featureStyle={data => {
            if (data.index === 0 && handleAreaValidation) {
              setAreaIsValid(handleAreaValidation(data.feature));
            }
            if (data.state === RENDER_STATE.SELECTED) {
              return {
                stroke: POLYGON_LINE_COLOR,
                fill: areaIsValid ? POLYGON_FILL_COLOR : POLYGON_ERROR_COLOR,
                r: POINT_RADIUS,
              };
            }
            const stroke =
              FIRE_BREAK_STROKE_COLORS[data.feature.properties.fireBreakType] ??
              POLYGON_LINE_COLOR;

            const defaultFeatureStyles = {
              stroke,
              strokeDasharray: POLYGON_LINE_DASH,
              r: POINT_RADIUS,
              strokeWidth: 4,
            };

            return data.feature.geometry.type === 'Polygon'
              ? {
                  ...defaultFeatureStyles,
                  fill: areaIsValid ? POLYGON_FILL_COLOR : POLYGON_ERROR_COLOR,
                }
              : {
                  ...defaultFeatureStyles,
                  fill: TRANSPARENT_COLOR,
                };
          }}
        />
        <FullscreenControl style={getPosition(screenControlPosition)} />
        <MapStyleSwitcher
          mapStyles={mapStyles}
          selectedMapStyle={selectedMapStyle}
          selectMapStyle={handleSelectMapStyle}
        />
        <NavigationControl
          style={getPosition(navControlPosition)}
          showCompass={false}
        />
        {renderTooltip(hoverInfo)}
        {renderToolbar()}
      </MapGL>
    </>
  );
};
export default PolygonMap;
