import React from 'react';

import { Container } from 'reactstrap';

import AOIBar from './Components/AOIBar';
import NotificationsBar from './Components/Notifications';
import PhotoBar from './Components/PhotoBar';
import ReportBar from './Components/ReportBar';

const NewDashboard = () => (
  <div className="page-content">
    <Container fluid="true" className="sign-up-aoi-map-bg">
      <NotificationsBar />
      <AOIBar />
      <PhotoBar />
      <ReportBar />
    </Container>
  </div>
);

export default NewDashboard;
