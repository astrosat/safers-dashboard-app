import React from 'react';

import { Formik } from 'formik';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Input,
  FormGroup,
  Label,
  Row,
  Col,
  Card,
  Form,
} from 'reactstrap';
import wkt from 'wkt';
import * as Yup from 'yup';

import MapInput from 'components/BaseMap/MapInput';
import { getGeneralErrors, getError } from 'helpers/errorHelper';
import { errorSelector } from 'store/authentication.slice';
import { postMapRequest, fetchMapRequests } from 'store/datalayer.slice';
import { getWKTfromFeature } from 'utility';

import MapSection from './Map';

Yup.addMethod(Yup.date, 'max30Days', function (message) {
  return this.test('max30Days', message, (date, { parent }) => {
    const startDate = parent.startDate;

    // if startDate not yet been entered, allow validation to pass
    if (startDate.toString() === 'Invalid Date') {
      return true;
    }

    const rangeCheck = moment(date).isBetween(
      startDate,
      moment(startDate).add(30, 'days'),
      undefined,
      '[]',
    );

    return rangeCheck;
  });
});

const FireAndBurnedArea = ({
  t,
  handleResetAOI,
  backToOnDemandPanel,
  mapInputOnChange,
  isRasterSizeWithinLimits,
}) => {
  const dispatch = useDispatch();
  const error = useSelector(errorSelector);

  const fireAndBurnedAreaSchema = Yup.object().shape({
    dataLayerType: Yup.array().required(t('field-empty-err', { ns: 'common' })),
    requestTitle: Yup.string().required(t('field-empty-err', { ns: 'common' })),
    mapSelection: Yup.array()
      .isValidWKTString(t('field-err-vallid-wkt', { ns: 'dataLayers' }))
      .typeError(t('field-err-vallid-wkt', { ns: 'dataLayers' }))
      .required(t('field-err-vallid-wkt', { ns: 'dataLayers' })),
    isMapAreaValid: Yup.boolean().oneOf(
      [true],
      t('field-err-wkt-large-area', { ns: 'dataLayers' }),
    ),
    isMapAreaValidWKT: Yup.boolean().oneOf(
      [true],
      t('field-err-vallid-wkt', { ns: 'common' }),
    ),
    startDate: Yup.date()
      .typeError(t('field-err-valid-date', { ns: 'common' }))
      .required(t('field-empty-err', { ns: 'common' })),
    endDate: Yup.date()
      .typeError(t('field-err-valid-date', { ns: 'common' }))
      .required(t('field-empty-err', { ns: 'common' }))
      .max30Days(t('field-err-endDate-duration', { ns: 'dataLayers' })),
    frequency: Yup.number()
      .integer(t('field-err-integer'))
      .typeError(t('field-err-number'))
      .min(1, t('field-err-min', { ns: 'common', min: 1 }))
      .optional(),
    resolution: Yup.number()
      .typeError(t('field-err-number'))
      .min(10, t('field-err-min', { min: 10 }))
      .max(60, t('field-err-max', { max: 60 }))
      .optional(t('field-err-between', { min: 10, max: 60 })),
  });

  const onSubmit = formData => {
    const payload = {
      data_types: formData.dataLayerType,
      geometry: getWKTfromFeature(formData.mapSelection),
      title: formData.requestTitle,
      parameters: {
        start: new Date(formData.startDate).toISOString(),
        end: new Date(formData.endDate).toISOString(),
        frequency: formData.frequency || null,
        resolution: formData.resolution || null,
      },
    };

    dispatch(postMapRequest(payload));
    dispatch(fetchMapRequests());
    backToOnDemandPanel();
  };

  // hardcoded for now, this will be replaced with an API call in time
  const layerTypes = [
    { id: 36004, name: 'Impact quantification' },
    { id: 36005, name: 'Fire front and smoke' },
    { id: 36003, name: 'Burned area geospatial image' },
    { id: 36002, name: 'Burned area severity map' },
    { id: 36001, name: 'Burned area delineation map' },
  ];

  return (
    <Row>
      <Col>
        <Row>
          <Formik
            initialValues={{
              dataLayerType: [],
              requestTitle: '',
              mapSelection: [],
              isMapAreaValid: null,
              isMapAreaValidWKT: null,
              startDate: '',
              endDate: '',
              frequency: '',
              resolution: 10,
            }}
            validationSchema={fireAndBurnedAreaSchema}
            onSubmit={onSubmit}
            id="fireAndBurnedAreaForm"
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              isSubmitting,
            }) => (
              <Form
                onSubmit={handleSubmit}
                className="d-flex flex-column justify-content-between"
              >
                <Row>
                  <Col
                    xl={5}
                    className="d-flex flex-column justify-content-between"
                  >
                    <Row>
                      <Row>
                        <Col>
                          <h4>{t('requestMap')}</h4>
                        </Col>
                        <Col className="d-flex justify-content-end align-items-center">
                          <Button
                            color="link"
                            onClick={handleResetAOI}
                            className="p-0"
                          >
                            {t('default-aoi', { ns: 'common' })}
                          </Button>
                        </Col>
                      </Row>
                      <Row>{getGeneralErrors(error)}</Row>
                      <Row>
                        <h5>{t('fireAndBurnedAreas')}</h5>
                      </Row>
                      <Row>
                        <FormGroup className="form-group">
                          <Label for="dataLayerType">
                            {t('dataLayerType')}
                          </Label>
                          <Input
                            name="dataLayerType"
                            id="dataLayerType"
                            type="select"
                            className={errors.dataLayerType ? 'is-invalid' : ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.dataLayerType}
                            multiple
                          >
                            <option disabled value="">
                              {t('selectLayerTypes', { ns: 'dataLayers' })}
                            </option>
                            {layerTypes.map(item => (
                              <option
                                key={`option_${item.name}`}
                                value={item.id}
                              >{`${item.id} - ${item.name}`}</option>
                            ))}
                          </Input>
                          {touched.dataLayerType &&
                            getError('dataLayerType', errors, touched)}
                        </FormGroup>
                      </Row>
                      <Row>
                        <FormGroup className="form-group">
                          <Label for="requestTitle">{t('requestTitle')}</Label>
                          <Input
                            name="requestTitle"
                            id="requestTitle"
                            className={errors.requestTitle ? 'is-invalid' : ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.requestTitle}
                            placeholder="[Type Request Title]"
                          />
                          {touched.requestTitle &&
                            getError('requestTitle', errors, touched, false)}
                        </FormGroup>
                      </Row>
                      <Row>
                        <FormGroup className="form-group">
                          <Label for="mapSelection">{t('mapSelection')}</Label>
                          <MapInput
                            className={errors.mapSelection ? 'is-invalid' : ''}
                            id="mapSelection"
                            name="mapSelection"
                            type="textarea"
                            rows="5"
                            setCoordinates={value => {
                              mapInputOnChange(
                                value,
                                setFieldValue,
                                true,
                                values.resolution,
                              );
                            }}
                            onBlur={handleBlur}
                            coordinates={getWKTfromFeature(values.mapSelection)}
                            placeholder={t('mapSelectionTxtGuide')}
                          />
                          {touched.mapSelection &&
                            getError('mapSelection', errors, touched, false)}
                          {values.isMapAreaValid === false &&
                          values.mapSelection !== ''
                            ? getError(
                                'isMapAreaValid',
                                errors,
                                touched,
                                false,
                                true,
                              )
                            : null}
                          {values.isMapAreaValidWKT === false &&
                          values.mapSelection !== ''
                            ? getError(
                                'isMapAreaValidWKT',
                                errors,
                                touched,
                                false,
                                true,
                              )
                            : null}
                        </FormGroup>
                      </Row>
                      <Row>
                        <FormGroup className="form-group">
                          <Row>
                            <Col>
                              <Label for="startDate">{t('startDate')}</Label>
                              <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                className={errors.startDate ? 'is-invalid' : ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.startDate}
                              />
                              {getError('startDate', errors, touched, false)}
                            </Col>
                            <Col>
                              <Label for="endDate">{t('endDate')}</Label>
                              <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                className={errors.endDate ? 'is-invalid' : ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.endDate}
                              />
                              {touched.endDate &&
                                getError('endDate', errors, touched, false)}
                            </Col>
                          </Row>
                        </FormGroup>
                      </Row>
                      <Row>
                        <FormGroup>
                          <Row className="d-flex align-items-baseline">
                            <Col xl={3}>
                              <Label for="frequency" className="mb-0">
                                {t('frequency')}
                              </Label>
                            </Col>
                            <Col xl={4}>
                              <Input
                                id="frequency"
                                name="frequency"
                                type="num"
                                className={errors.frequency ? 'is-invalid' : ''}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                placeholder="[type here]"
                                value={values.frequency}
                              />
                              {touched.frequency &&
                                getError('frequency', errors, touched, false)}
                            </Col>
                            <Col xl={5} />
                          </Row>
                        </FormGroup>
                      </Row>
                      <Row>
                        <FormGroup>
                          <Row className="d-flex align-items-baseline">
                            <Col xl={3}>
                              <Label for="resolution" className="mb-0">
                                {t('resolution')}
                              </Label>
                            </Col>
                            <Col xl={4}>
                              <Input
                                id="resolution"
                                name="resolution"
                                type="num"
                                placeholder="10"
                                className={
                                  errors.resolution ? 'is-invalid' : ''
                                }
                                onChange={({ target: { value } }) => {
                                  // NB not called if map is used, only if paste/type into field
                                  const parsedValue = parseInt(value);
                                  setFieldValue('resolution', parsedValue);
                                  const features = wkt.parse(
                                    values.mapSelection,
                                  );
                                  const isAreaValid = isRasterSizeWithinLimits(
                                    features,
                                    parsedValue,
                                    true,
                                  );
                                  setFieldValue('isMapAreaValid', isAreaValid);
                                  setFieldValue('isMapAreaValidWKT', true);
                                }}
                                onBlur={handleBlur}
                                value={values.resolution}
                              />
                              {touched.resolution &&
                                getError('resolution', errors, touched, false)}
                            </Col>
                            <Col xl={5} />
                          </Row>
                        </FormGroup>
                      </Row>
                    </Row>
                    <Row>
                      <Row>
                        <Col>
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            color="primary"
                          >
                            {t('request')}
                          </Button>
                          <Button
                            onClick={backToOnDemandPanel}
                            className="btn btn-secondary ms-3"
                            color="secondary"
                          >
                            {t('cancel')}
                          </Button>
                        </Col>
                      </Row>
                    </Row>
                  </Col>
                  <Col xl={7} className="mx-auto">
                    <Card className="map-card mb-0" style={{ height: 670 }}>
                      <MapSection
                        setCoordinates={(features, isAreaValid) => {
                          // called if map is used to draw polygon
                          // we asssume it's valid WKT
                          setFieldValue('mapSelection', features);
                          setFieldValue('isMapAreaValid', isAreaValid);
                          setFieldValue('isMapAreaValidWKT', true);
                        }}
                        coordinates={values.mapSelection}
                        togglePolygonMap={true}
                        handleAreaValidation={feature => {
                          const isAreaValid = isRasterSizeWithinLimits(
                            feature,
                            values.resolution,
                          );
                          return isAreaValid;
                        }}
                        clearMap={() => {
                          setFieldValue('mapSelection', []);
                          setFieldValue('isMapAreaValid', true);
                          setFieldValue('isMapAreaValidWKT', true);
                        }}
                      />
                    </Card>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Row>
      </Col>
    </Row>
  );
};

FireAndBurnedArea.propTypes = {
  t: PropTypes.any,
  handleResetAOI: PropTypes.func,
  backToOnDemandPanel: PropTypes.func,
  mapInputOnChange: PropTypes.func,
  isRasterSizeWithinLimits: PropTypes.func,
};

export default withTranslation(['dataLayers', 'common'])(FireAndBurnedArea);
