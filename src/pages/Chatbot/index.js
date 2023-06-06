import React, { useEffect, useState } from 'react';

import classnames from 'classnames';
import { useTranslation, withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Container,
} from 'reactstrap';

import { GENERAL } from 'constants/common';
import { configSelector } from 'store/common.slice';
import { userInfoSelector } from 'store/user.slice';

import Comms from './Comms';
import Missions from './Missions';
import People from './People';
import Reports from './Reports';

const ChatbotTab = ({
  selectedTab,
  tabId,
  title,
  iconClass,
  isDisabled = false,
}) => {
  const navigate = useNavigate();

  return (
    <NavItem className={isDisabled ? 'disabled' : ''}>
      <NavLink
        className={classnames({
          active: selectedTab === tabId,
          cursor: 'pointer',
          disabled: isDisabled ? 'disabled' : '',
        })}
        onClick={() => {
          navigate(`/chatbot?tab=${tabId}`);
        }}
      >
        <span className="d-none d-sm-block me-2">
          <i className={`fas ${iconClass}`}></i>
        </span>
        <span className="d-block">{title}</span>
      </NavLink>
    </NavItem>
  );
};

const Chatbot = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const config = useSelector(configSelector);
  const user = useSelector(userInfoSelector);

  const [selectedTab, setSelectedTab] = useState();

  const isProfessionalUser = user.is_professional;
  const pollingFrequency =
    config?.polling_frequency * GENERAL.MILLISEC_TO_SECOND ?? 0;

  useEffect(() => {
    const queryString = location.search;
    const params = new URLSearchParams(queryString);
    const tab = params.get('tab');

    !tab ? setSelectedTab('1') : setSelectedTab(tab);
  }, [location.search]);

  return (
    <div className="page-content">
      <Container fluid="true" className="chatbot p-0">
        <div className="tab-container p-3">
          <Nav tabs className="nav-default nav-tabs-custom nav-justified">
            <ChatbotTab
              selectedTab={selectedTab}
              tabId="1"
              title={t('people', { ns: 'common' })}
              iconClass="fa-user-alt"
            />

            <ChatbotTab
              selectedTab={selectedTab}
              tabId="2"
              title={t('Communications', { ns: 'common' })}
              iconClass="fa-envelope"
            />

            <ChatbotTab
              selectedTab={selectedTab}
              tabId="3"
              title={t('mission', { ns: 'common' })}
              iconClass="fa-checkered"
              isDisabled={!isProfessionalUser}
            />

            <ChatbotTab
              selectedTab={selectedTab}
              tabId="4"
              title={t('Reports', { ns: 'common' })}
              iconClass="fa-file-image"
            />
          </Nav>

          <TabContent activeTab={selectedTab} className="p-3">
            <TabPane tabId="1">
              <People pollingFrequency={pollingFrequency} />
            </TabPane>

            <TabPane tabId="2">
              <Comms pollingFrequency={pollingFrequency} />
            </TabPane>

            <TabPane tabId="3">
              <Missions pollingFrequency={pollingFrequency} />
            </TabPane>

            <TabPane tabId="4">
              <Reports pollingFrequency={pollingFrequency} />
            </TabPane>
          </TabContent>
        </div>
      </Container>
    </div>
  );
};

export default withTranslation(['common'])(Chatbot);
