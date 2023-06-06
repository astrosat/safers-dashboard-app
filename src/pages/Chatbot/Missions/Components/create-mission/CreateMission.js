import React, { useEffect, useState } from 'react';

import { Formik } from 'formik';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { Input, Button, Row, Col, Label, FormGroup, Form } from 'reactstrap';
import * as Yup from 'yup';

import MapInput from 'components/BaseMap/MapInput';
import DateRangePicker from 'components/DateRangePicker/DateRange';
import { getError } from 'helpers/errorHelper';
import {
  fetchTeams,
  organisationsSelector,
  teamsSelector,
} from 'store/common.slice';
import { createMission, resetMissionResponseState } from 'store/missions.slice';
import { userInfoSelector } from 'store/user.slice';
import { getGeoFeatures, getWKTfromFeature } from 'utility';

const setupSchema = t => {
  return Yup.object().shape({
    coordinates: Yup.string().required(t('field-empty-err', { ns: 'common' })),
    dateRange: Yup.array()
      .of(Yup.date())
      .min(2, t('field-empty-err', { ns: 'common' })),
    teamId: Yup.string().optional(),
    personId: Yup.string().optional(),
    description: Yup.string().required(t('field-empty-err', { ns: 'common' })),
    title: Yup.string().required(t('field-empty-err', { ns: 'common' })),
  });
};

const FORM_INITIAL_STATE = {
  coordinates: '',
  dateRange: [],
  teamId: '',
  personId: '',
  description: '',
  title: '',
};

const CreateMission = ({ onCancel, coordinates, setCoordinates }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const orgList = useSelector(organisationsSelector);
  const user = useSelector(userInfoSelector);
  const teamList = useSelector(teamsSelector);

  const [orgName, setorgName] = useState('--');
  const [selectedTeam, setSelectedTeam] = useState(null);

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
      dispatch(resetMissionResponseState());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);

  const onSubmit = ({
    coordinates,
    dateRange,
    description,
    personId,
    teamId,
    title,
  }) => {
    const payload = {
      title,
      description,
      start: dateRange[0] ?? null,
      end: dateRange[1] ?? null,
      source: 'Chatbot',
      geometry: coordinates,
      coordinatorTeamId: teamId ? parseInt(teamId) : null,
      coordinatorPersonId: personId ? parseInt(personId) : null,
    };

    dispatch(createMission(payload));

    onCancel();
  };

  return (
    <Formik
      initialValues={FORM_INITIAL_STATE}
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
            <FormGroup className="form-group">
              <Input
                id="title"
                name="title"
                placeholder={t('mission-title', { ns: 'chatBot' })}
                type="text"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.title ?? ''}
              />
              {getError('title', errors, touched, false)}
            </FormGroup>

            <FormGroup className="form-group mt-3">
              <DateRangePicker
                placeholder={`${t('Start', { ns: 'common' })} ${t('Date', {
                  ns: 'common',
                })} | ${t('End', { ns: 'common' })} ${t('Date', {
                  ns: 'common',
                })}`}
                isTimeEnabled={true}
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

            <div className="mt-3">
              <Label className="fw-bold" htmlFor="target">
                {t('assign-to', { ns: 'common' })}:{' '}
              </Label>

              <Row>
                <Col>
                  <Label className="form-label mt-3 mb-0">
                    {t('organisation', { ns: 'common' })}: {orgName}
                  </Label>
                </Col>

                <Col>
                  <Input
                    id="teamId"
                    name="teamId"
                    className="btn-sm sort-select-input"
                    type="select"
                    onChange={({ target: { value } }) => {
                      const selectedTeam = teamList?.find(
                        team => team.id === Number(value),
                      );
                      setFieldValue('teamId', value);
                      setSelectedTeam(selectedTeam);
                    }}
                    value={values.teamId}
                  >
                    <option value={''}>
                      --{t('team', { ns: 'common' })}--
                    </option>
                    {teamList?.map(team => {
                      return (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      );
                    })}
                  </Input>
                  {getError('teamId', errors, touched, false)}
                </Col>

                <Col>
                  <Input
                    id="chatbotUser"
                    className="btn-sm sort-select-input"
                    name="chatbotUser"
                    type="select"
                    disabled={!selectedTeam?.id}
                    onChange={({ target: { value } }) =>
                      setFieldValue('personId', value)
                    }
                    value={values.personId}
                  >
                    <option value={''}>
                      --{t('chatbot-user', { ns: 'common' })}--
                    </option>
                    {selectedTeam?.members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </Input>
                  {getError('personId', errors, touched, false)}
                </Col>
              </Row>
            </div>

            <FormGroup className="form-group mt-3">
              <Input
                id="description"
                name="description"
                type="textarea"
                placeholder={t('mission-desc', { ns: 'chatBot' })}
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

CreateMission.propTypes = {
  coordinates: PropTypes.any,
  onCancel: PropTypes.func,
  t: PropTypes.any,
  setCoordinates: PropTypes.func,
};

export default CreateMission;
