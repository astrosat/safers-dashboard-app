import React, { useEffect, useState, useRef } from 'react';

import PropTypes from 'prop-types';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { useSelector } from 'react-redux';
import { Card } from 'reactstrap';
import {
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
  VictoryTooltip,
  VictoryZoomContainer,
  VictoryBrushContainer,
} from 'victory';

import { getIconLayer } from 'helpers/mapHelper';
import {
  fetchFeatureInfo,
  fetchTimeSeriesInfo,
  timeSeriesInfoSelector,
  featureInfoSelector,
} from 'store/datalayer.slice';
import { formatDate } from 'utility';

const displayFeature = properties => {
  const keys = Object.keys(properties);

  const rows = keys.map(key => {
    if (typeof properties[key] === 'object') {
      return (
        <div key={key} className="featureRow">
          <span className="featureKey">{key}:</span>
          <span className="featureValue">
            {properties[key] ? displayFeature(properties[key]) : 'No data'}
          </span>
        </div>
      );
    } else {
      return (
        <div key={key} className="featureRow">
          <div className="featureCell">
            <span className="featureKey">{key}:</span>
            {typeof properties[key] === 'number' ? (
              <span className="featureValue">{properties[key].toFixed(2)}</span>
            ) : (
              <span className="featureValue">{properties[key]}</span>
            )}
          </div>
        </div>
      );
    }
  });

  return rows;
};

/**
 * Parse properties object, converting any JSON as strings to proper
 * JSON. If there is an exception, then the value isn't JSON, so just
 * assign it to the new object.
 *
 * @param {*} properties
 * @return {*}
 */
const parseFeatureProperties = properties => {
  let parsedProperties = null;

  // Iterate each key in the object and try to parse it's value.
  Object.keys(properties).forEach(key => {
    try {
      const transformed = JSON.parse(properties[key]);
      parsedProperties = {
        ...parsedProperties,
        [key]: transformed,
      };
    } catch (error) {
      // Non parseable value e.g. normal string, then just pass it
      // through.
      parsedProperties = {
        ...parsedProperties,
        [key]: properties[key],
      };
    }
  });

  return parsedProperties;
};

