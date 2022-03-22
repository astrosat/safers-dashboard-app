import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Nav, NavItem, NavLink, TabContent, TabPane, Container, Row, Col } from 'reactstrap';
import OAuth2 from './OAuth2';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

import logodark from '../../assets/images/background-light-logo.png'
import logolight from '../../assets/images/background-light-logo.png'

const Authentication = () => {
  const DEFAULT_PAGE = 'sign-in';
  const { currentPage } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentPage) {
      navigate(`/auth/${DEFAULT_PAGE}`);
    }
  }, []);

  const toggleTab = tab => {
    if (currentPage !== tab) {
      navigate(`/auth/${tab}`);
    }
  }
  const getMarkup = (currentPage) => {
    switch (currentPage) {
    case 'forgot-password':
      return <ForgotPassword />;
    case 'password':
      return <ResetPassword />;
    default:
      return (       
        <>
          <div className='tab-container'>
            <Nav tabs className='nav-tabs-custom'>
              <NavItem>
                <NavLink className={currentPage == 'sign-in' ? 'active' : ''} onClick={() => toggleTab('sign-in')}>
                SIGN IN
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink className={currentPage == 'sign-up' ? 'active' : ''} onClick={() => toggleTab('sign-up')}>
                SIGN UP
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={currentPage}>
              <TabPane title='SIGN IN' tabId="sign-in"><SignIn /></TabPane>
              <TabPane title='SIGN UP' tabId="sign-up"><SignUp /></TabPane>
            </TabContent>
          </div>
          <div >
            <OAuth2/>
          </div>
        </>         
      );
    }
  }

  return (
    <div>
      <Container fluid className="p-0" data-test="containerComponent">
        <Row className="g-0">
          <Col xl={7} className="bg-overlay">
            <p data-test="overlay-text"> Structured Approaches for<br></br>
                  Forest fire Emergencies<br></br> in Resilient Societies</p>
    
          </Col>
          <Col xl={5}>
            <div className="auth-full-page-content">
              <div className="w-100">
                <div className="mb-4 mb-md-5">
                  <div className="d-block auth-logo">
                    <img
                      src={logodark}
                      alt=""
                      
                      className="auth-logo-dark"
                    />
                    <img
                      src={logolight}
                      alt=""
                      
                      className="auth-logo-light"
                    />
                  </div>
                </div>
                {getMarkup(currentPage)}
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Authentication;
