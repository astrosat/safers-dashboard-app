import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FlyToInterpolator, COORDINATE_SYSTEM } from 'deck.gl';
import { Nav, Row, Col, NavItem, NavLink, TabPane, TabContent } from 'reactstrap';
import toastr from 'toastr';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import Slider from 'react-rangeslider';
import { getAllMapRequests } from '../../store/datalayer/action'
import DataLayer from './DataLayer';
import OnDemandDataLayer from './OnDemandDataLayer';
import FireAndBurnedArea from './FireAndBurnedArea';
import PostEventMonitoringForm from './PostEventMonitoringForm'
import WildfireSimulation from './WildfireSimulation'
import { getAllDataLayers, setNewMapRequestState, setAlertApiParams } from '../../store/appAction';
import { getBoundingBox } from '../../helpers/mapHelper';
import { SLIDER_SPEED, DATA_LAYERS_PANELS, EUROPEAN_BBOX } from './constants'
import { filterNodesByProperty } from '../../store/utility';
import { fetchEndpoint } from '../../helpers/apiHelper';
import { setFilteredAlerts } from '../../store/alerts/action';

const DataLayerDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const timer = useRef(null);

  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const {
    dataLayers, 
    metaData, 
    isMetaDataLoading,
    timeSeries: timeSeriesData,
    featureInfo: featureInfoData
  } = useSelector(state => state.dataLayer);
  const dateRange = useSelector(state => state.common.dateRange);
  const { allMapRequests, isNewAlert } = useSelector(state=> state?.dataLayer);

  const [mapRequests, setMapRequests] = useState([])
  const [viewState, setViewState] = useState(undefined);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [currentLayer, setCurrentLayer] = useState(undefined);
  const [selectOptions, setSelectOptions] = useState({})
  const [dataDomain, setDataDomain] = useState(undefined);
  const [sortByDate, setSortByDate] = useState(undefined);
  const [layerSource, setLayerSource] = useState(undefined);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderRangeLimit, setSliderRangeLimit] = useState(0);
  const [sliderChangeComplete, setSliderChangeComplete] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bitmapLayer, setBitmapLayer] = useState(undefined);
  const [showLegend, setShowLegend] = useState(false);
  const [activeTab, setActiveTab] = useState(DATA_LAYERS_PANELS.mapLayers);
  const [timestamp, setTimestamp] = useState('')

  const { sourceOptions, domainOptions } = selectOptions;

  // This is to prevent the component from automatically updating
  // when new map requests appear in global state (should show toast)
  useEffect(() => {
    if (!mapRequests.length) {
      setMapRequests(allMapRequests)
    }
  }, [allMapRequests]);

  //fetch data to populate 'Source' and 'Domain' selects
  useEffect(() => {
    (async () => {
      const [sourceOptions, domainOptions] = await Promise.all([
        fetchEndpoint('/data/layers/sources'), 
        fetchEndpoint('/data/layers/domains')
      ])
      setSelectOptions({ sourceOptions, domainOptions });
    })()
  }, [])

  useEffect(() => {
    dispatch(setNewMapRequestState(false, true));
    return () => {
      dispatch(setAlertApiParams(undefined));
      dispatch(setNewMapRequestState(false, false));
    }
  }, []);

  useEffect(() => {
    if (isNewAlert) {
      toastr.success('New maps are received. Please refresh the list.', '', { preventDuplicates: true, });
    }
  }, [isNewAlert]);

  useEffect(() => {
    setBoundingBox(
      getBoundingBox(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel, 300, 300));
  }, [defaultAoi]);

  useEffect(() => {
    if (!viewState && dataLayers.length > 0) {
      setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel));
    }
  }, [dataLayers]);

  useEffect(() => {
    const dateRangeParams = dateRange 
      ? { start: dateRange[0], end: dateRange[1] } 
      : {};

    const options = {
      order: sortByDate,
      source: layerSource ? layerSource : undefined,
      domain: dataDomain ? dataDomain : undefined,
      start: dateRange[0],
      end: dateRange[1],
      default_start: false,
      default_end: false,
      default_bbox: false,
      ...dateRangeParams,
    }
      
    dispatch(getAllDataLayers(options));
    dispatch(getAllMapRequests(options, true))
  }, [layerSource, dataDomain, sortByDate, dateRange, boundingBox]);

  useEffect(() => {
    setSliderValue(0);
    setIsPlaying(false);
    if (currentLayer && currentLayer.urls) {
      const urls = getUrls();
      const timestamps = getTimestamps();
      setTimestamp(timestamps[sliderValue])
      const imageUrl = urls[0].replace('{bbox}', EUROPEAN_BBOX);
      setBitmapLayer(getBitmapLayer(imageUrl));
      setSliderRangeLimit(urls.length - 1);
    }
  }, [currentLayer]);

  useEffect(() => {
    if (currentLayer?.urls) {
      if (sliderChangeComplete) {
        const urls = getUrls();
        if (urls[sliderValue]) {
          const imageUrl = urls[sliderValue].replace('{bbox}', EUROPEAN_BBOX);
          setBitmapLayer(getBitmapLayer(imageUrl));
        }
      }
      const timestamps = getTimestamps();
      if (timestamps[sliderValue]) {
        setTimestamp(timestamps[sliderValue]);
      }
    }
  }, [sliderValue, sliderChangeComplete]);


  useEffect(() => {
    let nextValue = sliderValue;
    if (isPlaying) {
      timer.current = setInterval(() => {
        if (nextValue < getUrls().length) {
          nextValue += 1;
          setSliderValue(nextValue);
        } else {
          clearInterval(timer.current);
          setIsPlaying(false);
        }
      }, SLIDER_SPEED);
    }
    else {
      clearInterval(timer.current);
    }
  }, [isPlaying]);

  const getAllTitles = (arr) => {
    let titles = [];

    const aggregate = data => data.forEach(datum => {
      if (datum.children) {
        aggregate(datum.children);
      }
      titles = [...titles, datum.text];
    });
    
    aggregate(arr);
    return titles;
  }

  const backToOnDemandPanel = () => { 
    setActiveTab(DATA_LAYERS_PANELS.onDemandMapLayers);
  }

  const getUrls = () => Object.values(currentLayer?.urls);

  const getTimestamps = () => {
    return Object.keys(currentLayer?.urls)
  }

  const getBitmapLayer = (url) => {
    return {
      id: 'bitmap-layer',
      bounds: EUROPEAN_BBOX,
      image: url,
      _imageCoordinateSystem: COORDINATE_SYSTEM.LNGLAT,
    }
  }

  const formatTooltip = value => moment(Object.assign({}, Object.keys(currentLayer?.urls))[value]).format('LLL');

  const getSlider = (index) => {
    if (currentLayer?.urls && Object.keys(currentLayer?.urls).length > 1) {
      return (
        <div style={{
          position: 'absolute',
          zIndex: 1,
          bottom: '70px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <button
            type="button"
            className="btn btn-layers-slider-play float-start me-3 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label='play-data-layers'
          >
            <i className={`h4 mdi ${isPlaying ? 'mdi-stop' : 'mdi-play'}`} />
          </button>
          <Slider
            key={index}
            value={sliderValue}
            orientation="horizontal"
            format={formatTooltip}
            min={0}
            max={sliderRangeLimit}
            tooltip={true}
            onClick={() => {
              setSliderChangeComplete(true)
            }}
            onChangeStart={() => {
              setIsPlaying(false);
              setSliderChangeComplete(false);
            }}
            onChange={value => setSliderValue(value)}
            onChangeComplete={() => {
              setIsPlaying(false);
              setSliderChangeComplete(true)
            }}
          />
        </div>
      );
    }

    return null
  }

  const getLegend = () => {
    if (currentLayer?.legend_url) {
      return (
        <div style={{
          position: 'absolute',
          zIndex: 1,
          bottom: '30px',
          width: '100%',
          display: 'flex',
          alignItems: 'center'
        }}>
          <button
            type="button"
            className="btn btn-layers-slider-play float-start me-2 p-0"
            onClick={() => setShowLegend(!showLegend)}
          >
            <i className="h4 mdi mdi-map-legend">legend</i>
          </button>     
        </div>
      );
    }
  }

  const getViewState = (midPoint, zoomLevel = 4) => ({
    longitude: midPoint[0],
    latitude: midPoint[1],
    zoom: zoomLevel,
    pitch: 0,
    bearing: 0,
    transitionDuration: 1000,
    transitionInterpolator: new FlyToInterpolator()
  })

  const handleResetAOI = useCallback(() => {
    setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
  }, []);

  const sharedMapLayersProps = {
    t,
    layerSource,
    setLayerSource,
    sourceOptions,
    domainOptions,
    currentLayer,
    setCurrentLayer,
    dataDomain,
    setDataDomain,
    sortByDate,
    setSortByDate,
    getSlider,
    getLegend,
    bitmapLayer,
    viewState,
    handleResetAOI,
    timeSeriesData,
    featureInfoData,
    getAllTitles,
    timestamp
  };

  return(
    <div className='page-content'>
      {showLegend ? (
        <div className='legend'>
          <img src={currentLayer.legend_url}/>
        </div>
      ) : null}
      <div className='mx-2 sign-up-aoi-map-bg'>
        <Row>
          <Col xl={5} className='mb-3'>
            <Row className='d-flex align-items-baseline'>
              <Col xl={4} className='d-flex align-items-baseline'>
                <p className='alert-title'>
                  {t('Data Layers')}
                </p>
                <button
                  type="button"
                  className="btn float-end mt-1 py-0 px-1"
                  aria-label='refresh-events'
                  onClick={() => {
                    dispatch(setFilteredAlerts(allMapRequests));
                  }}
                >
                  <i className="mdi mdi-sync"></i>
                </button>
              </Col>
              <Col xl={8}>
                {activeTab < 2 ? (
                  <Nav className='d-flex flex-nowrap' pills fill>
                    <NavItem>
                      <NavLink
                        className={{
                          'active': activeTab === DATA_LAYERS_PANELS.mapLayers 
                        }}
                        onClick={() => setActiveTab(DATA_LAYERS_PANELS.mapLayers)}
                      >
                        {t('Operational Map Layers')}
                      </NavLink>
                    </NavItem>
                    <NavItem>
                      <NavLink
                        className={{ 
                          'active': activeTab === DATA_LAYERS_PANELS.onDemandMapLayers 
                        }}
                        onClick={() => setActiveTab(DATA_LAYERS_PANELS.onDemandMapLayers)}
                      >
                        {t('On-Demand Map Layers')}
                      </NavLink>
                    </NavItem>
                  </Nav>
                ) : null}
              </Col>
            </Row>
          </Col>
          <Col xl={7}/>
        </Row>
        <TabContent activeTab={activeTab}>
          <TabPane tabId={DATA_LAYERS_PANELS.mapLayers}>
            <DataLayer
              operationalMapLayers={filterNodesByProperty(dataLayers, {
                source: layerSource, 
                domain: dataDomain
              })}
              dispatch={dispatch}
              metaData={metaData}
              isMetaDataLoading={isMetaDataLoading}
              {...sharedMapLayersProps}
            />
          </TabPane>
          <TabPane tabId={DATA_LAYERS_PANELS.onDemandMapLayers}>
            <OnDemandDataLayer
              mapRequests={filterNodesByProperty(mapRequests, {
                source: layerSource, 
                domain: dataDomain
              })}
              dispatch={dispatch}
              setActiveTab={setActiveTab}
              {...sharedMapLayersProps}
            />
          </TabPane>
          <TabPane tabId={DATA_LAYERS_PANELS.fireAndBurnedAreas}>
            {/* ternary here to unmount and clear form */}
            {activeTab === DATA_LAYERS_PANELS.fireAndBurnedAreas ? (
              <FireAndBurnedArea 
                t={t}
                handleResetAOI={handleResetAOI}
                backToOnDemandPanel={backToOnDemandPanel}
              />
            ) : null}
          </TabPane>
          <TabPane tabId={DATA_LAYERS_PANELS.postEventMonitoring}>
            {/* ternary here to unmount and clear form */}
            {activeTab === DATA_LAYERS_PANELS.postEventMonitoring ? (
              <PostEventMonitoringForm 
                t={t} 
                handleResetAOI={handleResetAOI}
                backToOnDemandPanel={backToOnDemandPanel}
              />
            ) : null}
          </TabPane>
          <TabPane tabId={DATA_LAYERS_PANELS.wildfireSimulation}>
            {/* ternary here to unmount and clear form */}
            {activeTab === DATA_LAYERS_PANELS.wildfireSimulation ? (
              <WildfireSimulation 
                t={t}
                handleResetAOI={handleResetAOI}
                backToOnDemandPanel={backToOnDemandPanel}
              />
            ) : null}
          </TabPane>
        </TabContent>
      </div>
    </div>
  );
};

export default DataLayerDashboard;