const DataLayerInformationComponent = ({
  children,
  menuId,
  currentLayer,
  tempLayerData,
  setTempLayerData,
  setInformation,
  dispatch,
}) => {
  const timeSeriesData = useSelector(timeSeriesInfoSelector);
  const featureInfoData = useSelector(featureInfoSelector);

  const [tempSelectedPixel, setTempSelectedPixel] = useState([]);
  const [selectedPixel, setSelectedPixel] = useState([]);
  const [layerData, setLayerData] = useState(null);
  const [tickValues, setTickValues] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const [zoomDomain, setZoomDomain] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);
  const chartContainerRef = useRef(null);
  const timeseriesExists = !!currentLayer?.timeseries_urls;

  let title = currentLayer?.title;
  if (currentLayer?.units) {
    title = `${title} ${currentLayer.units}`;
  }

  useEffect(() => {
    if (timeSeriesData) {
      const array = timeSeriesData.split('\n');
      array.splice(0, 3);
      if (!array[array.length - 1]) {
        array.pop();
      }
      if (array.length !== 0) {
        setTickValues(
          array.map(x => {
            return x.split(',')[0];
          }),
        );

        setChartValues(
          array.map(data => {
            const [x, y] = data.split(',');
            const x2 = x; //new Date(x)
            const y2 = y ? +Number(y).toFixed(4) : null;
            return {
              x: x2,
              y: y2,
              label: y2 ? ` ${y2}, ${formatDate(x2)} ` : null,
            };
          }),
        );
      } else {
        setTickValues([]);
        setChartValues([]);
      }
    }
  }, [timeSeriesData]);

  useEffect(() => {
    if (chartValues?.length > 0) {
      setTimeout(() => {
        chartContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [chartValues]);

  const handleZoom = domain => {
    setSelectedDomain(domain);
  };

  const handleBrush = domain => {
    setZoomDomain(domain);
  };

  useEffect(() => {
    setInformation(
      <>
        {selectedPixel?.length > 0 && (
          <Card color="dark default-panel mt-3">
            <div className="d-flex justify-content-between align-items-center">
              <div className="p-3 empty-loading">{getFeatureInfo()}</div>
              <h4 className="ps-3 mb-0">
                <i className="meta-close" onClick={clearInfo}>
                  x
                </i>
              </h4>
            </div>
          </Card>
        )}

        {layerData && timeseriesExists && (
          <div ref={chartContainerRef}>
            {chartValues?.length > 0 && (
              <Card color="dark default-panel mt-3">
                <h4 className="ps-3 pt-3 mb-2">
                  <i className="meta-close" onClick={clearInfo}>
                    x
                  </i>
                </h4>
                <div className="d-flex">
                  <div style={{ width: '60%' }}>
                    <div className="text-center fs-5 fw-bold mb-1">{title}</div>
                    <VictoryChart
                      padding={{ top: 5, left: 50, right: 50, bottom: 50 }}
                      scale={{ x: 'time' }}
                      containerComponent={
                        <VictoryZoomContainer
                          zoomDimension="x"
                          zoomDomain={zoomDomain}
                          onZoomDomainChange={handleZoom}
                        />
                      }
                    >
                      <VictoryAxis
                        tickCount={4}
                        tickValues={tickValues}
                        tickFormat={tick =>
                          formatDate(tick).split(' ').join('\n')
                        }
                        style={{
                          axis: {
                            stroke: 'white',
                          },
                          ticks: { stroke: 'grey', size: 10 },
                          tickLabels: {
                            fill: 'white', //CHANGE COLOR OF X-AXIS LABELS
                            fontSize: 7,
                            padding: 5,
                          },
                          grid: {
                            stroke: 'white', //CHANGE COLOR OF X-AXIS GRID LINES
                            strokeDasharray: '7',
                          },
                        }}
                      />
                      <VictoryAxis
                        dependentAxis
                        tickCount={5}
                        style={{
                          axis: {
                            stroke: 'white',
                          },
                          tickLabels: {
                            fill: 'white', //CHANGE COLOR OF Y-AXIS LABELS
                            fontSize: 7,
                            padding: 5,
                          },
                        }}
                      />

                      <VictoryLine
                        data={chartValues}
                        style={{ data: { stroke: '#F47938' } }}
                        labelComponent={<VictoryTooltip cornerRadius={2} />}
                      />
                      <VictoryScatter
                        size={1.5}
                        data={chartValues}
                        style={{
                          labels: { fontSize: 8 },
                          data: {
                            fill: '#F47938',
                            // fillOpacity: 0.5   //CHANGE OPACITY OF POINTS
                          },
                        }}
                        labelComponent={
                          <VictoryTooltip cornerRadius={2} pointerLength={3} />
                        }
                      />
                    </VictoryChart>
                  </div>
                  <div>
                    <div className="fs-6 lh-lg">
                      <div>
                        <strong>Time Interval: </strong>{' '}
                        {tickValues
                          .sort(function (a, b) {
                            return new Date(b.date) - new Date(a.date);
                          })
                          .filter(
                            (x, i) => i === 0 || i === tickValues.length - 1,
                          )
                          .map(x => formatDate(x))
                          .join(' - ')}
                      </div>
                      <div>
                        <strong>Mean Value: </strong>{' '}
                        {chartValues?.length > 0
                          ? (
                              chartValues
                                .map(data => +data.y)
                                .reduce((a, b) => a + b) / chartValues.length
                            ).toFixed(2)
                          : 0}
                      </div>
                      <div>
                        <strong>Highest Value: </strong>{' '}
                        {chartValues?.length > 0
                          ? Math.max(
                              ...chartValues.map(data => +data.y),
                            ).toFixed(2)
                          : 0}
                      </div>
                      <div>
                        <strong>Highest Value Date: </strong>{' '}
                        {formatDate(
                          chartValues?.filter(
                            data =>
                              data.y ===
                              Math.max(...chartValues.map(data => +data.y)),
                          )[0]?.x,
                        )}
                      </div>
                      <div>
                        <strong>Lowest Value: </strong>{' '}
                        {chartValues?.length > 0
                          ? Math.min(
                              ...chartValues.map(data => +data.y),
                            ).toFixed(2)
                          : 0}
                      </div>
                      <div>
                        <strong>Lowest Value Date: </strong>{' '}
                        {formatDate(
                          chartValues?.filter(
                            data =>
                              data.y ===
                              Math.min(...chartValues.map(data => +data.y)),
                          )[0]?.x,
                        )}
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="text-center fs-5 fw-bold mb-1">
                        Total Time Series Data Preview
                      </div>
                      <VictoryChart
                        padding={{ top: 10, bottom: 35, left: 25, right: 25 }}
                        scale={{ x: 'time' }}
                        containerComponent={
                          <VictoryBrushContainer
                            brushDimension="x"
                            brushDomain={selectedDomain}
                            onBrushDomainChange={handleBrush}
                            brushStyle={{
                              stroke: 'transparent',
                              fill: 'white',
                              fillOpacity: 0.1,
                            }}
                          />
                        }
                      >
                        <VictoryAxis
                          tickCount={4}
                          tickValues={tickValues}
                          tickFormat={tick =>
                            formatDate(tick).split(' ').join('\n')
                          }
                          style={{
                            axis: {
                              stroke: 'white',
                            },
                            ticks: { stroke: 'grey', size: 10 },
                            tickLabels: {
                              fill: 'white', //CHANGE COLOR OF X-AXIS LABELS
                              fontSize: 10,
                              padding: 5,
                            },
                            grid: {
                              stroke: 'white', //CHANGE COLOR OF X-AXIS GRID LINES
                              strokeDasharray: '7',
                            },
                          }}
                        />
                        <VictoryLine
                          data={chartValues}
                          style={{ data: { stroke: '#F47938' } }}
                          labelComponent={<VictoryTooltip cornerRadius={2} />}
                        />
                      </VictoryChart>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartValues, selectedPixel, featureInfoData, zoomDomain, selectedDomain]);

  useEffect(() => {
    clearInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLayer]);

  const apiFetch = requestType => {
    var tempUrl = null;
    if (requestType === 'GetTimeSeries') {
      tempUrl = currentLayer.timeseries_urls.map(tsURL =>
        tsURL.replace(
          '{bbox}',
          `${tempSelectedPixel[0]},${tempSelectedPixel[1]},${
            tempSelectedPixel[0] + 0.0001
          },${tempSelectedPixel[1] + 0.0001}`,
        ),
      );

      dispatch(fetchTimeSeriesInfo(tempUrl));
    } else if (requestType === 'GetFeatureInfo') {
      if (currentLayer?.pixel_url) {
        tempUrl = currentLayer.pixel_url.replace(
          '{bbox}',
          `${tempSelectedPixel[0]},${tempSelectedPixel[1]},${
            tempSelectedPixel[0] + 0.0001
          },${tempSelectedPixel[1] + 0.0001}`,
        );

        dispatch(fetchFeatureInfo(tempUrl));
      }
    }
  };

  const toggleDisplayLayerInfo = () => {
    setSelectedPixel(tempSelectedPixel);
    setLayerData(null);
    apiFetch('GetFeatureInfo');
  };

  const toggleTimeSeriesChart = () => {
    setSelectedPixel([]);
    setLayerData(tempLayerData);
    apiFetch('GetTimeSeries');
  };

  const clearInfo = () => {
    setSelectedPixel([]);
    setLayerData(null);
    setTempLayerData(null);
    setChartValues([]);
    setZoomDomain(null);
    setSelectedDomain(null);
  };

  const getFeatureInfo = () => {
    if (featureInfoData?.features?.length > 0) {
      if (featureInfoData.features[0]?.properties) {
        const featureProperties = featureInfoData.features[0].properties;

        const properties = parseFeatureProperties(featureProperties);
        const feats = displayFeature(properties);

        return <div className="featureInfo">{feats}</div>;
      }
    } else {
      return (
        <div className="featureInfo">
          <p className="p-2 noFeatureInfo">No Feature Info available</p>
        </div>
      );
    }
  };

  const generateGeoJson = (data, event) => {
    if (event.rightButton && currentLayer) {
      const layer = getIconLayer(
        [{ geometry: { coordinates: data.coordinate } }],
        null,
        'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
        {
          getSize: () => 5,
          iconMapping: {
            marker: {
              x: 0,
              y: 0,
              width: 128,
              height: 128,
              anchorY: 128,
              mask: true,
            },
          },
          sizeScale: 8,
          sizeMinPixels: 40,
          sizeMaxPixels: 40,
          getColor: () => [57, 58, 58],
        },
      );
      setTempLayerData(layer);
      setTempSelectedPixel(data.coordinate);
    }
  };

  return (
    <>
      <ContextMenuTrigger id={menuId}>
        {React.cloneElement(children, { onClick: generateGeoJson })}
      </ContextMenuTrigger>
      {currentLayer ? (
        <ContextMenu id={menuId} className="geo-menu">
          {currentLayer && (
            <>
              <MenuItem
                className="geo-menuItem"
                onClick={toggleDisplayLayerInfo}
              >
                Get Feature Info
              </MenuItem>
              {timeseriesExists && (
                <MenuItem
                  className="geo-menuItem"
                  onClick={toggleTimeSeriesChart}
                >
                  Time Series Chart
                </MenuItem>
              )}
            </>
          )}
        </ContextMenu>
      ) : null}
    </>
  );
};

DataLayerInformationComponent.propTypes = {
  children: PropTypes.any,
  currentLayer: PropTypes.any,
  menuId: PropTypes.any,
  tempLayerData: PropTypes.any,
  setTempLayerData: PropTypes.any,
  setInformation: PropTypes.any,
  dispatch: PropTypes.any,
};

export default DataLayerInformationComponent;
