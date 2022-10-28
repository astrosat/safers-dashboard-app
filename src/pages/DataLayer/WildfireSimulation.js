import React, { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, FormGroup, Label, Row, Col, Card, Form } from 'reactstrap';
import {
  area as getFeatureArea
} from '@turf/turf';
import { FieldArray, Formik } from 'formik';
import MapSection from './Map';
import * as Yup from 'yup'
import { getGeneralErrors, getError } from '../../helpers/errorHelper';
import { withTranslation } from 'react-i18next'
import {
  postMapRequest,
  getAllMapRequests
} from '../../store/appAction';
import 'react-rangeslider/lib/index.css'
import moment from 'moment';
import MapInput from '../../components/BaseMap/MapInput';
import { MAP } from '../../constants/common';

// increase the bbox used to view Wildfire layers by 20 kms
const DEFAULT_WILDFIRE_GEOMETRY_BUFFER = 20

const TIME_LIMIT = 72;

const TABLE_HEADERS = [
  'timeHours',
  'windDirection',
  'windSpeed',
  'fuelMoistureContent'
];

const PROBABILITY_INFO = 'PROPAGATOR output for each time step is a probability (from 0 to 1) field that expresses for each pixel the probability of the fire to reach that specific point in the given time step. In order to derive a contour, we can select to show the contour related to the 0.5, 0.75 and 0.9 of the probability.  For example, the 50% - 0.5 probability contour encapsulates all the pixels who have more than 50% of probability to be reached by fire at the given simulation time.'

const PROBABILITY_RANGES = [
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '90%', value: 0.9 }
];

Yup.addMethod(Yup.number, 'uniqueTimeOffset', function (message) {
  return this.test(
    'uniqueTimeOffset',
    message,
    (timeOffset, { from }) => {
      // 'from' is an array of parent objects moving from closest
      // to furthest relatives. [0] is the immediate parent object,
      // while [1] is the higher parent array of all of those objects.
      const allTimeOffsets = from[1].value.boundaryConditions.map(d => +d.timeOffset);

      const matchCount = allTimeOffsets.filter(d => d === timeOffset).length;
      return matchCount <= 1;
    }
  )
})

const WildfireSimulationSchema = Yup.object().shape({
  simulationTitle: Yup.string()
    .required('This field cannot be empty'),
  simulationDescription: Yup.string()
    .required('This field cannot be empty'),
  simulationTimeLimit: Yup.number()
    .typeError('This field must be a number')
    .min(1, `Simulation time limit must be between 1 and ${TIME_LIMIT} hours`)
    .max(TIME_LIMIT, `Simulation time limit must be between 1 and ${TIME_LIMIT} hours`)
    .required('This field cannot be empty'),
  probabilityRange: Yup.string()
    .required('This field cannot be empty'),
  mapSelection: Yup.string()
    .typeError('Area must be valid Well-Known Text')
    .required('Should contain a valid Well-Known Text'),
  isMapAreaValid: Yup.boolean()
    .oneOf([true], `Area must be no greater than ${MAP.MAX_GEOMETRY_AREA.label}`),
  isMapAreaValidWKT: Yup.boolean()
    .oneOf([true], 'Geometry needs to be valid WKT'),
  ignitionDateTime: Yup.date()
    .typeError('This field must be a valid date selection')
    .required('This field cannot be empty'),
  boundaryConditions: Yup
    .array()
    .of(
      Yup.object().shape({
        timeOffset: Yup.number()
          .typeError('This field must be a number')
          .min(0, `Time offset must be between 1 and ${TIME_LIMIT} hours`)
          .max(TIME_LIMIT, `Time offset must be between 1 and ${TIME_LIMIT} hours`)
          .uniqueTimeOffset('Time offset values must be unique')
          .required('This field cannot be empty'),
        windDirection: Yup.number('This field must be a number')
          .typeError('This field must be a number')
          .min(0, 'Wind direction must be between 0 and 360 degrees')
          .max(360, 'Wind direction must be between 0 and 360 degrees')
          .required('This field cannot be empty'),
        windSpeed: Yup.number('This field must be a number')
          .typeError('This field must be a number')
          .min(0, 'Wind speed must be between 0 and 300 km/h')
          .max(300, 'Wind speed must be between 0 and 300 km/h')
          .required('This field cannot be empty'),
        fuelMoistureContent: Yup.number('This field must be a number')
          .typeError('This field must be a number')
          .min(0, 'Fuel moisture must be between 0% and 100%')
          .max(100, 'Fuel moisture must be between 0% and 100%')
          .required('This field cannot be empty')
      }))
});

