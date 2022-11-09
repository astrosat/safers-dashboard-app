import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types'
import { Input, Button, Row, Col, Label, FormGroup } from 'reactstrap';
import DateRangePicker from '../../../../components/DateRangePicker/DateRange';
import MapInput from '../../../../components/BaseMap/MapInput';
import { getError } from '../../../../helpers/errorHelper';
import { createMission, resetMissionResponseState } from '../../../../store/missions/action';
import { getTeamList } from '../../../../store/appAction';
import moment from 'moment'
import { withTranslation } from 'react-i18next'

import _ from 'lodash';

import toastr from 'toastr';
import 'toastr/build/toastr.min.css'


const CreateMission = ({ t, onCancel, coordinates, setCoordinates }) => {

  const dispatch = useDispatch();

  const { orgList = [] } = useSelector(state => state.common);
  const { info:user } = useSelector(state => state.user);
  const { missionCreated } = useSelector(state => state.missions);
  const { teamList } = useSelector(state => state.common);

  const [orgName, setorgName] = useState('--');
  const [teamId, setTeamId] = useState();
  const [chatbotUserId, setChatbotUserId] = useState();
  const [title, setTitle] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [desc, setDesc] = useState(null);
  const [errors, setErrors] = useState({});
  const [validCoords, isValidCoordFormat] = useState(false);

  useEffect(() => {
    dispatch(getTeamList());
  }, []);

  useEffect(() => {
    if (orgList.length && user?.organization) {
      const organization = _.find(orgList, { id: user.organization });
      setorgName(organization.name.split('-')[0])
    }
  }, [orgList, user]);

  useEffect(() => {
    if (missionCreated) {
      toastr.success(missionCreated.msg, '');
      onCancel();
    }

  }, [missionCreated]);

  useEffect(() => {
    if(coordinates){
      validateCoord();
    }
  }, [coordinates, validCoords]);

  //Clear success states on component unmount
  useEffect(() => {
    return () => {
      dispatch(resetMissionResponseState());
    };
  }, []);

  const handleDateRangePicker = (dates) => {
    setDateRange(dates.map(date => 
      moment(date).format('YYYY-MM-DD'))
    );
  }

  const validateField = (attrib, val, returnErr=false) => {
    const tempError = {...errors};
    if(!val || val == ''){
      tempError[attrib] = t('field-empty-err');
    }
    else {
      delete tempError[attrib];
    }
    if(returnErr){
      return tempError
    }
    setErrors(tempError);
  }

  const validateCoord = (returnErr=false) => {
    const tempError = {...errors};
    if (!coordinates || coordinates === '') {
      tempError['coordinates'] = t('field-err-select-area', { ns: 'chatBot' });
    }
    else if (!validCoords) {
      tempError['coordinates'] = t('field-err-correct-coord', { ns: 'chatBot' });
    }
    else {
      delete tempError['coordinates'];
    }

    if(returnErr){
      return tempError
    }
    setErrors(tempError);
  }

  const validate = () => {
    const valTitle = validateField('title', title, true);
    const valDesc = validateField('desc', desc, true);
    const valDateRange = validateField('dateRange', dateRange, true);
    const valCoordinates = validateCoord(true);
    const tempErrors = { ...valTitle, ...valDesc, ...valDateRange, ...valCoordinates };
    setErrors(tempErrors);
  }

  const submitMsg = () => {
    validate();
    if(Object.keys(errors).length === 0){
      const payload = {
        title,
        description: desc,
        start: dateRange[0] ?? null,
        end: dateRange[1] ?? null,
        source: 'Chatbot',
        geometry: coordinates ? coordinates : null,
        coordinatorTeamId: teamId ? parseInt(teamId) : null,
        coordinatorPersonId: chatbotUserId ? parseInt(chatbotUserId) : null
      }
      dispatch(createMission(payload))
    }
  }

  return (<>
    <FormGroup className="form-group">
      <Input
        id="mission-title-input"
        className={`${getError('title', errors, errors)}`}
        name="title"
        placeholder={t('mission-title', { ns: 'chatBot' })}
        type="text"
        onChange={(e) => {setTitle(e.target.value);}}
        onBlur={(e) => {validateField('title', e.target.value)}}
        value={title}
      />
      {getError('title', errors, errors, false)}
    </FormGroup>

    <FormGroup className="form-group mt-3">
      <DateRangePicker
        type='text'
        placeholder={`${t('Start', {ns: 'common'})} ${t('Date', {ns: 'common'})} | ${t('End', {ns: 'common'})} ${t('Date', {ns: 'common'})}`}
        className={`${getError('dateRange', errors, errors)}`}
        setDates={handleDateRangePicker}
        defaultDateRange={dateRange}
        isTooltipInput={true}
        showIcons={true}
        onChange={(dates) => {validateField('dateRange', dates)}}
      />
      {getError('dateRange', errors, errors, false)}
    </FormGroup>
    <FormGroup className="form-group mt-3">
      <MapInput
        id="coordinates-input"
        className={`${getError('coordinates', errors, errors)}`}
        type='textarea'
        name="coordinates-value"
        placeholder={t('Map Selection', { ns: 'chatBot' })}
        rows="10"
        coordinates={coordinates}
        setCoordinates={setCoordinates}
        isValidFormat={isValidCoordFormat}
        onBlur={() => { validateCoord(); }}
      />
      {getError('coordinates', errors, errors, false)}
    </FormGroup>
    <div className='mt-3'>
      <Label className='fw-bold' htmlFor="target">{t('assign-to')}: </Label>
      <Row>
        <Col><Label className='form-label mt-3 mb-0'>{t('organisation')}: {orgName}</Label></Col>
        <Col>
          <Input
            id="team"
            className="btn-sm sort-select-input"
            name="team"
            type="select"
            onChange={(e) => {
              setTeamId(e.target.value);
              if (!e.target.value) {
                setChatbotUserId('');
              }
            }}
            value={teamId}
          >
            <option value={''} >--{t('team')}--</option>
            {
              teamList?.map(team => {
                return (
                  <option key={team.id} value={team.id}>{team.name}</option>
                )
              })
            }
          </Input>
        </Col>
        <Col>
          <Input
            id="chatbotUser"
            className="btn-sm sort-select-input"
            name="chatbotUser"
            type="select"
            disabled={!teamId}
            onChange={(e) => { setChatbotUserId(e.target.value); validate(); }}
            value={chatbotUserId}
          >
            <option value={''} >--{t('chatbot-user')}--</option>
            {
              teamList?.find(team => team.id == teamId)?.members.map(member => {
                return (
                  <option key={member.id} value={member.id}>{member.name}</option>
                )
              })
            }
          </Input>
        </Col>
      </Row>

    </div>
    <FormGroup className="form-group mt-3">
      <Input
        id="mission-description-input"
        className={`${getError('desc', errors, errors)}`}
        type='textarea'
        name="mission-description"
        placeholder={t('mission-desc', { ns: 'chatBot' })}
        onChange={(e) => {setDesc(e.target.value)}}
        onBlur={(e)=>{validateField('desc', e.target.value)}}
        value={desc}
        rows="10"
      />
      {getError('desc', errors, errors, false)}
    </FormGroup>
    <div className='mt-3'>
      <Button
        type="button"
        onClick={onCancel}
      >
        {t('cancel')}
      </Button>
      <Button
        type="button"
        className="mx-3"
        onClick={submitMsg}
      >
        {t('send')}
      </Button>
    </div>
  </>)
}

CreateMission.propTypes = {
  coordinates: PropTypes.any,
  onCancel: PropTypes.func,
  t: PropTypes.any,
  setCoordinates: PropTypes.func
}

export default withTranslation(['common'])(CreateMission);
