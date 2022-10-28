import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Input, Card, InputGroup, InputGroupText, Modal } from 'reactstrap';
import { BitmapLayer } from 'deck.gl';
import BaseMap from '../../components/BaseMap/BaseMap';

import OnDemandTreeView from './OnDemandTreeView';
import { formatDate } from '../../store/utility';
import { withTranslation } from 'react-i18next'
import SimpleBar from 'simplebar-react';
import { DATA_LAYERS_PANELS } from './constants';
import DataLayerInformation from './DataLayerInformation';

const OnDemandDataLayer = ({ 
  t,
  mapRequests,
  onDemandSourceOptions,
  onDemandDomainOptions,
  setActiveTab,
  setCurrentLayer,
  layerSource,
  setLayerSource,
  dataDomain,
  setDataDomain,
  sortByDate,
  setSortByDate,
  handleResetAOI, 
  getSlider,
  getLegend,
  bitmapLayer,
  searchDataTree,
  setViewState,
  viewState,
  timestamp,
  currentLayer,
  showLegend,
  legendUrl,
  dispatch,
  sliderChangeComplete,
  resetMap,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [searchedMapRequests, setSearchedMapRequests] = useState(null);
  const [bboxLayers, setBboxLayers] = useState([])

  const [tempLayerData, setTempLayerData] = useState(null);
  const [information, setInformation] = useState(null);

  // places fetched map requests into local state, 
  // so that search filtering can then be applied
  useEffect(() => {
    setSearchedMapRequests(mapRequests)
  }, [mapRequests]);

  const handleSearch = ({ target: { value } }) => {
    if (!value) setSearchedMapRequests(mapRequests);
    const searchResult = searchDataTree(mapRequests, value)
    setSearchedMapRequests(searchResult);
  };

  const toggleModal = () => setModalIsOpen(prev => !prev);

  const isTimeseries = currentLayer?.urls && Object.keys(currentLayer?.urls).length > 1

  const getCurrentTimestamp = () => {
    if (isTimeseries) {
      return (
        timestamp ? (
          <div className='timestamp-container'>
            <p className='timestamp-display'>
              {formatDate(timestamp)}
            </p>
          </div>
        ) : null
      )
    }
  }

  const handleDialogButtonClick = ({ target: { value } }) => {
    setActiveTab(+value);
    toggleModal();
  } 

  const handleViewStateChange = useCallback(
    // eslint-disable-next-line no-unused-vars
    ({ viewState: { width, height, ...rest } }) => {
      setViewState(rest);
    },
    [setViewState],
  );
    
  let layers = [...bboxLayers];
  if (bitmapLayer) {
    layers.push(new BitmapLayer(bitmapLayer))
    layers.push(tempLayerData)
  }

  return (
    <>
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
              value={DATA_LAYERS_PANELS.fireAndBurnedAreas} 
              onClick={handleDialogButtonClick}
              className='data-layers-dialog-btn'
            >
              {t('Fire and Burned Area')}
            </button>
            <button 
              value={DATA_LAYERS_PANELS.postEventMonitoring} 
              onClick={handleDialogButtonClick}
              className='data-layers-dialog-btn'
            >
              {t('Post Event Monitoring')}
            </button>
            <button
              value={DATA_LAYERS_PANELS.wildfireSimulation} 
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
                  className="request-map btn-orange mb-3" 
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
                    <option value={''} >Source: All</option>
                    {onDemandSourceOptions?.map((option) => (
                      <option key={option} value={option}>
                          Source: {option}
                      </option>
                    )) ?? []}
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
                    <option value={''} >Domain : All</option>
                    {onDemandDomainOptions?.map((option) => (
                      <option key={option} value={option}>
                          Domain: {option}
                      </option>
                    )) ?? []}
                  </Input>
                </Col>
              </Row>
            </Col>
            <Col xl={2} className="d-flex justify-content-end align-items-center">
              <Button color='link'
                onClick={handleResetAOI} className='p-0'>
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
                  onChange={handleSearch}
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
                  data={searchedMapRequests}
                  setCurrentLayer={setCurrentLayer}
                  t={t}
                  setViewState={setViewState}
                  viewState={viewState}
                  setBboxLayers={setBboxLayers}
                  resetMap={resetMap}
                />
              </SimpleBar>
            </Col>
          </Row>
        </Col>
        <Col xl={7} className='mx-auto'>
          <Card className='map-card mb-0' style={{ height: 670 }}>
            {showLegend && !!legendUrl ? (
              <div className='legend-container'>
                <div className='legend'>
                  <img src={legendUrl} />
                </div>
              </div>
            ) : null}
            <DataLayerInformation   
              currentLayer={currentLayer}
              tempLayerData={tempLayerData}
              setTempLayerData={setTempLayerData}
              setInformation={setInformation}
              dispatch={dispatch}
              menuId={'OnDemandDataLayerMapMenu'}
            >
              <BaseMap
                layers={layers}
                initialViewState={viewState}
                onViewStateChange={handleViewStateChange}
                widgets={[]}
                screenControlPosition='top-right'
                navControlPosition='bottom-right'
              />
            </DataLayerInformation>
            {getSlider()}
            {getLegend()}
            {sliderChangeComplete && getCurrentTimestamp()}
          </Card>
        </Col>
      </Row>
      {information}
    </>
  );
}

OnDemandDataLayer.propTypes = {
  t: PropTypes.any,
  mapRequests: PropTypes.any,
  onDemandSourceOptions: PropTypes.array,
  onDemandDomainOptions: PropTypes.array,
  setActiveTab: PropTypes.func,
  setCurrentLayer: PropTypes.any,
  layerSource: PropTypes.any,
  setLayerSource: PropTypes.any,
  dataDomain: PropTypes.any,
  setDataDomain: PropTypes.any,
  sortByDate: PropTypes.any,
  setSortByDate: PropTypes.any,
  getSlider: PropTypes.any,
  getLegend: PropTypes.any,
  bitmapLayer: PropTypes.any,
  setViewState: PropTypes.func,
  viewState: PropTypes.any,
  timestamp: PropTypes.string,
  searchDataTree: PropTypes.func,
  handleResetAOI: PropTypes.any,
  featureInfoData: PropTypes.any,
  currentLayer: PropTypes.any,
  showLegend: PropTypes.bool,
  legendUrl: PropTypes.string,
  dispatch: PropTypes.any,
  sliderChangeComplete: PropTypes.bool,
  resetMap: PropTypes.func,
}

export default withTranslation(['common'])(OnDemandDataLayer);
