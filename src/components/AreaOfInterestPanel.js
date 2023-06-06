import React, { useEffect, useState } from 'react';

import _ from 'lodash';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Row, Col, FormGroup, Label } from 'reactstrap';
import toastr from 'toastr';

import { getPolygonLayer } from 'helpers/mapHelper';
import { aoisSelector } from 'store/common.slice';
import {
  setUserDefaultAoi,
  resetSetAoiSuccessMessage,
  defaultAoiSelector,
  userInfoSelector,
  setAoiSuccessMessageSelector,
} from 'store/user.slice';

import BaseMap from './BaseMap/BaseMap';

const Aoi = ({ aoi, selectAoi, selectedAoi }) => {
  const selectedAoiFeature = selectedAoi.features[0];
  const aoiFeature = aoi.features[0];
  const name = aoiFeature.properties.name;

  return (
    <FormGroup className="form-group mb-2" check>
      <Label check id={`selectAoi-${name}`}>
        <Input
          id={`selectAoi-${name}`}
          name="aoi-selection"
          type="radio"
          onChange={selectAoi}
          checked={
            aoiFeature.properties.id === selectedAoiFeature.properties.id
          }
          value={aoiFeature.properties.id}
        />
        {aoiFeature.properties.country === aoiFeature.properties.name
          ? aoiFeature.properties.country
          : `${aoiFeature.properties.country} - ${aoiFeature.properties.name}`}
      </Label>
    </FormGroup>
  );
};

const AreaOfInterestPanel = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const user = useSelector(userInfoSelector);
  const allAois = useSelector(aoisSelector);
  const aoiSetSuccess = useSelector(setAoiSuccessMessageSelector);
  const defaultAoi = useSelector(defaultAoiSelector);

  const [selectedAoi, setSelectedAoi] = useState(defaultAoi);
  const [polygonLayer, setPolygonLayer] = useState(getPolygonLayer(defaultAoi));

  useEffect(() => {
    if (aoiSetSuccess) {
      toastr.success(t('save-aoi-success-msg', { ns: 'common' }), '');
      dispatch(resetSetAoiSuccessMessage());
    }
  }, [aoiSetSuccess, dispatch, t]);

  const handleSubmit = () =>
    dispatch(
      setUserDefaultAoi({
        ...user,
        default_aoi: selectedAoi,
      }),
    );

  const setMap = defaultAoi => {
    setSelectedAoi(defaultAoi);
    setPolygonLayer(getPolygonLayer(defaultAoi));
  };

  const selectAoi = e => {
    const aoiID = e.target.value;
    const objAoi = _.find(allAois, {
      features: [{ properties: { id: parseInt(aoiID) } }],
    });
    setMap(objAoi);
    // };

    const matchingAoi = allAois.find(
      aoi => aoi.features[0].properties.id === parseInt(aoiID),
    );

    setSelectedAoi(matchingAoi);
    setPolygonLayer(getPolygonLayer(matchingAoi));
  };

  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="aoiGrid">
          {allAois.map(aoi => (
            <Aoi
              key={aoi.features[0].properties.name}
              aoi={aoi}
              selectAoi={selectAoi}
              selectedAoi={selectedAoi}
            />
          ))}
        </div>
      </div>

      <Row>
        <Col xl={8} md={10} xs={10} className="mx-auto">
          <Row>
            <div style={{ height: 350 }} className="mb-5">
              <BaseMap layers={[polygonLayer]} />
            </div>
          </Row>

          <Row>
            <div className="center-sign-in">
              <Button
                className="my-4 sign-in-btn"
                color="primary"
                onClick={handleSubmit}
              >
                {t('save-aoi', { ns: 'common' })}
              </Button>
            </div>
          </Row>
        </Col>
      </Row>
    </>
  );
};

AreaOfInterestPanel.propTypes = {
  t: PropTypes.any,
};

export default AreaOfInterestPanel;
