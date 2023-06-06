import React, { useState } from 'react';

import PropTypes from 'prop-types';
import Lightbox from 'react-image-lightbox';
import { Card, Modal } from 'reactstrap';

const MEDIA_TYPE = {
  VIDEO: 'Video',
  IMAGE: 'Image',
};

const MediaComponent = props => {
  const [isFits, setIsFits] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const expandMedia = () => {
    setIsOpen(!isOpen);
    setIsFits(!isFits);
  };

  return (
    <>
      {isFits && props.media.type !== MEDIA_TYPE.VIDEO ? (
        <Lightbox
          mainSrc={props.media.url}
          enableZoom={true}
          imageCaption={
            <div className="position-fixed top-0 start-0 m-2">
              <h5 className="mb-1">{props.media.time}</h5>
              <h4>{props.media.title}</h4>
            </div>
          }
          onCloseRequest={() => {
            setIsFits(!isFits);
          }}
        />
      ) : null}
      <Card className="w-100">
        <div className="position-absolute top-0 start-0 m-2">
          <h6 className="mb-1">{props.media.time}</h6>
          <h5>{props.media.title}</h5>
        </div>
        {props.media.type === MEDIA_TYPE.VIDEO ? (
          <video className="video-thumbnail" onClick={expandMedia}>
            <source
              src={props.media.url}
              type={props.media.format || 'video/mp4'}
            />
          </video>
        ) : (
          <img
            alt=""
            src={props.media.url}
            width="100%"
            height="100%"
            onClick={expandMedia}
            style={{ cursor: 'pointer' }}
          />
        )}
        <div className="position-absolute bottom-0 end-0 m-2">
          {props.media.type === MEDIA_TYPE.IMAGE ? (
            <i className="fa fa-eye fa-2x text-danger"></i>
          ) : (
            <i className="fas fa-play-circle fa-2x text-danger"></i>
          )}
        </div>
      </Card>
      {props.media.type === MEDIA_TYPE.VIDEO && (
        <Modal
          centered
          isOpen={isOpen}
          toggle={() => {
            setIsOpen(!isOpen);
            setIsFits(!isFits);
          }}
          id="staticBackdrop"
        >
          <video height={560} controls>
            <source
              src={props.media.url}
              type={props.media.format || 'video/mp4'}
            />
          </video>
        </Modal>
      )}
    </>
  );
};

MediaComponent.propTypes = {
  media: PropTypes.object,
};

export default MediaComponent;
