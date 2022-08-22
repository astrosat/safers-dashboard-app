import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, CardHeader, CardBody, CardFooter } from 'reactstrap';
import { FlyToInterpolator } from 'deck.gl';

import BaseMap from '../../components/BaseMap/BaseMap';
import TwitterContainer from './TwitterContainer';
import { getStats, getTweets, } from '../../store/appAction';
import { formatNumber } from '../../store/utility';
// import IconClusterLayer from './IconClusterLayer';
// import iconMapping from '../../constants/location-icon-mapping.json';
// import iconAtlas from '../../assets/images/location-icon-atlas.png';
import { getIconLayer } from '../../helpers/mapHelper';

//i18n
import { withTranslation } from 'react-i18next'

const MOCK_DATA =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/icon/meteorites.json';//using this mock data until the tweets API ready with coordinates.

const SocialMonitoring = ({t}) => {
  const defaultAoi = useSelector(state => state.user.defaultAoi);
  const stats = useSelector(state => state.dashboard.stats);
  const dateRange = useSelector(state => state.common.dateRange)

  const tweetsTrend = 23;//hard coded text until API available
  const socialStats = MOCK_DATA;
  const [iconLayer, setIconLayer] = useState(undefined);
  const [viewState, setViewState] = useState(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!viewState) {
      setViewState(getViewState(defaultAoi.features[0].properties.midPoint, defaultAoi.features[0].properties.zoomLevel));
    }
  }, []);

  useEffect(() => {
    getSearchData();
    setIconLayer(getIconLayer(socialStats))
  }, [dateRange, defaultAoi]);

  const getSearchData = () => {
    const params = {};
    if (dateRange) {
      params.startDate = dateRange[0]
      params.endDate = dateRange[1]
    }
    if (defaultAoi) {
      params.aoi = defaultAoi
    }
    dispatch(getStats(params))
    dispatch(getTweets(params))
  }

  const getViewState = (midPoint, zoomLevel = 4) => {
    return {
      longitude: midPoint[0],
      latitude: midPoint[1],
      zoom: zoomLevel,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator()
    };
  }

  // const getIconLayer = (data) => {
  //   return (new IconClusterLayer({
  //     id: 'icon-cluster',
  //     sizeScale: 40,
  //     data,
  //     pickable: true,
  //     getPosition: d => d.coordinates,
  //     iconAtlas,
  //     iconMapping,
  //   }))
  // }

  return (
    <div className='page-content'>
      <div className='mx-2 sign-up-aoi-map-bg'>
        <Row className='mb-3'>
          <Col xl={12}>
            <p className='align-self-baseline alert-title'>{t('Social Monitor')}</p>
          </Col>
        </Row>
        <Row className='mb-3'>
          <Col xl={3} md={6} sm={6}>
            <Card className='tweets-card px-2 pb-3'>
              <CardHeader>
                {t('Total Tweets')}
              </CardHeader>
              <CardBody className='pb-0'>
                <span className='float-start total-tweets'>{stats ? formatNumber(stats.socialEngagement) : 'N/A'}</span>
              </CardBody>
              <CardFooter className='py-0'>
                <span className='float-end tweets-trend'>{`${tweetsTrend > 0 ? '+' : '-'}${tweetsTrend}%`}</span>
              </CardFooter>
            </Card>
          </Col>
        </Row>
        <Row className='mb-3 px-3'>
          <Card className='map-card mb-0' style={{ height: 670 }}>
            <BaseMap
              layers={[iconLayer]}
              initialViewState={viewState}
              widgets={[/*search button or any widget*/]}
              screenControlPosition='top-right'
              navControlPosition='bottom-right'
            />
          </Card>
        </Row>
        <Row>
          <TwitterContainer dateRange={dateRange} />
        </Row>
      </div>
    </div >
  );
}

SocialMonitoring.propTypes = {
  t: PropTypes.func
}

export default withTranslation(['socialMonitor'])(SocialMonitoring);
