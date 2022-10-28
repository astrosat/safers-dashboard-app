import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import Flatpickr from 'react-flatpickr'
import { Spanish  } from 'flatpickr/dist/l10n/es.js'
import { German } from 'flatpickr/dist/l10n/de.js'
import { Italian } from 'flatpickr/dist/l10n/it.js'
import { French } from 'flatpickr/dist/l10n/fr.js'
import { InputGroup } from 'reactstrap';

import 'react-datepicker/dist/react-datepicker.css';
import 'flatpickr/dist/themes/material_blue.css'

//i18n
import { withTranslation } from 'react-i18next'


const DateComponent = ({ 
  setDates = () => { }, 
  clearDates = () => { },
  resetDates = () => { },
  defaultDateRange,
  placeholder=null,
  isDateRangeDisabled=false,
  onChange= () => {},
  i18n
}) => {
  const fp = useRef(null);
  const [trsnalation, setTrsnalation] = useState(undefined)

  useEffect(() => {
    let lang = null;
    switch(i18n.language){
    case 'fr':
      lang = French;
      break;
    case 'es':
      lang = Spanish;
      break;
    case 'de':
      lang = German;
      break;
    case 'it':
      lang = Italian;
      break;
    default:
      lang = undefined;
    }
    setTrsnalation(lang);
  }, [i18n.language])

  const defaultDate = defaultDateRange?.map(date => 
    moment(date).format('DD/MM/YY')
  ) ?? []

  const onClearClick = () => {
    if(!isDateRangeDisabled) {
      const picker = fp.current.flatpickr;
      picker.setDate(defaultDate);
      resetDates();
    }
  }
  return (
    <div className={`mb-0 ${isDateRangeDisabled? 'custom-disabled-container' : ''}`}>
      <InputGroup>
        <div className='bg-white d-flex border-none calender-left'>
          <i className='fa fa-calendar px-2 m-auto calender-icon '></i>
        </div>

        <Flatpickr
          className="form-control d-block"
          placeholder={placeholder ? placeholder : 'dd/mm/yy'}
          ref={fp}
          onChange={(dates) => {
            dates.length > 1 && setDates(dates);
            dates.length == 0 && clearDates();
            onChange(dates);
          }}
          disabled={isDateRangeDisabled}
          options={{
            mode: 'range',
            dateFormat: 'd/m/y',
            defaultDate,
            locale: trsnalation
          }}
        />

        <div 
          className='bg-white d-flex border-none calender-right' 
          onClick={onClearClick}
        >
          <i className='fa fa-sync px-2 m-auto bg-white border-none'></i>
        </div>
      </InputGroup>
    </div>
  );
};

DateComponent.propTypes = {
  setDates: PropTypes.func,
  onChange: PropTypes.func,
  clearDates: PropTypes.func,
  resetDates: PropTypes.func,
  defaultDateRange: PropTypes.array,
  placeholder: PropTypes.string,
  isDateRangeDisabled: PropTypes.bool,
  i18n: PropTypes.object
}

export default withTranslation(['common'])(DateComponent)
