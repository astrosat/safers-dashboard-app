import React, { useState } from 'react';
import { Nav, Row, Col, NavItem, NavLink, TabPane, TabContent } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import DataLayer from './DataLayer';
import OnDemandDataLayer from './OnDemandDataLayer';
import FireAndBurnedArea from './FireAndBurnedArea';
import WildfireSimulation from './wildfire-simulation';

const dataLayerPanels = {
  DATA_LAYER: 0,
  ON_DEMAND_DATA_LAYER: 1,
  FIRE_AND_BURNED_AREA:2,
  POST_EVENT_MONITORING: 3,
  WILDFIRE_SIMULATION: 4,
}

const DataLayerDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(dataLayerPanels.DATA_LAYER);
  return(
    <div className='page-content'>
      <div className='mx-2 sign-up-aoi-map-bg'>
        <Row>
          <Col xl={5} className='mb-3'>
            <Row>
              <Col xl={4}><h4>{t('Data Layers')}</h4></Col>
              <Col xl={8}>
                <Nav className='d-flex flex-nowrap' pills fill>
                  <NavItem>
                    <NavLink
                      className={{
                        'active': activeTab === dataLayerPanels.DATA_LAYER
                      }}
                      onClick={() => setActiveTab(dataLayerPanels.DATA_LAYER)}
                    >
                      {t('Operational Map Layers')}
                    </NavLink>
                  </NavItem>
                  <NavItem>
                    <NavLink
                      className={{
                        'active': activeTab === dataLayerPanels.ON_DEMAND_DATA_LAYER
                      }}
                      onClick={() => setActiveTab(
                        dataLayerPanels.ON_DEMAND_DATA_LAYER
                      )}
                    >
                      {t('On-Demand Map Layers')}
                    </NavLink>
                  </NavItem>
                </Nav>
              </Col>
            </Row>
          </Col>
          <Col xl={7}/>
        </Row>
        <TabContent activeTab={activeTab}>
          <TabPane tabId={dataLayerPanels.DATA_LAYER}>
            <DataLayer t={t} />
          </TabPane>
          <TabPane tabId={dataLayerPanels.ON_DEMAND_DATA_LAYER}>
            <OnDemandDataLayer
              t={t}
              setActiveTab={setActiveTab} 
              dataLayerPanels={dataLayerPanels}  
            />
          </TabPane>
          <TabPane tabId={dataLayerPanels.FIRE_AND_BURNED_AREA}>
            <FireAndBurnedArea t={t} />
          </TabPane>
          <TabPane tabId={dataLayerPanels.POST_EVENT_MONITORING}>
            <div>Post Event Monitoring</div>
          </TabPane>
          <TabPane tabId={dataLayerPanels.WILDFIRE_SIMULATION}>
            <WildfireSimulation t={t} />
          </TabPane>
        </TabContent>
      </div>
    </div>
  );
};

export default DataLayerDashboard;
