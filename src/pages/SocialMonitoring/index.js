import React, { useCallback, useEffect, useState } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, CardHeader, CardBody, CardFooter } from 'reactstrap';

import iconAtlas from 'assets/images/location-icon-atlas.png';
import BaseMap from 'components/BaseMap/BaseMap';
import iconMapping from 'constants/location-icon-mapping.json';
import { dateRangeSelector } from 'store/common.slice';
import { fetchStats, fetchTweets, statsSelector } from 'store/dashboard.slice';
import { defaultAoiSelector } from 'store/user.slice';
import { formatNumber } from 'utility';

import IconClusterLayer from './IconClusterLayer';
import TwitterContainer from './TwitterContainer';

//i18n

const MOCK_DATA =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/icon/meteorites.json'; //using this mock data until the tweets API ready with coordinates.

const SocialMonitoring = ({ t }) => {
  const defaultAoi = useSelector(defaultAoiSelector);
  const stats = useSelector(statsSelector);
  const dateRange = useSelector(dateRangeSelector);

  const tweetsTrend = 23; //hard coded text until API available
  const socialStats = MOCK_DATA;
  const [iconLayer, setIconLayer] = useState(undefined);
  const dispatch = useDispatch();

  const getSearchData = useCallback(() => {
    const params = {};
    if (dateRange) {
      params.startDate = dateRange[0];
      params.endDate = dateRange[1];
    }
    if (defaultAoi) {
      params.aoi = defaultAoi;
    }
    dispatch(fetchStats(params));
    dispatch(fetchTweets(params));
  }, [dateRange, defaultAoi, dispatch]);

  useEffect(() => {
    getSearchData();
    setIconLayer(getIconLayer(socialStats));
  }, [dateRange, defaultAoi, getSearchData, socialStats]);

  const getIconLayer = data => {
    return new IconClusterLayer({
      id: 'icon-cluster',
      sizeScale: 40,
      data,
      pickable: true,
      getPosition: d => d.coordinates,
      iconAtlas,
      iconMapping,
    });
  };

  return (
    <div className="page-content">
      <div className="mx-2 sign-up-aoi-map-bg">
        <Row className="mb-3">
          <Col xl={12}>
            <p className="align-self-baseline alert-title">
              {t('Social Monitor')}
            </p>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col xl={3} md={6} sm={6}>
            <Card className="tweets-card px-2 pb-3">
              <CardHeader>{t('Total Tweets')}</CardHeader>
              <CardBody className="pb-0">
                <span className="float-start total-tweets">
                  {stats ? formatNumber(stats.socialEngagement) : 'N/A'}
                </span>
              </CardBody>
              <CardFooter className="py-0">
                <span className="float-end tweets-trend">{`${
                  tweetsTrend > 0 ? '+' : '-'
                }${tweetsTrend}%`}</span>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row className="mb-3 px-3">
          <Card className="map-card mb-0" style={{ height: 670 }}>
            <BaseMap
              layers={[iconLayer]}
              screenControlPosition="top-right"
              navControlPosition="bottom-right"
            />
          </Card>
        </Row>
        <Row>
          <TwitterContainer dateRange={dateRange} />
        </Row>
      </div>
    </div>
  );
};

SocialMonitoring.propTypes = {
  t: PropTypes.func,
};

export default withTranslation(['socialMonitor'])(SocialMonitoring);
