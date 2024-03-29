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

const Chatbot = () => {
  const [customActiveTab, setCustomActiveTab] = useState();
  const config = useSelector(configSelector);
  const user = useSelector(userInfoSelector);
  const isProfessionalUser = user.is_professional;
  const pollingFrequency =
    config?.polling_frequency * GENERAL.MILLISEC_TO_SECOND ?? 0;
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryString = location.search;
    const params = new URLSearchParams(queryString);
    const tab = params.get('tab');

    if (!tab) {
      setCustomActiveTab('1');
    } else if (tab && customActiveTab !== tab) {
      setCustomActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const renderContent = tab => {
    if (customActiveTab !== tab) {
      return null;
    }

    switch (tab) {
      case '1':
        return <People pollingFrequency={pollingFrequency} />;
      case '2':
        return <Comms pollingFrequency={pollingFrequency} />;
      case '3':
        return <Missions pollingFrequency={pollingFrequency} />;
      case '4':
        return <Reports pollingFrequency={pollingFrequency} />;
      default:
        throw new Error('Unknown tab');
    }
  };

  return (
    <div className="page-content">
      <Container fluid="true" className="chatbot p-0">
        <div className="tab-container p-3">
          <Nav tabs className="nav-default nav-tabs-custom nav-justified">
            <NavItem>
              <NavLink
                style={{ cursor: 'pointer' }}
                className={classnames({
                  active: customActiveTab === '1',
                })}
                onClick={() => {
                  navigate('/chatbot?tab=1');
                }}
              >
                <span className="d-none d-sm-block me-2">
                  <i className="fas fa-user-alt"></i>
                </span>
                <span className="d-block">{t('people', { ns: 'common' })}</span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: 'pointer' }}
                className={classnames({
                  active: customActiveTab === '2',
                })}
                onClick={() => {
                  navigate('/chatbot?tab=2');
                }}
                data-testid="updateProfilePasswordBtn"
              >
                <span className="d-none d-sm-block me-2">
                  <i className="fas fa-envelope"></i>
                </span>
                <span className="d-block">{t('Communications')}</span>
              </NavLink>
            </NavItem>
            <NavItem className={!isProfessionalUser ? 'disabled' : ''}>
              <NavLink
                style={{ cursor: 'pointer' }}
                className={classnames({
                  active: customActiveTab === '3',
                })}
                disabled={!isProfessionalUser}
                onClick={() => {
                  navigate('/chatbot?tab=3');
                }}
              >
                <span className="d-none d-sm-block me-2">
                  <i className="fas fa-flag-checkered"></i>
                </span>
                <span className="d-block">
                  {t('mission', { ns: 'common' })}
                </span>
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                style={{ cursor: 'pointer' }}
                className={classnames({
                  active: customActiveTab === '4',
                })}
                onClick={() => {
                  navigate('/chatbot?tab=4');
                }}
              >
                <span className="d-none d-sm-block me-2">
                  <i className="fas fa-file-image"></i>
                </span>
                <span className="d-block">
                  {t('Reports', { ns: 'common' })}
                </span>
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={customActiveTab} className="p-3">
            <TabPane tabId="1">{renderContent('1')}</TabPane>
            <TabPane tabId="2">{renderContent('2')}</TabPane>
            <TabPane tabId="3">{renderContent('3')}</TabPane>
            <TabPane tabId="4">{renderContent('4')}</TabPane>
          </TabContent>
        </div>
      </Container>
    </div>
  );
};

export default withTranslation(['common'])(Chatbot);
