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
import { createMsg } from '../../../../store/comms/action';
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
    }

  }, [msgCreated]);

  useEffect(() => {
    if (dateRange) {// On blur validation after setting values
      validate();
    }

  }, [scope, dateRange, desc, restriction, coordinates, validCoords]);

  const handleDateRangePicker = (dates) => {
    setDateRange(dates.map(date =>
      moment(date).format('YYYY-MM-DD'))
    );
  }


  const validate = () => {
    let errors = {};

    if (!desc)
      errors['desc'] = 'This field is required';

    if (!scope || scope === '')
      errors['scope'] = 'This field is required';

    if (scope && scope == 'Restricted' && (!restriction || restriction === '')) {
      errors['restriction'] = 'This field is required';
    }

    if (!coordinates) {
      errors['coordinates'] = 'Please select your area on the map';
    }
    else if (!validCoords) {
      errors['coordinates'] = 'Please correct your coordinates';
    }


    if (!dateRange)
      errors['dateRange'] = 'Please select start/end date';

    setErrors(errors);
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
          placeholder='Start Date | End date'
          className={`${getError('dateRange', errors, errors)}`}
          setDates={handleDateRangePicker}
          isTooltipInput={true}
          showIcons={true}
        />
        {getError('dateRange', errors, errors, false)}
      </FormGroup>
      <FormGroup className="form-group mt-3">
        <MapInput
          id="coordinates-input"
          className={`${getError('coordinates', errors, errors)}`}
          type='textarea'
          name="coordinates-value"
          placeholder='Map Selection, please edit and draw on the map'
          rows="10"
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          isValidFormat={isValidCoordFormat}
        />
        {getError('coordinates', errors, errors, false)}
      </FormGroup>
      <Label className='form-label mt-3 mb-0'>{t('Organisation')}: {orgName}</Label>
      <Row className='my-3'>
        <Col xl={1} md={2}><Label htmlFor="target">{t('Target')}: </Label></Col>
        <Col xl={5} className="pe-xl-0 text-center">
          <Input
            id="scope"
            className={`btn-sm sort-select-input me-2 mb-2 ${getError('scope', errors, errors)}`}
            name="scope"
            type="select"
            onChange={(e) => { setScope(e.target.value) }}
          >
            <option value="">--{t('Scope')}--</option>
            <option value="Public">{t('Public')}</option>
            <option value="Restricted">{t('Restricted')}</option>
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
          placeholder='Message Description'
          onChange={(e) => { setDesc(e.target.value); }}
          rows="10"
        />
        {getError('desc', errors, errors, false)}
      </FormGroup>
      <div className='mt-3'>
        <Button
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="mx-3"
          onClick={submitMsg}
        >
          Send
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
