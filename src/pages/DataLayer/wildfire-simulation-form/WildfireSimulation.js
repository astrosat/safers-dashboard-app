import React, { useState, useEffect } from 'react';

import { area as getFeatureArea } from '@turf/turf';
import { FieldArray, Formik } from 'formik';
import moment from 'moment';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'react-tooltip';
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
import * as Yup from 'yup';

import { errorSelector } from 'store/authentication.slice';
import {
  setSelectedFireBreak,
  selectedFireBreakSelector,
} from 'store/datalayer.slice';
import { getWKTfromFeature } from 'utility';

import MapInput from '../../../components/BaseMap/MapInput';
import { MAP } from '../../../constants/common';
import { getGeneralErrors, getError } from '../../../helpers/errorHelper';
import {
  SIMULATION_TIME_LIMIT,
  DEFAULT_FIRE_BREAK_TYPE,
  BOUNDARY_CONDITIONS_TABLE_HEADERS,
  PROBABILITY_INFO,
  PROBABILITY_RANGES,
  FIRE_BREAK_OPTIONS,
} from '../constants';
import MapSection from '../Map';
import 'react-rangeslider/lib/index.css';

Yup.addMethod(Yup.number, 'uniqueTimeOffset', function (message) {
  return this.test('uniqueTimeOffset', message, (timeOffset, { from }) => {
    // 'from' is an array of parent objects moving from closest
    // to furthest relatives. [0] is the immediate parent object,
    // while [1] is the higher parent array of all of those objects.
    const allTimeOffsets = from[1].value.boundaryConditions.map(d =>
      Number(d.timeOffset),
    );

    const matchCount = allTimeOffsets.filter(d => d === timeOffset).length;
    return matchCount <= 1;
  });
});

const renderDynamicError = errorMessage =>
  errorMessage ? (
    <div className="invalid-feedback d-block ms-2 w-auto">{errorMessage}</div>
  ) : null;

