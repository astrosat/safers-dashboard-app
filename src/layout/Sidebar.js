import React from 'react';

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import logoPng from 'assets/images/background-light-logo@3x.png';
import logo from 'assets/images/fire-white.png';

import SidebarContent from './SidebarContent';

const Sidebar = ({ type }) => (
  <React.Fragment>
    <div className="vertical-menu">
      <div className="navbar-brand-box">
        <Link to="/" className="logo logo-light" aria-label="logo">
          <span className="logo-sm">
            <img src={logo} alt="Small logo" height="35" />
          </span>
          <span className="logo-lg">
            <img src={logoPng} alt="Large logo" height="60" />
          </span>
        </Link>
      </div>
      <div data-simplebar className="h-100">
        {type !== 'condensed' ? <SidebarContent /> : <SidebarContent />}
      </div>
      <div className="sidebar-background"></div>
    </div>
  </React.Fragment>
);

Sidebar.propTypes = {
  type: PropTypes.string,
};

export default Sidebar;
