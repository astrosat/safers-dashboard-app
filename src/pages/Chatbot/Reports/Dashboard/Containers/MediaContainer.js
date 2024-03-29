import React, { useState } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col } from 'reactstrap';

import MediaComponent from 'components/MediaComponent';
import PaginationWrapper from 'components/Pagination';

const MediaContainer = ({ reportDetail }) => {
  const { t } = useTranslation();

  const [pageData, setPageData] = useState([]);

  if (!reportDetail) return null;

  return (
    <Row role="in-situ-reports-media">
      <Col md={12} className="d-flex mt-3">
        <Card className="card-weather">
          <Row className="mb-2">
            <span className="weather-text">
              {t('Media Files Attached', { ns: 'reports' })}
            </span>
          </Row>
          <Row>
            {pageData.map(media => {
              return (
                <Col
                  key={media}
                  md={3}
                  sm={6}
                  xs={12}
                  className="d-flex dashboard-image justify-content-center"
                >
                  <MediaComponent media={media} />
                </Col>
              );
            })}
          </Row>
          <Row className="text-center">
            <PaginationWrapper
              pageSize={8}
              list={reportDetail.media}
              setPageData={setPageData}
            />
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

MediaContainer.propTypes = {
  reportDetail: PropTypes.object,
};

export default MediaContainer;
