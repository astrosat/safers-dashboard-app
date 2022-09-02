import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, FormGroup, Label, Row, Col, Card, Form } from 'reactstrap';
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

const TABLE_HEADERS = [
  'timeHours',
  'windDirection',
  'windSpeed',
  'fuelMoistureContent'
];

const PROBABILITY_RANGES = ['50%', '75%', '90%'];

const WildfireSimulationSchema = Yup.object().shape({
  simulationTitle: Yup.string()
    .required('This field cannot be empty'),
  simulationTimeLimit: Yup.number()
    .typeError('This field must be a number')
    .min(1, 'Simulation time limit must be between 1 and 48')
    .max(48, 'Simulation time limit must be between 1 and 48')
    .required('This field cannot be empty'),
  probabilityRange: Yup.string()
    .required('This field cannot be empty'),
  mapSelection: Yup.string()
    .required('This field cannot be empty'),
  ignitionDateTime: Yup.date().required('This field cannot be empty'),
  boundaryConditions: Yup.array().of(
    Yup.object().shape({
      timeOffset: Yup.number()
        .typeError('This field must be a number')
        .min(0, 'Time offset must be between 1 and 48 hours')
        .max(48, 'Time offset must be between 1 and 48 hours')
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
    })
  ),
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
      .reduce((acc, obj) => ([...acc, {
        time: obj.timeOffset,
        w_dir: obj.windDirection,
        w_speed: obj.windSpeed,
        moisture: obj.fuelMoistureContent
      }]), []);

    const transformedGeometry = formData.mapSelection.startsWith('GEOMETRYCOLLECTION') ? formData.mapSelection : `GEOMETRYCOLLECTION(${formData.mapSelection})`
    const startDateTime = new Date(formData.ignitionDateTime).toISOString()
    const endDateTime = new Date(getDateOffset(startDateTime, formData.simulationTimeLimit)).toISOString()
    const payload = {
      data_types: layerTypes.map(item => item.id),
      geometry: transformedGeometry,
      title: formData.simulationTitle,
      parameters: {
        start: startDateTime,
        end: endDateTime,
        time_limit: formData.simulationTimeLimit,
        probabilityRange: formData.probabilityRange,
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
              probabilityRange: '75%',
              mapSelection: '',
              simulationTimeLimit: 1,
              ignitionDateTime: null,
              simulationFireSpotting: false,
              boundaryConditions: [],
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
                          {getError('simulationTitle', errors, touched, false)}
                        </FormGroup>
                      </Row>
                    </div>

                    <Row>
                      <FormGroup className='d-flex-column'>
                        <Row>
                          <Label for="probabilityRange" className='d-flex align-items-center'>
                            <i
                              data-tip
                              className='bx bx-info-circle font-size-8 p-0 me-1'
                              style={{ cursor: 'pointer' }}
                            />
                            {t('probabilityRange')}
                          </Label>
                        </Row>
                        <Row className='d-flex justify-content-start flex-nowrap gap-2'>
                          {PROBABILITY_RANGES.map(range => (
                            <Label
                              key={range}
                              id={range}
                              check
                              className='w-auto'
                            >
                              <Input
                                id={range}
                                name='probabilityRange'
                                type="radio"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                checked={values.probabilityRange === range}
                                value={range}
                                className='me-2'
                              />
                              {range}
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
                        {getError('simulationTimeLimit', errors, touched, false)}
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup className="form-group">
                        <Label for="mapSelection">
                          {t('mapSelection')}
                        </Label>
                        <Input
                          id="mapSelection"
                          name="mapSelection"
                          type="textarea"
                          rows="5"
                          className={errors.mapSelection ? 'is-invalid' : ''}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.mapSelection}
                          placeholder='Enter Well Known Text or draw a polygon on the map'
                        />
                        {getError('mapSelection', errors, touched, false)}
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
                        {getError('simulationFireSpotting', errors, touched, false)}
                      </FormGroup>
                    </Row>
                  </Col>

                  <Col xl={7} className='mx-auto'>
                    <Card className='map-card mb-0' style={{ height: 670 }}>
                      <MapSection
                        setCoordinates={value => {
                          setFieldValue('mapSelection', value)
                        }}
                        coordinates={values.mapSelection}
                        togglePolygonMap={true}
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
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {renderDynamicError(errors.boundaryConditions?.[position]?.timeOffset)}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.windDirection`}
                                      id={`boundaryConditions.${position}.windDirection`}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {renderDynamicError(errors.boundaryConditions?.[position]?.windDirection)}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.windSpeed`}
                                      id={`boundaryConditions.${position}.windSpeed`}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {renderDynamicError(errors.boundaryConditions?.[position]?.windSpeed)}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.fuelMoistureContent`}
                                      id={`boundaryConditions.${position}.fuelMoistureContent`}
                                      placeholder='[type here]'
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {renderDynamicError(errors.boundaryConditions?.[position]?.fuelMoistureContent)}
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
}

export default withTranslation(['dataLayers', 'common'])(WildfireSimulation);
