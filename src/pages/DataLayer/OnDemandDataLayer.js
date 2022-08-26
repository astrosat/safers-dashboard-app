import React, { useEffect, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Input, Card, InputGroup, InputGroupText, Modal } from 'reactstrap';
import { BitmapLayer, FlyToInterpolator } from 'deck.gl';
import moment from 'moment';

import BaseMap from '../../components/BaseMap/BaseMap';
import { getAllDataLayers } from '../../store/appAction';

import OnDemandTreeView from './OnDemandTreeView';
// import { getDefaultDateRange } from '../../store/utility';

//i18n
import { withTranslation } from 'react-i18next'
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css'
import { getBoundingBox } from '../../helpers/mapHelper';
import SimpleBar from 'simplebar-react';
import MOCKDATA from './mockdata';

const SLIDER_SPEED = 800;
const OnDemandDataLayer = ({ 
  t, 
  setActiveTab, 
  dataLayerPanels, 
  searchDataLayers 
}) => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const dateRange = useSelector(state => state.common.dateRange)
  //const dataLayers = useSelector(state => state.dataLayer.dataLayers);
  const [dataLayers, setDataLayers] = useState(MOCKDATA);
  const [currentLayer, setCurrentLayer] = useState(undefined);
  const [bitmapLayer, setBitmapLayer] = useState(undefined);
  const [boundingBox, setBoundingBox] = useState(undefined);
  const [viewState, setViewState] = useState(undefined);
  const [sortByDate, setSortByDate] = useState(undefined);
  const [layerSource, setLayerSource] = useState(undefined);
  const [dataDomain, setDataDomain] = useState(undefined);
  const [sliderValue, setSliderValue] = useState(0);
  const [sliderRangeLimit, setSliderRangeLimit] = useState(0);
  const [sliderChangeComplete, setSliderChangeComplete] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const dispatch = useDispatch();
  const timer = useRef(null);

  useEffect(() => {
    setBoundingBox(
      getBoundingBox(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel, 300, 300));
  }, [defaultAoi]);

  useEffect(() => {
    setSliderValue(0);
    setIsPlaying(false);
    if (currentLayer && currentLayer.urls) {
      const urls = getUrls();
      const imageUrl = urls[0].replace('{bbox}', boundingBox);
      setBitmapLayer(getBitmapLayer(imageUrl));
      setSliderRangeLimit(urls.length - 1);
    }
  }, [currentLayer]);

  useEffect(() => {
    if (sliderChangeComplete && currentLayer && currentLayer.urls) {
      const urls = getUrls();
      if (urls[sliderValue]) {
        const imageUrl = urls[sliderValue].replace('{bbox}', boundingBox);
        setBitmapLayer(getBitmapLayer(imageUrl));
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

  useEffect(() => {
    if (dataLayers.length > 0) {
      if (!viewState) {
        setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
      }
    }
  }, [dataLayers]);

  useEffect(() => {
    const dateRangeParams = dateRange 
      ? { start: dateRange[0], end: dateRange[1] } 
      : {};
    dispatch(getAllDataLayers(
      {
        order: sortByDate,
        source: layerSource ? layerSource : undefined,
        domain: dataDomain ? dataDomain : undefined,
        default_bbox: false,
        ...dateRangeParams
      }
    ));
  }, [layerSource, dataDomain, sortByDate, dateRange]);

  const getUrls = () => Object.values(currentLayer?.urls);

  const toggleModal = () => setModalIsOpen(prev => !prev);

  const handleDialogButtonClick = ({ target: { value } }) => {
    setActiveTab(+value);
    toggleModal();
  }

  const getViewState = (midPoint, zoomLevel = 4) => {
    return {
      longitude: midPoint[0],
      latitude: midPoint[1],
      zoom: zoomLevel,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator()
    };
  }

  const getBitmapLayer = (url) => {
    return (new BitmapLayer({
      id: 'bitmap-layer',
      bounds: boundingBox,
      image: url
    }))
  }

  const formatTooltip = value => moment(Object.assign({}, Object.keys(currentLayer?.urls))[value]).format('LLL');

  const getSlider = (index) => {
    if (currentLayer?.urls) {
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
            className="btn btn-layers-slider-play float-start me-2 p-0"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label='play-data-layers'
          >
            <i className={`h4 mdi ${isPlaying ? 'mdi-play' : 'mdi-stop'}`} />
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

  const handleResetAOI = useCallback(() => {
    setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel))
  }, []);

  return (
    <div>
      <div>
        {showLegend ? (
          <div className='legend'>
            <img src={currentLayer.legend_url}/>
          </div>
        ) : null
        }
        <Modal
          centered
          isOpen={modalIsOpen}
          toggle={toggleModal}
          id="data-layer-dialog"
          style={{ maxWidth: '50rem' }}
        >
          <div className='d-flex flex-column align-items-center p-5'>
            <h2>{t('Select Data Type')}</h2>
            <div className='d-flex flex-nowrap gap-5 my-5'>
              <button
                value={dataLayerPanels.FIRE_AND_BURNED_AREA} 
                onClick={handleDialogButtonClick}
                className='data-layers-dialog-btn'
              >
                {t('Fire and Burned Area')}
              </button>
              <button 
                value={dataLayerPanels.POST_EVENT_MONITORING} 
                onClick={handleDialogButtonClick}
                className='data-layers-dialog-btn'
              >
                {t('Post Event Monitoring')}
              </button>
              <button
                value={dataLayerPanels.WILDfIRE_SIMULATION} 
                onClick={handleDialogButtonClick}
                className='data-layers-dialog-btn'
              >
                {t('Wildfire Simulation')}
              </button>
            </div>
            <button 
              onClick={toggleModal}
              className='data-layers-dialog-cancel'
            >
              {t('Cancel')}
            </button>
          </div>
        </Modal>
        <Row>
          <Col xl={5}>
            <Row xl={12}>
              <Col>
                <div className='d-flex justify-content-end'>
                  <Button 
                    className="request-map btn-orange" 
                    onClick={toggleModal}>
                    {t('Request a map')}
                  </Button>
                </div>
              </Col>
            </Row>
            <Row>
              <Col xl={10}>
                <Row>
                  <Col xl={4}>
                    <Input
                      id="sortByDate"
                      className="btn-sm sort-select-input"
                      name="sortByDate"
                      placeholder="Sort By : Date"
                      type="select"
                      onChange={(e) => setSortByDate(e.target.value)}
                      value={sortByDate}
                    >
                      <option value={'-date'} >{t('Sort By')} : {t('Date')} {t('desc')}</option>
                      <option value={'date'} >{t('Sort By')} : {t('Date')} {t('asc')}</option>
                    </Input>
                  </Col>
                  <Col xl={4}>
                    <Input
                      id="layerSource"
                      className="btn-sm sort-select-input"
                      name="layerSource"
                      placeholder="layerSource"
                      type="select"
                      onChange={(e) => setLayerSource(e.target.value)}
                      value={layerSource}
                    >
                      <option value={''} >Source : All</option>
                      <option value={'web'} >Source : Web</option>
                      <option value={'camera'} >Source : Camera</option>
                      <option value={'satellite'} >Source : Satellite</option>
                    </Input>
                  </Col>
                  <Col xl={4}>
                    <Input
                      id="dataDomain"
                      className="btn-sm sort-select-input"
                      name="dataDomain"
                      placeholder="Domain"
                      type="select"
                      onChange={(e) => setDataDomain(e.target.value)}
                      value={dataDomain}
                    >
                      <option value={''} >Data Domain : All</option>
                      <option value={'fire'} >Data Domain : Fire</option>
                      <option value={'weather'} >Data Domain : Weather</option>
                      <option value={'water'} >Data Domain : Water</option>
                    </Input>
                  </Col>
                </Row>
              </Col>
              <Col xl={2} className="d-flex justify-content-end">
                <Button color='link'
                  onClick={handleResetAOI} className='align-self-baseline p-0'>
                  {t('default-aoi')}
                </Button>
              </Col>
            </Row>
            <hr />
            <Row className='mb-3'>
              <Col xl={12}>
                <InputGroup>
                  <InputGroupText className='border-end-0'>
                    <i className='fa fa-search' />
                  </InputGroupText>
                  <Input
                    id="searchEvent"
                    name="searchEvent"
                    placeholder="Search by keyword"
                    autoComplete="on"
                    onChange={({ target: { value }}) => searchDataLayers(
                      value, MOCKDATA, setDataLayers
                    )}
                  />
                </InputGroup>
              </Col>
            </Row>
            <Row>
              <Col>
                <SimpleBar style={{ 
                  maxHeight: '500px', 
                  margin: '5px', 
                  zIndex: '100' 
                }}>
                  <OnDemandTreeView
                    data={dataLayers}
                    setCurrentLayer={setCurrentLayer}
                  />
                </SimpleBar>
              </Col>
            </Row>
          </Col>
          <Col xl={7} className='mx-auto'>
            <Card className='map-card mb-0' style={{ height: 670 }}>
              <BaseMap
                layers={[bitmapLayer]}
                initialViewState={viewState}
                widgets={[]}
                screenControlPosition='top-right'
                navControlPosition='bottom-right'
              />
              {getSlider()}
              {getLegend()}
            </Card>
          </Col>
        </Row>
      </div>
    </div >
  );
}

OnDemandDataLayer.propTypes = {
  t: PropTypes.any,
  setActiveTab: PropTypes.func,
  dataLayerPanels: PropTypes.object,
  searchDataLayers: PropTypes.func
}

export default withTranslation(['common'])(OnDemandDataLayer);
