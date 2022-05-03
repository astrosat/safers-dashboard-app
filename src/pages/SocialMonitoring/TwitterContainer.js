import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Card, Row, Col } from 'reactstrap';
import TweetComponent from '../../components/TweetComponent';
import PaginationWrapper from '../../components/Pagination';

const TwitterContainer = () => {
  const tweets = useSelector(state => state.dashboard.tweets);
  const [pageData, setPageData] = useState([]);

  return (
    <>
      <Col  className='d-flex'>
        <Card className='card-weather' >
          <Row className='mb-2'>
            <span className='weather-text'>Latest Tweets</span>
          </Row>
          <Row>
            {pageData.map((tweet, index) => {
              return( 
                <Col key={index} md={6} lg={4} xs={12}>
                  <TweetComponent tweetID={tweet.tweetID} />
                </Col>
              )
            })}
          </Row>
          <Row>
            <Col className='pt-3 text-center'>
              <PaginationWrapper pageSize={9} list={tweets} setPageData={setPageData} />
            </Col>
          </Row>
        </Card>
      </Col>
    </>     
  );
}

export default TwitterContainer;