const renderDynamicError = errorMessage => (
  errorMessage ? (
    <div className='invalid-feedback d-block ms-2 w-auto'>
      {errorMessage}
    </div>
  ) : null
);

const WildfireSimulation = ({
  t,
  handleResetAOI,
  backToOnDemandPanel,
  mapInputOnChange
}) => {
  const dispatch = useDispatch();

  const error = useSelector(state => state.auth.error);

  // to manage number of dynamic (vertical) table rows in `Boundary Conditions`
  const [tableEntries, setTableEntries] = useState([0]);

  // The other two forms allow user to select these from a dropdown.
  // For this form we hard-code the list and pass along to the API
  // when we reshape the form data for submission
  const layerTypes = [
    { id: '35006', name: 'Fire Simulation' },
    { id: '35011', name: 'Max rate of spread' },
    { id: '35010', name: 'Mean rate of spread' },
    { id: '35009', name: 'Max fireline intensity' },
    { id: '35008', name: 'Mean fireline intensity' },
    { id: '35007', name: 'Fire perimeter simulation as isochrones maps' },
  ];

  const onSubmit = (formData) => {
    const boundary_conditions = Object.values(formData.boundaryConditions)
      .map(obj => ({
        time: +obj.timeOffset,
        w_dir: +obj.windDirection,
        w_speed: +obj.windSpeed,
        moisture: +obj.fuelMoistureContent
      }), []);

    const transformedGeometry = formData.mapSelection.startsWith('GEOMETRYCOLLECTION') ? formData.mapSelection : `GEOMETRYCOLLECTION(${formData.mapSelection})`
    const startDateTime = new Date(formData.ignitionDateTime).toISOString()
    const endDateTime = new Date(getDateOffset(startDateTime, formData.simulationTimeLimit)).toISOString()
    const payload = {
      data_types: layerTypes.map(item => item.id),
      geometry: transformedGeometry,
      geometry_buffer_size: DEFAULT_WILDFIRE_GEOMETRY_BUFFER,
      title: formData.simulationTitle,
      parameters: {
        description: formData.simulationDescription,
        start: startDateTime,
        end: endDateTime,
        time_limit: +formData.simulationTimeLimit,
        probabilityRange: +formData.probabilityRange,
        do_spotting: formData.simulationFireSpotting,
        boundary_conditions,
      }
    }

    dispatch(postMapRequest(payload));
    dispatch(getAllMapRequests());
    backToOnDemandPanel();
  }

  // used to compute end date from start date and number of hours
  const getDateOffset = (startTime, numberHours) => {
    if (!startTime || !numberHours) return;

    const endTime = moment(startTime)
      .add(numberHours, 'hours')
      .toISOString()
      .slice(0, 19);

    return endTime;
  }

  return (
    <Row>
      <Col>
        <Row>
          <Formik
            initialValues={{
              simulationTitle: '',
              simulationDescription: '',
              probabilityRange: 0.75,
              mapSelection: '',
              isMapAreaValid: null,
              isMapAreaValidWKT: null,
              simulationTimeLimit: 1,
              ignitionDateTime: null,
              simulationFireSpotting: false,
              boundaryConditions: [{
                timeOffset: 0,
                windDirection: '',
                windSpeed: '',
                fuelMoistureContent: ''
              }],
            }}
            validationSchema={WildfireSimulationSchema}
            onSubmit={onSubmit}
            id="wildfireSimulationForm"
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
              <Form onSubmit={handleSubmit} className='d-flex flex-column justify-content-between'>
                <Row>
                  <Col xl={5} className='d-flex flex-column justify-content-between'>
                    {/* do not remove this div, it is required to group these four elements together for styling purposes. */}
                    <div>
                      <Row>
                        <Col className='d-flex align-items-center'>
                          <h4>{t('requestMap')}</h4>
                        </Col>
                        <Col className="d-flex justify-content-end align-items-center">
                          <Button color='link'
                            onClick={handleResetAOI} className='p-0'>
                            {t('default-aoi')}
                          </Button>
                        </Col>
                      </Row>

                      <Row>
                        {getGeneralErrors(error)}
                      </Row>

                      <Row xl={12}>
                        <h5>{t('wildfireSimulation')}</h5>
                      </Row>

                      <Row>
                        <FormGroup className="form-group">
                          <Label for="dataLayerType">
                            {t('simulationTitle')}
                          </Label>
                          <Input
                            name="simulationTitle"
                            className={
                              errors.simulationTitle ? 'is-invalid' : null
                            }
                            id="simulationTitle"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.simulationTitle}
                            placeholder="[Type Simulation Title]"
                          />
                          {touched.simulationTitle && getError('simulationTitle', errors, touched, false)}
                        </FormGroup>
                      </Row>

                      <Row>
                        <FormGroup className="form-group">
                          <Label for="simulationDescription">
                            {t('Simulation Description')}
                          </Label>
                          <Input
                            id="simulationDescription"
                            name="simulationDescription"
                            type="textarea"
                            rows="2"
                            className={
                              errors.simulationDescription ? 'is-invalid' : null
                            }
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.simulationDescription}
                            placeholder="Simulation description"
                          />
                          {touched.simulationDescription && getError('simulationDescription', errors, touched, false)}
                        </FormGroup>
                      </Row>
                    </div>

                    <Row>
                      <FormGroup className='d-flex-column'>
                        <Row>
                          <Label for="probabilityRange" className='d-flex align-items-center'>
                            <ReactTooltip
                              aria-haspopup="true"
                              place='right'
                              class="alert-tooltip data-layers-alert-tooltip"
                            >
                              {PROBABILITY_INFO}
                            </ReactTooltip>
                            <i
                              data-tip
                              className='bx bx-info-circle font-size-8 p-0 me-1'
                              style={{ cursor: 'pointer' }}
                            />
                            {t('probabilityRange')}
                          </Label>
                        </Row>
                        <Row className='d-flex justify-content-start flex-nowrap gap-2'>
                          {PROBABILITY_RANGES.map(({ label, value }) => (
                            <Label
                              key={label}
                              id={label}
                              check
                              className='w-auto'
                            >
                              <Input
                                id={label}
                                name='probabilityRange'
                                type="radio"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                checked={+values.probabilityRange === value}
                                value={value}
                                className='me-2'
                              />
                              {label}
                            </Label>
                          ))}
                        </Row>
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup className="form-group">
                        <Label for="simulationTimeLimit">
                          {t('simulationTimeLimit')}
                        </Label>
                        <Input
                          name="simulationTimeLimit"
                          id="simulationTimeLimit"
                          className={
                            errors.simulationTimeLimit ? 'is-invalid' : null
                          }
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.simulationTimeLimit}
                          placeholder="Type Limit [hours]"
                        />
                        {touched.simulationTimeLimit && getError('simulationTimeLimit', errors, touched, false)}
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup className="form-group">
                        <Label for="mapSelection">
                          {t('mapSelection')}
                        </Label>
                        <MapInput
                          className={errors.mapSelection ? 'is-invalid' : ''}
                          id="mapSelection"
                          name="mapSelection"
                          type="textarea"
                          rows="5"
                          setCoordinates={(value) => {  mapInputOnChange(value, setFieldValue);  }}
                          onBlur={handleBlur}
                          coordinates={values.mapSelection}
                          placeholder={t('mapSelectionTxtGuide')}
                        />
                        {touched.mapSelection && getError('mapSelection', errors, touched, false)}
                        {values.isMapAreaValid === false ? getError('isMapAreaValid', errors, touched, false, true) : null}
                        {values.isMapAreaValidWKT === false && values.mapSelection !== '' ? getError('isMapAreaValidWKT', errors, touched, false, true) : null}
                      </FormGroup>
                    </Row>

                    <Row className='mb-3 w-100'>
                      <FormGroup className="form-group">
                        <Row>
                          <Col>
                            <Label for="ignitionDateTime">
                              {t('ignitionDateTime')}
                            </Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Input
                              id="ignitionDateTime"
                              name="ignitionDateTime"
                              type="datetime-local"
                              className={
                                errors.ignitionDateTime ? 'is-invalid' : ''
                              }
                              onChange={({ target: { value } }) => {
                                setFieldValue('ignitionDateTime', value)
                              }}
                              onBlur={handleBlur}
                              value={values.ignitionDateTime}
                            />
                          </Col>
                          <Col>
                            <Input
                              type="datetime-local"
                              disabled
                              value={
                                getDateOffset(values.ignitionDateTime, values.simulationTimeLimit)
                              }
                            />
                          </Col>
                          {touched.ignitionDateTime && getError('ignitionDateTime', errors, touched, false)}
                        </Row>
                      </FormGroup>
                    </Row>

                    <Row xl={5} className='d-flex justify-content-between align-items-center flex-nowrap mb-3 w-100'>
                      <FormGroup className='d-flex flex-nowrap align-items-center w-100'>
                        <Label
                          for="simulationFireSpotting"
                          className='mb-0 me-3'
                        >
                          {t('simulationFireSpotting')}
                        </Label>
                        <Input
                          id="simulationFireSpotting"
                          name="simulationFireSpotting"
                          type="checkbox"
                          onChange={handleChange}
                          value={values.simulationFireSpotting}
                          className='m-0'
                          style={{ cursor: 'pointer' }}
                        />
                        {touched.simulationFireSpotting && getError('simulationFireSpotting', errors, touched, false)}
                      </FormGroup>
                    </Row>
                  </Col>

                  <Col xl={7} className='mx-auto'>
                    <Card className='map-card mb-0' style={{ height: 670 }}>
                      <MapSection
                        setCoordinates={(wktConversion, isAreaValid) => {
                          // called if map is used to draw polygon
                          // we asssume it's valid WKT
                          setFieldValue('mapSelection', wktConversion);
                          setFieldValue('isMapAreaValid', isAreaValid);
                          setFieldValue('isMapAreaValidWKT', true);
                        }}
                        coordinates={values.mapSelection}
                        togglePolygonMap={true}
                        handleAreaValidation={feature => {
                          const area = Math.ceil(getFeatureArea(feature));
                          return area <= MAP.MAX_GEOMETRY_AREA.value;
                        }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <FormGroup className="form-group">
                    <Label for="boundaryConditions" className='m-0'>
                      {t('boundaryConditions')}
                    </Label>
                    <table className='on-demand-table'
                    >
                      <thead>
                        <tr></tr>
                        {TABLE_HEADERS.map(header => (
                          <tr
                            key={header}>
                            <span
                              style={{ fontWeight: 'bold' }}
                            >
                              {t(header)}
                            </span>
                          </tr>
                        ))}
                      </thead>
                      <FieldArray name='boundaryConditions'>
                        {() => {
                          return (
                            <tbody>
                              {tableEntries.map((position) => (
                                <tr key={position}>
                                  <td style={{ justifyContent: 'center' }}>
                                    {<i
                                      className="bx bx-trash font-size-24 p-0 w-auto"
                                      onClick={() => setTableEntries(
                                        tableEntries.filter(
                                          entry => entry !== position
                                        )
                                      )}
                                      style={{
                                        cursor: 'pointer',
                                        visibility: position === 0 ? 'hidden' : 'visible'
                                      }}
                                    />}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.timeOffset`}
                                      id={`boundaryConditions.${position}.timeOffset`}
                                      value={values.boundaryConditions[position]?.timeOffset ?? ''}
                                      disabled={position === 0}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions && renderDynamicError(errors.boundaryConditions?.[position]?.timeOffset)}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.windDirection`}
                                      id={`boundaryConditions.${position}.windDirection`}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions && renderDynamicError(errors.boundaryConditions?.[position]?.windDirection)}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.windSpeed`}
                                      id={`boundaryConditions.${position}.windSpeed`}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions && renderDynamicError(errors.boundaryConditions?.[position]?.windSpeed)}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.fuelMoistureContent`}
                                      id={`boundaryConditions.${position}.fuelMoistureContent`}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions && renderDynamicError(errors.boundaryConditions?.[position]?.fuelMoistureContent)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          )
                        }}
                      </FieldArray>
                      <i
                        onClick={() => {
                          if (tableEntries.length === +values.simulationTimeLimit) return;

                          setTableEntries(
                            [...tableEntries, tableEntries.length]
                          )
                        }}
                        className="bx bx-plus-circle p-0 ms-2 w-auto"
                        style={{ cursor: 'pointer', alignSelf: 'center', fontSize: '2.5rem' }}
                      />
                    </table>
                  </FormGroup>
                </Row>
                <Row>
                  <Col>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className='btn btn-primary'
                      color="primary"
                    >
                      {t('request')}
                    </Button>
                    <Button
                      className='btn btn-secondary ms-3'
                      color="secondary"
                      onClick={backToOnDemandPanel}
                    >
                      {t('cancel')}
                    </Button>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Row>
      </Col>
    </Row>
  )
};

WildfireSimulation.propTypes = {
  t: PropTypes.any,
  handleResetAOI: PropTypes.func,
  backToOnDemandPanel: PropTypes.func,
  mapInputOnChange: PropTypes.func,
}

export default withTranslation(['dataLayers', 'common'])(WildfireSimulation);
