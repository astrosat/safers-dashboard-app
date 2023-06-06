import React, { useEffect, useState } from 'react';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button, Label, Row, Col, FormGroup, Form } from 'reactstrap';
import * as Yup from 'yup';

import MapInput from 'components/BaseMap/MapInput';
import DateRangePicker from 'components/DateRangePicker/DateRange';
import { getError } from 'helpers/errorHelper';
import { organisationsSelector } from 'store/common.slice';
import { createComms, resetCommsResponseState } from 'store/comms.slice';
import { userInfoSelector } from 'store/user.slice';
import { getWKTfromFeature, getGeoFeatures } from 'utility';

const setupSchema = t => {
  return Yup.object().shape({
    dateRange: Yup.array()
      .of(Yup.date())
      .min(2, t('field-empty-err', { ns: 'common' })),
    coordinates: Yup.string().required(t('field-empty-err', { ns: 'common' })),
    scope: Yup.string().required(t('field-empty-err', { ns: 'common' })),
    restriction: Yup.string().when('scope', {
      is: 'Restricted',
      then: schema =>
        schema.required(
          t('Restriction needed if scope is restricted', { ns: 'common' }),
        ),
    }),
    description: Yup.string().required(t('field-empty-err', { ns: 'common' })),
  });
};

const INITIAL_FORM_VALUES = {
  dateRange: [],
  coordinates: [],
  scope: '',
  restriction: '',
  description: '',
};

const CreateMessage = ({ coordinates, onCancel, setCoordinates }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const orgList = useSelector(organisationsSelector);
  const user = useSelector(userInfoSelector);

  const [orgName, setorgName] = useState('');

  const messageSchema = setupSchema(t);

  useEffect(() => {
    if (orgList && user?.organization) {
      const organization = orgList.find(org => org.name === user.organization);
      setorgName(organization.name.split('-')[0]);
    }
  }, [orgList, user]);

  //Clear success states on component unmount
  useEffect(() => {
    return () => {
      dispatch(resetCommsResponseState());
    };
  }, [dispatch]);

  const onSubmit = ({
    coordinates,
    dateRange,
    description,
    scope,
    restriction,
  }) => {
    const payload = {
      message: description,
      start: dateRange[0] ?? null,
      end: dateRange[1] ?? null,
      scope,
      geometry: coordinates,
    };

    if (scope !== 'Public') {
      payload.restriction = restriction;
    }

    dispatch(createComms(payload));

    onCancel();
  };

  return (
    <Formik
      initialValues={INITIAL_FORM_VALUES}
      validationSchema={messageSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setFieldValue,
      }) => {
        return (
          <Form onSubmit={handleSubmit} noValidate>
            <FormGroup className="form-group mt-3">
              <DateRangePicker
                placeholder={`${t('Start', { ns: 'common' })} ${t('Date', {
                  ns: 'common',
                })} | ${t('End', { ns: 'common' })} ${t('Date', {
                  ns: 'common',
                })}`}
                onChange={value => setFieldValue('dateRange', value)}
              />
              {getError('dateRange', errors, touched, false)}
            </FormGroup>

            <FormGroup className="form-group mt-3">
              <MapInput
                id="coordinates"
                name="coordinates"
                className={`${getError('coordinates', errors, errors)}`}
                type="textarea"
                placeholder={t('Map Selection', { ns: 'chatBot' })}
                rows="10"
                coordinates={getWKTfromFeature(coordinates)}
                setCoordinates={wkt => setCoordinates(getGeoFeatures(wkt))}
                handleChange={handleChange}
                onBlur={handleBlur}
              />
              {getError('coordinates', errors, touched, false)}
            </FormGroup>

            <Label className="form-label mt-3 mb-0">
              {t('organisation', { ns: 'common' })}: {orgName}
            </Label>

            <Row className="my-3">
              <Col xl={1} md={2}>
                <Label htmlFor="target">
                  {t('target', { ns: 'common' })}:{' '}
                </Label>
              </Col>

              <Col xl={5} className="pe-xl-0 text-center">
                <Input
                  id="scope"
                  className={`btn-sm sort-select-input me-2 mb-2 ${getError(
                    'scope',
                    errors,
                    errors,
                  )}`}
                  name="scope"
                  type="select"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.scope}
                >
                  <option value="">--{t('scope', { ns: 'common' })}--</option>
                  <option value="Public">
                    {t('public', { ns: 'common' })}
                  </option>
                  <option value="Restricted">
                    {t('restricted', { ns: 'common' })}
                  </option>
                </Input>
                {getError('scope', errors, touched, false)}
              </Col>

              {values.scope === 'Restricted' ? (
                <Col xl={5}>
                  <Input
                    id="restriction"
                    className={`btn-sm sort-select-input ${getError(
                      'restriction',
                      errors,
                      errors,
                    )}`}
                    name="restriction"
                    type="select"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.restriction}
                  >
                    <option value="">--{t('Restrictions')}--</option>
                    <option value="Citizen">{t('Citizen')}</option>
                    <option value="Professional">{t('Professional')}</option>
                    <option value="Organization">{t('Organisation')}</option>
                  </Input>
                  {getError('restriction', errors, touched, false)}
                </Col>
              ) : null}
            </Row>

            <FormGroup className="form-group mt-3">
              <Input
                id="description"
                name="description"
                className={`${getError('desc', errors, errors)}`}
                type="textarea"
                placeholder={t('msg-desc', { ns: 'chatBot' })}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.description ?? ''}
                rows="10"
              />
              {getError('description', errors, touched, false)}
            </FormGroup>

            <div className="mt-3">
              <Button type="button" onClick={onCancel}>
                {t('cancel', { ns: 'common' })}
              </Button>

              <Button type="submit" className="mx-3">
                {t('send', { ns: 'common' })}
              </Button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

CreateMessage.propTypes = {
  coordinates: PropTypes.any,
  onCancel: PropTypes.func,
  setCoordinates: PropTypes.func,
};

export default CreateMessage;
