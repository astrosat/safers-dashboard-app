import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col } from 'reactstrap';
import TweetComponent from '../../../../components/TweetComponent';

const TwitterContainer = () => {
  const tweets = useSelector(state => state.eventAlerts.tweets);
  
  return (
    <>
      <Col  className='d-flex'>
        <Card className='card-weather' >
          <Row className='mb-2'>
            <span className='weather-text'>Latest Tweets</span>
          </Row>
          <Row>
            {tweets.map((tweet, index) => {
              return( 
                <Col key={index} md={6} lg={4} xs={12}>
                  <TweetComponent tweetID={tweet.tweetID}/>
                </Col>
              )
            })}
          </Row>
        </Card>
      </Col>
    </>     
  );
}

export default TwitterContainer;
