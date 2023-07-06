import React, { useEffect, useState } from 'react';

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
} from 'reactstrap';
import SimpleBar from 'simplebar-react';

import BaseMap from 'components/BaseMap/BaseMap';
import { TiledRasterLayer } from 'components/BaseMap/TiledRasterLayer';
import JsonFormatter from 'components/JsonFormatter';
import { resetMetaData } from 'store/datalayer.slice';
import { formatDate } from 'utility';

import DataLayerInformation from './DataLayerInformation';
import TreeView from './TreeView';

import 'react-rangeslider/lib/index.css';

const DataLayer = ({
  t,
  metaData,
  isMetaDataLoading,
  operationalDomainOptions,
  operationalMapLayers,
  dataDomain,
  setDataDomain,
  sortByDate,
  setSortByDate,
  handleResetAOI,
  currentLayer,
  setCurrentLayer,
  getSlider,
  getLegend,
  timestamp,
  showLegend,
  legendUrl,
  dispatch,
  sliderChangeComplete,
  resetMap,
}) => {
  const [searchedDataLayers, setSearchedDataLayers] = useState(null);

  const [tempLayerData, setTempLayerData] = useState(null);
  const [information, setInformation] = useState(null);

  // places global data layers into local state,
  // so that search filtering can then be applied
  useEffect(() => {
    setSearchedDataLayers(operationalMapLayers);
  }, [operationalMapLayers]);

  const searchDataTree = (data, str) => {
    const searchTerm = str.toLowerCase();
    return data.reduce((acc, datum) => {
      if (datum.text.toLowerCase().includes(searchTerm)) {
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

  const handleSearch = ({ target: { value } }) => {
    if (!value) setSearchedDataLayers(operationalMapLayers);
    const searchResult = searchDataTree(operationalMapLayers, value);
    setSearchedDataLayers(searchResult);
  };

  const getCurrentTimestamp = () =>
    timestamp ? (
      <div className="timestamp-container">
        <p className="timestamp-display">{formatDate(timestamp)}</p>
      </div>
    ) : null;

  const switchRHPanel = () => {
    if (isMetaDataLoading || metaData) {
      return (
        <Card color="dark default-panel">
          <h4 className="ps-3 pt-3 mb-2">
            Meta Info:{' '}
            <i
              className="meta-close"
              onClick={() => {
                dispatch(resetMetaData());
              }}
            >
              x
            </i>
          </h4>
          {!metaData || isMetaDataLoading ? (
            <p className="p-3">{t('Loadng')}...</p>
          ) : (
            <SimpleBar style={{ height: 670 }}>
              <JsonFormatter data={metaData} />
            </SimpleBar>
          )}
        </Card>
      );
    }

    const data = currentLayer?.urls[timestamp];

    const layers = [
      new TiledRasterLayer({
        data,
        opacity: currentLayer?.opacity,
      }),
    ];

    return (
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
          menuId={'DataLayerMapMenu'}
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
    );
  };

  return (
    <>
      <Row>
        <Col xl={5}>
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
                    {operationalDomainOptions?.map(option => (
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
                <TreeView
                  data={searchedDataLayers}
                  setCurrentLayer={setCurrentLayer}
                  resetMap={resetMap}
                />
              </SimpleBar>
            </Col>
          </Row>
        </Col>
        <Col xl={7} className="mx-auto">
          {switchRHPanel()}
        </Col>
      </Row>
      {information}
    </>
  );
};

DataLayer.propTypes = {
  t: PropTypes.any,
  metaData: PropTypes.object,
  isMetaDataLoading: PropTypes.bool,
  operationalDomainOptions: PropTypes.array,
  operationalMapLayers: PropTypes.any,
  dataDomain: PropTypes.any,
  setDataDomain: PropTypes.any,
  sortByDate: PropTypes.any,
  setSortByDate: PropTypes.any,
  handleResetAOI: PropTypes.any,
  currentLayer: PropTypes.any,
  setCurrentLayer: PropTypes.any,
  getSlider: PropTypes.any,
  getLegend: PropTypes.any,
  viewState: PropTypes.any,
  timestamp: PropTypes.string,
  showLegend: PropTypes.bool,
  legendUrl: PropTypes.string,
  searchDataTree: PropTypes.func,
  dispatch: PropTypes.func,
  sliderChangeComplete: PropTypes.bool,
  resetMap: PropTypes.func,
};

export default withTranslation(['common'])(DataLayer);
