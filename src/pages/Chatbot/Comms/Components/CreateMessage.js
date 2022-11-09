import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types'
import {
  Input,
  Button,
  Label,
  Row,
  Col,
  FormGroup
} from 'reactstrap';
import DateRangePicker from '../../../../components/DateRangePicker/DateRange';
import MapInput from '../../../../components/BaseMap/MapInput';
import { createMsg, resetCommsResponseState } from '../../../../store/comms/action';
import { getError } from '../../../../helpers/errorHelper';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import _ from 'lodash';
import moment from 'moment'

import toastr from 'toastr';
import 'toastr/build/toastr.min.css'

const CreateMessage = ({ coordinates, onCancel, setCoordinates }) => {

  const dispatch = useDispatch();

  const { t } = useTranslation();
  const { orgList = [] } = useSelector(state => state.common);
  const { info: user } = useSelector(state => state.user);
  const { msgCreated } = useSelector(state => state.comms);

  const [orgName, setorgName] = useState('');
  const [scope, setScope] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [desc, setDesc] = useState(null);
  const [errors, setErrors] = useState({});
  const [restriction, setRestriction] = useState(undefined);
  const [validCoords, isValidCoordFormat] = useState(false);

  const resetState = () => {
    setScope('');
    setDateRange(null);
    setScope('');
    setDesc(null);
    setRestriction(undefined);
  }

  useEffect(() => {
    if (orgList.length && user?.organization) {
      const organization = _.find(orgList, { id: user.organization });
      setorgName(organization.name.split('-')[0])
    }
  }, [orgList, user]);

  useEffect(() => {
    if (msgCreated) {
      toastr.success(msgCreated.msg, '');
      resetState();
      onCancel();
    }

  }, [msgCreated]);

  useEffect(() => {
    if(coordinates){
      validateCoord();
    }
  }, [coordinates, validCoords]);

  //Clear success states on component unmount
  useEffect(() => {
    return () => {
      dispatch(resetCommsResponseState());
    };
  }, []);

  const handleDateRangePicker = (dates) => {
    setDateRange(dates.map(date =>
      moment(date).format('YYYY-MM-DD'))
    );
  }

  const validateRestriction = (returnErr=false) => {
    const tempError = {...errors};
    if (scope && scope == 'Restricted' && (!restriction || restriction === '')) {
      tempError['restriction'] = t('field-empty-err', { ns: 'common' });
    } 
    else {
      delete tempError['restriction'];
    }
    if(returnErr){
      return tempError;
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

  const validateField = (attrib, val, returnErr=false) => {
    const tempError = {...errors};
    if(!val || val == ''){
      tempError[attrib] = attrib === 'dateRange' ? t('field-err-valid-date', { ns: 'common' }) : t('field-empty-err', { ns: 'common' });
    }
    else {
      delete tempError[attrib];
    }

    if(returnErr){
      return tempError
    }
    setErrors(tempError);
  }

  const validate = () => {
    const valDateRange = validateField('dateRange', dateRange, true);
    const valDesc = validateField('desc', desc, true);
    const valScope = validateField('scope', scope, true);
    const valRestriction =  validateRestriction(true);
    const valCoordinates = validateCoord(true);
    const tempErrors = {...valDateRange, ...valDesc, ...valScope, ...valRestriction, ...valCoordinates};
    setErrors(tempErrors);
  }

  const submitMsg = () => {
    validate();
    if (Object.keys(errors).length === 0) {
      const payload = {
        message: desc,
        start: dateRange[0] ? dateRange[0] : null,
        end: dateRange[1] ? dateRange[1] : null,
        scope,
        restriction,
        geometry: coordinates ? coordinates : null
      }
      dispatch(createMsg(payload))
    }
  }

  return (
    <>
      <FormGroup className="form-group mt-3">
        <DateRangePicker
          type='text'
          placeholder={`${t('Start', {ns: 'common'})} ${t('Date', {ns: 'common'})} | ${t('End', {ns: 'common'})} ${t('Date', {ns: 'common'})}`}
          className={`${getError('dateRange', errors, errors)}`}
          setDates={handleDateRangePicker}
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
          onBlur={()=> { validateCoord(); }}
        />
        {getError('coordinates', errors, errors, false)}
      </FormGroup>
      <Label className='form-label mt-3 mb-0'>{t('organisation', {ns: 'common'})}: {orgName}</Label>
      <Row className='my-3'>
        <Col xl={1} md={2}><Label htmlFor="target">{t('target' , {ns: 'common'})}: </Label></Col>
        <Col xl={5} className="pe-xl-0 text-center">
          <Input
            id="scope"
            className={`btn-sm sort-select-input me-2 mb-2 ${getError('scope', errors, errors)}`}
            name="scope"
            type="select"
            onChange={(e) => { setScope(e.target.value) }}
            onBlur={(e) => {validateField('scope', e.target.value)}}
          >
            <option value="">--{t('scope', {ns: 'common'})}--</option>
            <option value="Public">{t('public', {ns: 'common'})}</option>
            <option value="Restricted">{t('restricted', {ns: 'common'})}</option>
          </Input>
          {getError('scope', errors, errors, false)}
        </Col>
        {scope === 'Restricted' && <Col xl={5}>
          <Input
            id="restriction"
            className={`btn-sm sort-select-input ${getError('restriction', errors, errors)}`}
            name="restriction"
            type="select"
            onChange={(e) => { setRestriction(e.target.value) }}
            onBlur={validateRestriction}
            value={restriction}
          >
            <option value="">--{t('Restrictions')}--</option>
            <option value="Citizen">{t('Citizen')}</option>
            <option value="Professional">{t('Professional')}</option>
            <option value="Organization">{t('Organisation')}</option>
          </Input>
          {getError('restriction', errors, errors, false)}
        </Col>}
      </Row>
      <FormGroup className="form-group mt-3">
        <Input
          id="message-description-input"
          className={`${getError('desc', errors, errors)}`}
          type='textarea'
          name="message-description"
          placeholder={t('msg-desc', { ns: 'chatBot' })}
          onChange={(e) => { setDesc(e.target.value); }}
          onBlur={(e) => {validateField('desc', e.target.value)}}
          rows="10"
        />
        {getError('desc', errors, errors, false)}
      </FormGroup>
      <div className='mt-3'>
        <Button
          type="button"
          onClick={onCancel}
        >
          {t('cancel', { ns: 'common' })}
        </Button>
        <Button
          type="button"
          className="mx-3"
          onClick={submitMsg}
        >
          {t('send', { ns: 'common' })}
        </Button>
      </div>
    </>
  )
}

CreateMessage.propTypes = {
  coordinates: PropTypes.any,
  onCancel: PropTypes.func,
  setCoordinates: PropTypes.func
}

export default CreateMessage;
