/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux';
import { Button, Input, FormGroup, Label, Row, Col, Card, Form } from 'reactstrap';
import { Formik } from 'formik';
import MapSection from './Map';
import * as Yup from 'yup'
import { getGeneralErrors, getError }  from '../../helpers/errorHelper';
import { withTranslation } from 'react-i18next'
import RequiredAsterisk from '../../components/required-asterisk'
import { DATA_LAYERS_PANELS } from './constants';
import 'react-rangeslider/lib/index.css'
import { getBoundingBox } from '../../helpers/mapHelper';
import moment from 'moment';

const PROBABILITY_RANGES = ['50%', '75%','90%']

const WildfireSimulationSchema = Yup.object().shape({
  simulationTitle: Yup.string()
    .required('This field cannot be empty'),
  simulationTimeLimit: Yup.number().min(1).max(48)
    .required('Simulation time limit should be between 1 and 48'),
  probabilityRange: Yup.string()
    .required('This field cannot be empty'),
  mapSelection: Yup.string()
    .required('This field cannot be empty'),
  startDate: Yup.date()
    .required('This field cannot be empty'),
});
  
const WildfireSimulation = ({ 
  t,
  setActiveTab,
  handleResetAOI,
}) => {
  const error = useSelector(state => state.auth.error);

  const [tableEntries, setTableEntries] = useState([1])

  //const defaultAoi = useSelector(state => state.user.defaultAoi);

  //const handleSubmitRequest = (event) => { alert('Clicked request');};
  //

  const [viewState, setViewState] = useState(undefined);
  const [iconLayer,] = useState(undefined);
  const [midPoint, setMidPoint] = useState([]);
  const [,setBoundingBox] = useState(undefined); // useful! can ignore in this case as we use getter from other component
  const [currentZoomLevel, setCurrentZoomLevel] = useState(undefined);
  const [newWidth, setNewWidth] = useState(600);
  const [newHeight, setNewHeight] = useState(600);
  const [coordinates, setCoordinates] = useState([]);

  const handleSubmitRequest = (event) => { alert('Clicked request'); console.log(event)};
  
  const handleCancel = () => { 
    setActiveTab(DATA_LAYERS_PANELS.onDemandMapLayers);
  }

  const getReportsByArea = () => {
    setBoundingBox(getBoundingBox(midPoint, currentZoomLevel, newWidth, newHeight));
  }

  const handleViewStateChange = (e) => {
    if (e && e.viewState) {
      setMidPoint([e.viewState.longitude, e.viewState.latitude]);
      setCurrentZoomLevel(e.viewState.zoom);
    }
  };

  const formatWKT = (coordinates) => {
    // format coords as WKT
    const list = coordinates.map(xy => `${xy[0].toFixed(6)} ${xy[1].toFixed(6)}`);
    return `POLYGON((${list.join(',\n')}))`;
  }

  const getDateOffset = (startTime, numberHours) => {
    // used to compute end date from start date and number of hours
    if (!startTime || !numberHours) {
      return undefined;
    }
    const endtime = moment(startTime).add(numberHours,'hours').toISOString().slice(0, 19);
    return endtime;
  }

  return (
    <Row>
      <Col xl={12}>
        <Row className='mb-3'>
          <Col className='d-flex align-items-center'>
            <h4 className='m-0'>{t('requestMap')}</h4>
          </Col>
          <Col className="d-flex justify-content-end align-items-center">
            <Button color='link'
              onClick={handleResetAOI} className='p-0'>
              {t('default-aoi')}
            </Button>
          </Col>
        </Row>
        <Row xl={12}>
          <Formik
            initialValues={{ 
              simulationTitle: '', 
              probabilityRange: '75%',
              mapselection: '', 
              simulationTimeLimit: '',
              ignitionDateTime: null,
              simulationFireSpotting: false,
            }}
            validationSchema={WildfireSimulationSchema}
            onSubmit={(values) => {console.log('values', values)}}
            id="wildfireSimulationForm"
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form onSubmit={handleSubmit} className='d-flex flex-column justify-content-between'>

                {/* start */}

                <Row style={{width: '100%',}}>

                  <Col>

                    <Row>
                      {getGeneralErrors(error)}
                    </Row>

                    <Row xl={12}>
                      <h5>{t('wildfireSimulation')}</h5>
                    </Row>

                    <Row>
                      <FormGroup className="form-group">
                        <Label for="dataLayerType">
                          {t('simulationTitle')}<RequiredAsterisk />
                        </Label>
                        <Input 
                          name="simulationTitle" 
                          className={getError('simulationTitle',errors,touched)}
                          id="simulationTitle"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.simulationTitle}
                          placeholder="[Type Simulation Title]"
                        />
                        {getError('simulationTitle', errors, touched, false)}
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup>
                        <Label for="probabilityRange">
                          {t('probabilityRange')}<RequiredAsterisk />&nbsp;
                          <i 
                            data-tip 
                            className='bx bx-info-circle font-size-8 me-3 p-0'
                          />
                        </Label>
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup className='d-flex flex-nowrap align-items-center gap-3'>
                        {PROBABILITY_RANGES.map(range => (
                          <Label
                            key={range}
                            id={range}
                            check
                          >
                            <Input
                              id={range}
                              name='probabilityRange'
                              type="radio"
                              onChange={handleChange}
                              checked={values.probabilityRange === range}
                              value={range}
                              className='me-2'
                            />
                            {range}
                          </Label>
                        ))}
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup className="form-group">
                        <Label for="simulationTimeLimit">
                          {t('simulationTimeLimit')}<RequiredAsterisk />
                        </Label>
                        <Input 
                          name="simulationTimeLimit" 
                          id="simulationTimeLimit"
                          className={getError('simulationTimeLimit',errors,touched)}
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
                          {t('mapSelection')}<RequiredAsterisk />
                        </Label>
                        <Input 
                          id="mapselection"
                          name="mapSelection"
                          type="textarea"
                          rows="5"
                          className={getError('mapSelection',errors,touched)}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={coordinates.length > 0 ? formatWKT(coordinates) : values.mapselection }
                          placeholder='Enter a comma-separated list of vertices, or draw a polygon on the map. If you enter coordinates these should be in WSG84, longitude then latitude.'
                        />
                        {getError('mapSelection', errors, touched, false)}
                      </FormGroup>
                    </Row>

                

                    <Row className='mb-3 w-100'>
                      <FormGroup className="form-group">
                        <Row>
                          <Col>
                            <Label for="ignitionDateTime">
                              {t('ignitionDateTime')}<RequiredAsterisk />
                            </Label>
                            <Input
                              id="ignitionDateTime"
                              name="ignitionDateTime"
                              type="datetime-local"
                              className={getError('ignitionDateTime',errors,touched)}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={values.ignitionDateTime}
                            />
                          </Col>
                          <Col>
                            <Label for="ignitionEndTime">
                              {t('ignitionEndTime')}<RequiredAsterisk />
                            </Label>
                            <Input
                              id="ignitionDateTime"
                              name="ignitionDateTime"
                              type="datetime-local"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              // disabled
                              value={
                                getDateOffset(values.ignitionDateTime, values.simulationTimeLimit)
                              }
                            />
                          </Col>
                        </Row>
                      </FormGroup>
                    </Row>

                    <Row xl={5} className='d-flex justify-content-between align-items-center flex-nowrap mb-3 w-100'>
                      <FormGroup>
                        <Row>
                          <Col>
                            <Label for="simulationFireSpotting">
                              {t('simulationFireSpotting')}
                            </Label>
                          </Col>
                          <Col>
                            <Input
                              id="simulationFireSpotting"
                              name="simulationFireSpotting"
                              type="checkbox"
                              value={values.simulationFireSpotting}
                            />
                          </Col>
                        </Row>
                        {getError('simulationFireSpotting', errors, touched, false)}
                      </FormGroup>
                    </Row>
                  </Col>

                  <Col xl={7} className='mx-auto'>
                    <Card className='map-card mb-0' style={{ height: 670 }}>
                      <MapSection
                        viewState={viewState}
                        iconLayer={iconLayer}
                        setViewState={setViewState}
                        getReportsByArea={getReportsByArea}
                        handleViewStateChange={handleViewStateChange}
                        setNewWidth={setNewWidth}
                        setNewHeight={setNewHeight}
                        setCoordinates={setCoordinates}
                        togglePolygonMap={true}
                      />
                    </Card>
                  </Col>

                </Row>
                {/* end  */}
                

                <Row>
                  <FormGroup className="form-group">
                    <Label for="boundaryConditions">
                      {t('boundaryConditions')}<RequiredAsterisk />
                    </Label>
                    <table style={{ display: 'flex' }}>
                      <thead style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        marginRight: '1rem'
                      }}>
                        <tr>&nbsp;</tr>
                        <tr>{t('timeHours')}<RequiredAsterisk /></tr>
                        <tr>{t('windDirection')}<RequiredAsterisk /></tr>
                        <tr>{t('windSpeed')}<RequiredAsterisk /></tr>
                        <tr>{t('fuelMoistureContent')}<RequiredAsterisk /></tr>
                      </thead>
                      <tbody style={{
                        maxwidth:'2048px',
                        display: 'flex',
                        overflowX: 'scroll',
                      }}>
                        {tableEntries.map((position) => {
                          return (
                            <tr key={position} style={{
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between'
                            }}>
                              <td 
                                style={{
                                  display: 'flex'
                                }}
                              >
                                {position}
                                &nbsp;
                                <div
                                  onClick={() => setTableEntries(
                                    tableEntries.filter(
                                      entry => entry !== position
                                    )
                                  )}
                                  style={{
                                    cursor: 'pointer'
                                  }}
                                >
                                  <i className="bx bx-trash font-size-24 me-3 p-0 w-auto"></i>
                                </div>
                              </td>
                              <td>
                                <Input
                                  name={`timeOffset${position}`} 
                                  id={`timeOffset${position}`}
                                  placeholder='[type here]'
                                />
                              </td>
                              <td>
                                <Input
                                  name={`windDirection${position}`} 
                                  id={`windDirection${position}`}
                                  placeholder='[type here]'
                                />
                              </td>
                              <td>
                                <Input
                                  name={`windSpeed${position}`} 
                                  id={`windSpeed${position}`}
                                  placeholder='[type here]'
                                />
                              </td>
                              <td>
                                <Input
                                  name={`fuelMoistureContent${position}`} 
                                  id={`fuelMoistureContent${position}`}
                                  placeholder='[type here]'
                                />
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                      <div 
                        onClick={() => setTableEntries(
                          [...tableEntries, tableEntries.length + 1]
                        )}
                        style={{  cursor: 'pointer', alignSelf: 'center' }}
                      >
                        <i className="bx bx-plus-circle font-size-24 me-3 p-0 w-auto"></i>
                      </div>
                    </table>
                    {getError('boundaryConditions', errors, touched, false)}
                  </FormGroup>
                </Row>

                <Row>
                  <Col>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className='btn btn-primary'
                      color="primary"
                      onClick={handleSubmitRequest}
                    >
                      {t('request')}
                    </button>
                    <Button
                      className='btn btn-secondary'
                      color="secondary"
                      onClick={handleCancel}
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
}

WildfireSimulation.PropTypes = {
  t: PropTypes.any,
  setActiveTab: PropTypes.any,
  handleResetAOI: PropTypes.function
} 

export default withTranslation(['dataLayers','common'])(WildfireSimulation);