import React, { useEffect, useState, useRef } from 'react';
import {
  VictoryChart,
  VictoryAxis,
  VictoryLine,
  VictoryScatter,
  VictoryTooltip,
  VictoryContainer
} from 'victory';
import PropTypes from 'prop-types';
import { getDataLayerTimeSeriesData } from '../../store/appAction';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import { getIconLayer } from '../../helpers/mapHelper';
import { formatDate } from '../../store/utility';
import { useSelector } from 'react-redux';
import { Card } from 'reactstrap';

const DataLayerInformationComponent = ({
  children,
  menuId,
  currentLayer,
  tempLayerData,
  setTempLayerData,
  setInformation,
  featureOnly = false,
  dispatch
}) => {
  const {
    timeSeries: timeSeriesData,
    featureInfo: featureInfoData
  } = useSelector(state => state.dataLayer);
  const [tempSelectedPixel, setTempSelectedPixel] = useState([]);  
  const [selectedPixel, setSelectedPixel] = useState([]);
  const [layerData, setLayerData] = useState(null);
  const [tickValues, setTickValues] = useState([]);
  const [chartValues, setChartValues] = useState([]);
  const chartContainerRef = useRef(null);

  useEffect(()=> {
    if(timeSeriesData) {
      const array = timeSeriesData.split('\n');
      array.splice(0,3);
      if(!array[array.length -1]) {
        array.pop();
      }
      if(array.length != 0) {
        setTickValues(array.map(x=> {
          return x.split(',')[0];
        }));

        setChartValues(array.map(data=> {
          const tempY = data.split(',')[1].replace(/\d+\.\d+/g, function(match) {
            return Number(match).toFixed(2);
          })
          return {
            x: data.split(',')[0],
            y: tempY? tempY : '0',
            label: tempY? ` ${tempY}, ${formatDate(data.split(',')[0])} ` : '0'
          }
        }));
      } else {
        setTickValues([]);
        setChartValues([]);
      }
      
    }
  }, [timeSeriesData])

  useEffect(()=> {
    getPixelValue();
  },[featureInfoData])

  useEffect(()=> {
    if(layerData) {
      chartContainerRef.current?.scrollIntoView({behavior: 'smooth'});  
    }
  }, [layerData, chartContainerRef.current])

  useEffect(()=> {
    setInformation(
      <>{selectedPixel?.length > 0 && <Card color="dark default-panel mt-3">
        <div className='d-flex justify-content-between align-items-center'>
          <div className='p-3 empty-loading'>
            {getPixelValue()}
          </div>
          <h4 className='ps-3 mb-0'><i className='meta-close' onClick={()=>clearInfo()}>x</i></h4>
        </div>
      </Card>}

      {layerData && !featureOnly && 
      <Card color="dark default-panel mt-3">
        <h4 className='ps-3 pt-3 mb-2'><i className='meta-close' onClick={()=>clearInfo()}>x</i></h4>
        <div ref={chartContainerRef} className='d-flex'>
          <div style={{width: '60%', marginTop: '-65px'}}>
            <VictoryChart containerComponent={<VictoryContainer responsive={true}/>}>
              <VictoryAxis
                tickCount={4}
                tickValues={tickValues}
                tickFormat={(tick) => formatDate(tick).split(' ').join('\n')}
                style={{
                  axis: {
                    stroke: 'white', 
                  },
                  ticks: {stroke: 'grey', size: 10},
                  tickLabels: {
                    fill: 'white', //CHANGE COLOR OF X-AXIS LABELS
                    fontSize: 7,
                    padding: 5
                  }, 
                  grid: {
                    stroke: 'white', //CHANGE COLOR OF X-AXIS GRID LINES
                    strokeDasharray: '7',
                  }
                }}
              />
              <VictoryAxis dependentAxis  
                tickCount={5}
                style={{ 
                  axis: {
                    stroke: 'white', 
                  },
                  tickLabels: {
                    fill: 'white', //CHANGE COLOR OF Y-AXIS LABELS
                    fontSize: 7,
                    padding: 5
                  },
                }}  
              />

              <VictoryLine data={chartValues} style={{ data: { stroke: '#F47938' } }} labelComponent={<VictoryTooltip cornerRadius={2}/>} />
              <VictoryScatter data={chartValues} style={{labels:{fontSize: 8}}} labelComponent={<VictoryTooltip cornerRadius={2} pointerLength={3}/>} />
            </VictoryChart>
          </div>
          <div style={{lineHeight: '30px', fontSize: '14px'}}>
            <div>
              <strong>Time Interval: </strong> {tickValues.sort(function(a,b){
                return new Date(b.date) - new Date(a.date);
              }).filter((x,i)=> i == 0 || i == (tickValues.length - 1)).map((x)=> formatDate(x)).join(' - ')}
            </div>
            <div>
              <strong>Mean Value: </strong> {chartValues?.length > 0 ? (chartValues.map(data=> +data.y).reduce((a, b) => a + b) / chartValues.length).toFixed(2) : 0}
            </div>
            <div>
              <strong>Highest Value: </strong> {chartValues?.length > 0 ? Math.max(...chartValues.map(data=> +data.y)) : 0}
            </div>
            <div>
              <strong>Highest Value Date: </strong> {formatDate(chartValues?.filter(data=> data.y == Math.max(...chartValues.map(data=> +data.y)))[0]?.x)}
            </div>
            <div>
              <strong>Lowest Value: </strong> {chartValues?.length > 0 ? Math.min(...chartValues.map(data=> +data.y)) : 0}
            </div>
            <div>
              <strong>Lowest Value Date: </strong> {formatDate(chartValues?.filter(data=> data.y == Math.min(...chartValues.map(data=> +data.y)))[0]?.x)}
            </div>
          </div>  
        </div>
      </Card>
      }
      </>
    )
  }, [chartValues, selectedPixel, featureInfoData])
  

  const apiFetch = (requestType) => {
    var tempUrl = ''
    if(requestType == 'GetTimeSeries') {
      tempUrl = currentLayer.timeseries_url.replace('{bbox}', `${tempSelectedPixel[0]},${tempSelectedPixel[1]},${tempSelectedPixel[0]+0.0001},${tempSelectedPixel[1]+0.0001}`);
    } else if(requestType == 'GetFeatureInfo') {
      tempUrl = currentLayer.pixel_url.replace('{bbox}', `${tempSelectedPixel[0]},${tempSelectedPixel[1]},${tempSelectedPixel[0]+0.0001},${tempSelectedPixel[1]+0.0001}`);
    }

    dispatch(getDataLayerTimeSeriesData(tempUrl, requestType));
  }

  const toggleDisplayLayerInfo = () => {
    setSelectedPixel(tempSelectedPixel);
    setLayerData(null);
    apiFetch('GetFeatureInfo');
  }

  const toggleTimeSeriesChart = () => {
    setSelectedPixel([]);
    setLayerData(tempLayerData);
    apiFetch('GetTimeSeries');
  }

  const clearInfo = () => {
    setSelectedPixel([]);    
    setLayerData(null);
    setTempLayerData(null);
    setChartValues([]);
  }

  const getPixelValue = () => {
    var valueString = '';
    if(featureInfoData?.features?.length > 0 && featureInfoData?.features[0]?.properties) {
      for (const key in featureInfoData.features[0].properties) {
        if (Object.hasOwnProperty.call(featureInfoData.features[0].properties, key)) {
          valueString = valueString+`Value of pixel: ${featureInfoData.features[0].properties[key]}\n`;
        }
      }
    }
    return valueString;
  }

  const generateGeoJson = (data,event)=> {   
    if(event.rightButton && currentLayer?.id) {
      const layer = getIconLayer(
        [{ geometry: { coordinates : data.coordinate} }], 
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
              mask: true
            }
          },
          sizeScale: 8,
          sizeMinPixels: 40,
          sizeMaxPixels: 40,
          getColor: () => [57, 58, 58],
        }
      );
      setTempLayerData(layer);
      setTempSelectedPixel(data.coordinate);
    }
  }

  return (<>
    <ContextMenuTrigger id={menuId}>
      {React.cloneElement(children, { onClick: generateGeoJson })}
    </ContextMenuTrigger>
    <ContextMenu id={menuId} className="geo-menu">
      {currentLayer?.id && <><MenuItem className="geo-menuItem" onClick={toggleDisplayLayerInfo}>
                Get Feature Info
      </MenuItem>
      {!featureOnly && <MenuItem className="geo-menuItem" onClick={toggleTimeSeriesChart}>
                Time Series Chart
      </MenuItem>}</>}
    </ContextMenu>    
  </>)
}

DataLayerInformationComponent.propTypes = {
  children: PropTypes.any,
  currentLayer: PropTypes.any,  
  menuId: PropTypes.any,  
  tempLayerData: PropTypes.any,  
  setTempLayerData: PropTypes.any,  
  setInformation: PropTypes.any,  
  featureOnly: PropTypes.bool,
  dispatch: PropTypes.any,
}

export default DataLayerInformationComponent;