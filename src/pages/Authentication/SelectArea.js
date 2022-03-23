import React from 'react';
import { Row, Col } from 'reactstrap';
import AoiHelper from '../../helpers/aoiHelper';

import logodark from '../../assets/images/background-light-logo.png'
import logolight from '../../assets/images/background-light-logo.png'

const SelectArea = () => {
  return (
    <div className="jumbotron">
      <Row>
        <Col xl={2} className="bg-overlay">
        </Col>
        <Col xl={10}>
          <Row>
            <div className="p-2">
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
            <Row>
              <Col xl={11} md={10} xs={12} className='mx-auto sign-up-aoi-map-bg mb-2.5'>
                <div className='d-flex justify-content-center'>
                  <h5>Choose your area of interest</h5>
                </div>
                <hr />
                <AoiHelper />
              </Col>
            </Row>
          </Row>
        </Col>
      </Row>
    </div>

  );
}

export default SelectArea;
