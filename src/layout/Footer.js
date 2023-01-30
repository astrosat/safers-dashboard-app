import React from 'react';

import { Container, Row, Col } from 'reactstrap';

const Footer = () => {
  return (
    <React.Fragment>
      <footer className="footer">
        <Container fluid>
          <Row>
            <Col md={6}>{new Date().getFullYear()} © SAFERS.</Col>
            <Col md={6}></Col>
          </Row>
        </Container>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