const WildfireSimulation = ({
  t,
  handleResetAOI,
  backToOnDemandPanel,
  mapInputOnChange,
  onSubmit,
}) => {
  const dispatch = useDispatch();

  const error = useSelector(errorSelector);
  const selectedFireBreak = useSelector(selectedFireBreakSelector);

  // to manage number of dynamic (vertical) table rows in `Boundary Conditions`
  const [tableEntries, setTableEntries] = useState([0]);
  const [fireBreakSelectedOptions, setFireBreakSelectedOptions] = useState({
    0: DEFAULT_FIRE_BREAK_TYPE,
  });

  // reset global state when form is closed
  useEffect(
    () => () => {
      dispatch(setSelectedFireBreak(null));
    },
    [dispatch],
  );
  // side effect used so that select value can be controlled by both
  // the select itself and the map features when selected
  useEffect(() => {
    if (selectedFireBreak) {
      const { position, type } = selectedFireBreak;
      setFireBreakSelectedOptions(prev => ({
        ...prev,
        [position]: type,
      }));
    }
  }, [selectedFireBreak]);

  const WildfireSimulationSchema = Yup.object().shape({
    simulationTitle: Yup.string().required(
      t('field-empty-err', { ns: 'common' }),
    ),
    simulationDescription: Yup.string().required(
      t('field-empty-err', { ns: 'common' }),
    ),
    hoursOfProjection: Yup.number()
      .typeError(t('field-err-number'))
      .min(
        1,
        t('field-err-simulation-between', {
          ns: 'dataLayers',
          timelimit: SIMULATION_TIME_LIMIT,
        }),
      )
      .max(
        SIMULATION_TIME_LIMIT,
        t('field-err-simulation-between', {
          ns: 'dataLayers',
          timelimit: SIMULATION_TIME_LIMIT,
        }),
      )
      .required(t('field-empty-err', { ns: 'common' })),
    probabilityRange: Yup.string().required(
      t('field-empty-err', { ns: 'common' }),
    ),
    mapSelection: Yup.array()
      .isValidWKTString(t('field-err-vallid-wkt', { ns: 'dataLayers' }))
      .typeError(t('field-err-vallid-wkt', { ns: 'dataLayers' }))
      .required(t('field-err-vallid-wkt', { ns: 'dataLayers' })),
    isMapAreaValid: Yup.boolean().oneOf(
      [true],
      t('field-err-area-greater-than', {
        ns: 'dataLayers',
        maxgeoarea: MAP.MAX_GEOMETRY_AREA.label,
      }),
    ),
    isMapAreaValidWKT: Yup.boolean().oneOf(
      [true],
      t('field-err-geometry-valid', { ns: 'dataLayers' }),
    ),
    ignitionDateTime: Yup.date()
      .typeError(t('field-err-valid-date', { ns: 'common' }))
      .required(t('field-empty-err', { ns: 'common' })),
    boundaryConditions: Yup.array().of(
      Yup.object().shape({
        timeOffset: Yup.number()
          .typeError(t('field-empty-err', { ns: 'common' }))
          .min(
            0,
            t('field-err-timeoffset-between', {
              ns: 'dataLayers',
              timelimit: SIMULATION_TIME_LIMIT,
            }),
          )
          .max(
            SIMULATION_TIME_LIMIT,
            t('field-err-timeoffset-between', {
              ns: 'dataLayers',
              timelimit: SIMULATION_TIME_LIMIT,
            }),
          )
          .uniqueTimeOffset(
            t('field-err-timeoffset-unique', { ns: 'dataLayers' }),
          )
          .required(t('field-empty-err', { ns: 'common' })),
        windDirection: Yup.number(t('field-err-number'))
          .typeError(t('field-err-number'))
          .min(0, t('field-err-wind-between', { ns: 'dataLayers' }))
          .max(360, t('field-err-wind-between', { ns: 'dataLayers' }))
          .required(t('field-empty-err', { ns: 'common' })),
        windSpeed: Yup.number(t('field-err-number'))
          .typeError(t('field-err-number'))
          .min(0, t('field-err-wind-speed-between', { ns: 'dataLayers' }))
          .max(300, t('field-err-wind-speed-between', { ns: 'dataLayers' }))
          .required(t('field-empty-err', { ns: 'common' })),
        fuelMoistureContent: Yup.number(t('field-err-number'))
          .typeError(t('field-err-number'))
          .min(0, t('field-err-fuel-moisture', { ns: 'dataLayers' }))
          .max(100, t('field-err-fuel-moisture', { ns: 'dataLayers' }))
          .required(t('field-empty-err', { ns: 'common' })),
      }),
    ),
  });

  // used to compute end date from start date and number of hours
  const getDateOffset = (startTime, numberHours) => {
    if (!startTime || !numberHours) return;

    const endTime = moment(startTime)
      .add(numberHours, 'hours')
      .toISOString()
      .slice(0, 19);

    return endTime;
  };

  const addBoundaryConditionTableColumn = () => {
    const nextIndex = tableEntries.length;
    setTableEntries([...tableEntries, nextIndex]);

    // add selected fire break key for boundary condition
    // when new boundary condition is created
    setFireBreakSelectedOptions(prev => ({
      ...prev,
      [nextIndex]: DEFAULT_FIRE_BREAK_TYPE,
    }));
  };

  const removeBoundaryConditionTableColumn = position => {
    setTableEntries(tableEntries.filter(entry => entry !== position));

    // remove selected fire break key for boundary condition when it is deleted
    setFireBreakSelectedOptions(prev =>
      Object.entries(prev).reduce(
        (acc, [k, v]) => (Number(k) === position ? acc : { ...acc, [k]: v }),
        {},
      ),
    );
  };

  const handleFireBreakEditClick = (e, position) => {
    // disable button's default 'submit' type, prevent form submitting
    e.preventDefault();

    const isSelected = selectedFireBreak?.position === position;
    const type = fireBreakSelectedOptions[position];
    dispatch(setSelectedFireBreak(isSelected ? null : { position, type }));
  };

  const getAllGeojson = formValues => {
    const { mapSelection, boundaryConditions } = formValues;

    const fireBreaks = boundaryConditions.reduce((acc, cur) => {
      // will be sub-array of features if more than one line drawn
      const features = Object.values(cur.fireBreak ?? {}).flat();
      return [...acc, ...features];
    }, []);

    return [...(mapSelection ?? []), ...fireBreaks];
  };

  return (
    <Row>
      <Col>
        <Row>
          <Formik
            initialValues={{
              simulationTitle: '',
              simulationDescription: '',
              probabilityRange: 0.75,
              mapSelection: [],
              isMapAreaValid: null,
              isMapAreaValidWKT: null,
              hoursOfProjection: 1,
              ignitionDateTime: '',
              simulationFireSpotting: false,
              boundaryConditions: [
                {
                  timeOffset: 0,
                  windDirection: '',
                  windSpeed: '',
                  fuelMoistureContent: '',
                  fireBreak: {},
                },
              ],
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
              <Form
                onSubmit={handleSubmit}
                className="d-flex flex-column justify-content-between"
              >
                <Row>
                  <Col
                    xl={5}
                    className="d-flex flex-column justify-content-between"
                  >
                    {/* do not remove this div, it is required to group these four elements together for styling purposes. */}
                    <div>
                      <Row>
                        <Col className="d-flex align-items-center">
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
                          {touched.simulationTitle &&
                            getError('simulationTitle', errors, touched, false)}
                        </FormGroup>
                      </Row>

                      <Row>
                        <FormGroup className="form-group">
                          <Label for="simulationDescription">
                            {t('simulationDescription', { ns: 'dataLayers' })}
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
                            placeholder={t('simulationDescription', {
                              ns: 'dataLayers',
                            })}
                          />
                          {touched.simulationDescription &&
                            getError(
                              'simulationDescription',
                              errors,
                              touched,
                              false,
                            )}
                        </FormGroup>
                      </Row>
                    </div>

                    <Row>
                      <FormGroup className="d-flex-column">
                        <Row>
                          <Label
                            for="probabilityRange"
                            className="d-flex align-items-center"
                          >
                            <Tooltip
                              id="probabilityTooltip"
                              place="right"
                              className="alert-tooltip data-layers-alert-tooltip"
                            >
                              {PROBABILITY_INFO}
                            </Tooltip>
                            <i
                              data-tooltip-id="probabilityTooltip"
                              className="bx bx-info-circle font-size-8 p-0 me-1"
                              style={{ cursor: 'pointer' }}
                            />
                            {t('probabilityRange')}
                          </Label>
                        </Row>
                        <Row className="d-flex justify-content-start flex-nowrap gap-2">
                          {PROBABILITY_RANGES.map(({ label, value }) => (
                            <Label
                              key={label}
                              id={label}
                              check
                              className="w-auto"
                            >
                              <Input
                                id={label}
                                name="probabilityRange"
                                type="radio"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                checked={
                                  Number(values.probabilityRange) === value
                                }
                                value={value}
                                className="me-2"
                              />
                              {label}
                            </Label>
                          ))}
                        </Row>
                      </FormGroup>
                    </Row>

                    <Row>
                      <FormGroup className="form-group">
                        <Label for="hoursOfProjection">
                          {t('hoursOfProjection')}
                        </Label>
                        <Input
                          name="hoursOfProjection"
                          id="hoursOfProjection"
                          className={
                            errors.hoursOfProjection ? 'is-invalid' : null
                          }
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.hoursOfProjection}
                          placeholder="Type Limit [hours]"
                        />
                        {touched.hoursOfProjection &&
                          getError('hoursOfProjection', errors, touched, false)}
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
                            mapInputOnChange(value, setFieldValue);
                          }}
                          onBlur={handleBlur}
                          coordinates={getWKTfromFeature(values.mapSelection)}
                          placeholder={t('mapSelectionTxtGuide')}
                        />
                        {touched.mapSelection &&
                          getError('mapSelection', errors, touched, false)}
                        {values.isMapAreaValid === false
                          ? getError(
                              'isMapAreaValid',
                              errors,
                              touched,
                              false,
                              true,
                            )
                          : null}
                        {values.isMapAreaValidWKT === false &&
                        values.mapSelection.length !== 0
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

                    <Row className="mb-3 w-100">
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
                                setFieldValue('ignitionDateTime', value);
                              }}
                              onBlur={handleBlur}
                              value={values.ignitionDateTime}
                            />
                          </Col>
                          <Col>
                            <Input
                              type="datetime-local"
                              disabled
                              value={getDateOffset(
                                values.ignitionDateTime,
                                values.hoursOfProjection,
                              )}
                            />
                          </Col>
                          {touched.ignitionDateTime &&
                            getError(
                              'ignitionDateTime',
                              errors,
                              touched,
                              false,
                            )}
                        </Row>
                      </FormGroup>
                    </Row>

                    <Row
                      xl={5}
                      className="d-flex justify-content-between align-items-center flex-nowrap mb-3 w-100"
                    >
                      <FormGroup className="d-flex flex-nowrap align-items-center w-100">
                        <Label
                          for="simulationFireSpotting"
                          className="mb-0 me-3"
                        >
                          {t('simulationFireSpotting')}
                        </Label>
                        <Input
                          id="simulationFireSpotting"
                          name="simulationFireSpotting"
                          type="checkbox"
                          onChange={handleChange}
                          value={values.simulationFireSpotting}
                          className="m-0"
                          style={{ cursor: 'pointer' }}
                        />
                        {touched.simulationFireSpotting &&
                          getError(
                            'simulationFireSpotting',
                            errors,
                            touched,
                            false,
                          )}
                      </FormGroup>
                    </Row>
                  </Col>

                  <Col xl={7} className="mx-auto">
                    <Card
                      className="map-card mb-0 position-relative"
                      style={{ height: 670 }}
                    >
                      <MapSection
                        setCoordinates={(geoJson, isAreaValid) => {
                          // called if map is used to draw polygon
                          // we assume it's valid WKT

                          if (selectedFireBreak) {
                            // currently selected fireBreak object (data for all fireBreak types)
                            const existingFireBreakData =
                              values.boundaryConditions?.[
                                selectedFireBreak?.position
                              ]?.fireBreak;

                            // current value of selected BoundaryCondition's select
                            // ('vehicle', 'canadair', etc)
                            const selectedFireBreakType =
                              fireBreakSelectedOptions[
                                selectedFireBreak?.position
                              ];

                            // add id specific to 1. which boundary condition, 2. which fire
                            // break type, and 3. which position within feature array
                            const id = `${selectedFireBreakType}-${
                              selectedFireBreak?.position
                            }-${geoJson.length - 1}`;

                            const newData = [
                              ...(existingFireBreakData?.[
                                selectedFireBreakType
                              ] ?? []),
                              {
                                ...geoJson[geoJson.length - 1],
                                properties: {
                                  id,
                                  fireBreakType: selectedFireBreakType,
                                },
                              },
                            ];

                            const updatedFireBreakData = {
                              ...existingFireBreakData,
                              [selectedFireBreakType]: newData,
                            };
                            setFieldValue(
                              `boundaryConditions.${selectedFireBreak?.position}.fireBreak`,
                              updatedFireBreakData,
                            );
                          } else {
                            setFieldValue('mapSelection', geoJson);
                            setFieldValue('isMapAreaValid', isAreaValid);
                            setFieldValue('isMapAreaValidWKT', true);
                          }
                        }}
                        coordinates={getAllGeojson(values)}
                        togglePolygonMap={true}
                        handleAreaValidation={feature => {
                          const area = Math.ceil(getFeatureArea(feature));
                          return area <= MAP.MAX_GEOMETRY_AREA.value;
                        }}
                        clearMap={selectedFeatureData => {
                          const { properties, geometry } =
                            selectedFeatureData.selectedFeature;

                          if (geometry.type === 'Polygon') {
                            setFieldValue('mapSelection', []);
                            setFieldValue('isMapAreaValid', true);
                            setFieldValue('isMapAreaValidWKT', true);
                          } else {
                            // id is specific to individual feature, so can be used for map and
                            // also setCoords to determnine which to remove from form state
                            const deleteId = properties.id ?? null;

                            const existingFireBreakData =
                              values.boundaryConditions?.[
                                selectedFireBreak?.position
                              ]?.fireBreak;

                            // current value of selected BoundaryCondition's select
                            // ('vehicle', 'canadair', etc)
                            const selectedFireBreakType =
                              fireBreakSelectedOptions[
                                selectedFireBreak?.position
                              ];

                            // filter out feature that has been deleted on map
                            const filteredData = existingFireBreakData?.[
                              selectedFireBreakType
                            ]?.filter(feat => feat.properties.id !== deleteId);

                            console.log(
                              'existingFireBreakData: ',
                              existingFireBreakData,
                            );

                            const updatedFireBreakData = {
                              ...existingFireBreakData,
                              [selectedFireBreakType]: filteredData,
                            };
                            setFieldValue(
                              `boundaryConditions.${selectedFireBreak?.position}.fireBreak`,
                              updatedFireBreakData,
                            );
                          }
                        }}
                      />
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <FormGroup className="form-group">
                    <Label for="boundaryConditions" className="m-0">
                      {t('boundaryConditions')}
                    </Label>
                    <table className="on-demand-table align-content-between">
                      <thead className="d-flex justify-content-evenly mt-3">
                        {BOUNDARY_CONDITIONS_TABLE_HEADERS.map(header => (
                          <tr key={header}>
                            <span style={{ fontWeight: 'bold' }}>
                              {t(header)}
                            </span>
                          </tr>
                        ))}
                      </thead>
                      <FieldArray name="boundaryConditions">
                        {() => (
                          <tbody>
                            {tableEntries.map(position => {
                              const isFireBreakSelected =
                                position === selectedFireBreak?.position;
                              const drawButtonStyles = !isFireBreakSelected
                                ? {
                                    backgroundColor: '#2c2d34',
                                  }
                                : {};
                              return (
                                <tr key={position}>
                                  <td style={{ justifyContent: 'center' }}>
                                    {
                                      <i
                                        className="bx bx-trash font-size-24 p-0 w-auto"
                                        onClick={() =>
                                          removeBoundaryConditionTableColumn(
                                            position,
                                          )
                                        }
                                        style={{
                                          cursor: 'pointer',
                                          visibility:
                                            position === 0
                                              ? 'hidden'
                                              : 'visible',
                                        }}
                                      />
                                    }
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.timeOffset`}
                                      id={`boundaryConditions.${position}.timeOffset`}
                                      value={
                                        values.boundaryConditions[position]
                                          ?.timeOffset ?? ''
                                      }
                                      disabled={position === 0}
                                      placeholder="[type here]"
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions &&
                                      renderDynamicError(
                                        errors.boundaryConditions?.[position]
                                          ?.timeOffset,
                                      )}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.windDirection`}
                                      id={`boundaryConditions.${position}.windDirection`}
                                      placeholder="[type here]"
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions &&
                                      renderDynamicError(
                                        errors.boundaryConditions?.[position]
                                          ?.windDirection,
                                      )}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.windSpeed`}
                                      id={`boundaryConditions.${position}.windSpeed`}
                                      placeholder="[type here]"
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions &&
                                      renderDynamicError(
                                        errors.boundaryConditions?.[position]
                                          ?.windSpeed,
                                      )}
                                  </td>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.fuelMoistureContent`}
                                      id={`boundaryConditions.${position}.fuelMoistureContent`}
                                      placeholder="[type here]"
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                    />
                                    {touched.boundaryConditions &&
                                      renderDynamicError(
                                        errors.boundaryConditions?.[position]
                                          ?.fuelMoistureContent,
                                      )}
                                  </td>
                                  <div className="d-flex align-items-center gap-2 mb-1 mt-1">
                                    <Input
                                      type="select"
                                      className="btn-sm sort-select-input"
                                      value={fireBreakSelectedOptions[position]}
                                      onChange={({ target: { value } }) =>
                                        dispatch(
                                          setSelectedFireBreak({
                                            position,
                                            type: value,
                                          }),
                                        )
                                      }
                                    >
                                      {FIRE_BREAK_OPTIONS.map(
                                        ({ label, value }) => (
                                          <option key={label} value={value}>
                                            {label}
                                          </option>
                                        ),
                                      )}
                                    </Input>
                                    <button
                                      key={position}
                                      onClick={e =>
                                        handleFireBreakEditClick(e, position)
                                      }
                                      className="btn btn-primary"
                                      color="primary"
                                      style={drawButtonStyles}
                                    >
                                      {isFireBreakSelected ? 'Finish' : 'Edit'}
                                    </button>
                                  </div>
                                  <td>
                                    <Input
                                      name={`boundaryConditions.${position}.fireBreak`}
                                      id={`boundaryConditions.${position}.fireBreak`}
                                      readOnly
                                      type="textarea"
                                      value={getWKTfromFeature(
                                        values.boundaryConditions?.[position]
                                          ?.fireBreak?.[
                                          fireBreakSelectedOptions[position]
                                        ] ?? '',
                                      )}
                                      onBlur={handleBlur}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        )}
                      </FieldArray>
                      <i
                        onClick={() => {
                          if (
                            tableEntries.length ===
                            Number(values.hoursOfProjection)
                          )
                            return;
                          addBoundaryConditionTableColumn();
                        }}
                        className="bx bx-plus-circle p-0 ms-2 w-auto"
                        style={{
                          cursor: 'pointer',
                          alignSelf: 'center',
                          fontSize: '2.5rem',
                        }}
                      />
                    </table>
                  </FormGroup>
                </Row>
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
                      className="btn btn-secondary ms-3"
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
  );
};

WildfireSimulation.propTypes = {
  t: PropTypes.any,
  handleResetAOI: PropTypes.func,
  backToOnDemandPanel: PropTypes.func,
  mapInputOnChange: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default withTranslation(['dataLayers', 'common'])(WildfireSimulation);
