import React, { useState, useEffect } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Row,
  Col,
  Button,
  Input,
  Card,
  InputGroup,
  InputGroupText,
  Modal,
} from 'reactstrap';
import SimpleBar from 'simplebar-react';

import BaseMap from 'components/BaseMap/BaseMap';
import { TiledRasterLayer } from 'components/BaseMap/TiledRasterLayer';
import { formatDate } from 'utility';

import { DATA_LAYERS_PANELS } from './constants';
import DataLayerInformation from './DataLayerInformation';
import OnDemandTreeView from './OnDemandTreeView';

const OnDemandDataLayer = ({
  t,
  mapRequests,
  onDemandDomainOptions,
  setActiveTab,
  setCurrentLayer,
  dataDomain,
  setDataDomain,
  sortByDate,
  setSortByDate,
  handleResetAOI,
  getSlider,
  getLegend,
  timestamp,
  currentLayer,
  showLegend,
  legendUrl,
  dispatch,
  sliderChangeComplete,
  resetMap,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [searchedMapRequests, setSearchedMapRequests] = useState(null);
  const [bboxLayers, setBboxLayers] = useState([]);

  const [tempLayerData, setTempLayerData] = useState(null);
  const [information, setInformation] = useState(null);

  // places fetched map requests into local state,
  // so that search filtering can then be applied
  useEffect(() => {
    setSearchedMapRequests(mapRequests);
  }, [mapRequests]);

  const handleSearch = ({ target: { value } }) => {
    if (!value) setSearchedMapRequests(mapRequests);
    const searchResult = searchDataTree(mapRequests, value);
    setSearchedMapRequests(searchResult);
  };

  const toggleModal = () => setModalIsOpen(prev => !prev);

  const isTimeseries =
    currentLayer?.urls && Object.keys(currentLayer?.urls).length > 1;

  const searchDataTree = (data, str) => {
    const searchTerm = str.toLowerCase();
    return data.reduce((acc, datum) => {
      if (datum.title.toLowerCase().includes(searchTerm)) {
        return [...acc, datum];
      }

      let children = [];
      if (datum.children) {
        const filteredChildren = searchDataTree(datum.children, searchTerm);
        children = filteredChildren;
      }

      const hasChildren = !!children.length;

      return hasChildren ? [...acc, { ...datum, children }] : acc;
    }, []);
  };

  const getCurrentTimestamp = () => {
    if (isTimeseries) {
      return timestamp ? (
        <div className="timestamp-container">
          <p className="timestamp-display">{formatDate(timestamp)}</p>
        </div>
      ) : null;
    }
  };

  const handleDialogButtonClick = ({ target: { value } }) => {
    setActiveTab(+value);
    toggleModal();
  };

  let layers = [...bboxLayers];
  if (currentLayer?.urls) {
    const data = currentLayer?.urls[timestamp];
    layers.push(
      new TiledRasterLayer({
        data,
        opacity: currentLayer?.opacity,
      }),
    );
    layers.push(tempLayerData);
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
        <div className="d-flex flex-column align-items-center p-5">
          <h2>{t('select-data-type', { ns: 'dataLayers' })}</h2>
          <div className="d-flex flex-nowrap gap-5 my-5">
            <button
              value={DATA_LAYERS_PANELS.fireAndBurnedAreas}
              onClick={handleDialogButtonClick}
              className="data-layers-dialog-btn"
            >
              {t('fireAndBurnedAreas', { ns: 'dataLayers' })}
            </button>
            <button
              value={DATA_LAYERS_PANELS.postEventMonitoring}
              onClick={handleDialogButtonClick}
              className="data-layers-dialog-btn"
            >
              {t('post-event-monitoring', { ns: 'dataLayers' })}
            </button>
            <button
              value={DATA_LAYERS_PANELS.wildfireSimulation}
              onClick={handleDialogButtonClick}
              className="data-layers-dialog-btn"
            >
              {t('wildfireSimulation', { ns: 'dataLayers' })}
            </button>
          </div>
          <button onClick={toggleModal} className="data-layers-dialog-cancel">
            {t('cancel')}
          </button>
        </div>
      </Modal>
      <Row>
        <Col xl={5}>
          <Row xl={12}>
            <Col>
              <div className="d-flex justify-content-end">
                <Button
                  className="request-map btn-orange mb-3"
                  onClick={toggleModal}
                >
                  {t('requestMap', { ns: 'dataLayers' })}
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
                    onChange={e => setSortByDate(e.target.value)}
                    value={sortByDate}
                  >
                    <option value={'-date'}>
                      {t('Sort By')} : {t('Date')} {t('desc')}
                    </option>
                    <option value={'date'}>
                      {t('Sort By')} : {t('Date')} {t('asc')}
                    </option>
                  </Input>
                </Col>
                <Col xl={4}>
                  <Input
                    id="dataDomain"
                    className="btn-sm sort-select-input"
                    name="dataDomain"
                    placeholder="Domain"
                    type="select"
                    onChange={e => setDataDomain(e.target.value)}
                    value={dataDomain}
                  >
                    <option value={''}>
                      {t('domain')}: {t('domain-all')}
                    </option>
                    {onDemandDomainOptions?.map(option => (
                      <option key={option} value={option}>
                        {t('domain')}: {option}
                      </option>
                    )) ?? []}
                  </Input>
                </Col>
              </Row>
            </Col>
            <Col
              xl={2}
              className="d-flex justify-content-end align-items-center"
            >
              <Button color="link" onClick={handleResetAOI} className="p-0">
                {t('default-aoi')}
              </Button>
            </Col>
          </Row>
          <hr />
          <Row className="mb-3">
            <Col xl={12}>
              <InputGroup>
                <InputGroupText className="border-end-0">
                  <i className="fa fa-search" />
                </InputGroupText>
                <Input
                  id="searchEvent"
                  name="searchEvent"
                  placeholder={t('search-by-keyword')}
                  autoComplete="on"
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <SimpleBar
                style={{
                  maxHeight: '500px',
                  margin: '5px',
                  zIndex: '100',
                }}
              >
                <OnDemandTreeView
                  data={searchedMapRequests}
                  setCurrentLayer={setCurrentLayer}
                  t={t}
                  setBboxLayers={setBboxLayers}
                  resetMap={resetMap}
                />
              </SimpleBar>
            </Col>
          </Row>
        </Col>
        <Col xl={7} className="mx-auto">
          <Card className="map-card mb-0" style={{ height: 670 }}>
            {showLegend && !!legendUrl ? (
              <div className="legend-container">
                <div className="legend">
                  <img src={legendUrl} alt="Layer Legend" />
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
                screenControlPosition="top-right"
                navControlPosition="bottom-right"
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
};

OnDemandDataLayer.propTypes = {
  t: PropTypes.any,
  mapRequests: PropTypes.any,
  onDemandDomainOptions: PropTypes.array,
  setActiveTab: PropTypes.func,
  setCurrentLayer: PropTypes.any,
  dataDomain: PropTypes.any,
  setDataDomain: PropTypes.any,
  sortByDate: PropTypes.any,
  setSortByDate: PropTypes.any,
  getSlider: PropTypes.any,
  getLegend: PropTypes.any,
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
};

export default withTranslation(['common'])(OnDemandDataLayer);
