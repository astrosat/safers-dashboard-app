import React, { useRef } from 'react';

import classnames from 'classnames';
import PropTypes from 'prop-types';
import Flatpickr from 'react-flatpickr';
import { InputGroup } from 'reactstrap';

const DatePicker = ({
  setDate,
  date,
  showIcons = false,
  isTooltipInput = false,
}) => {
  const fp = useRef(null);
  return (
    <div className="mb-0 w-100" style={{ border: '1px solid' }}>
      <InputGroup>
        {showIcons && (
          <div className="bg-white d-flex border-none calender-left">
            <i className="fa fa-calendar px-2 m-auto calender-icon "></i>
          </div>
        )}

        <Flatpickr
          className={classnames(
            {
              'tootip-input': isTooltipInput,
            },
            'w-100 form-control',
          )}
          placeholder="dd/mm/yy"
          ref={fp}
          value={date}
          onChange={([date]) => {
            setDate(date);
          }}
          options={{
            mode: 'single',
            dateFormat: 'M d Y',
          }}
        />

        {showIcons && (
          <div
            className="bg-white d-flex border-none calender-right"
            onClick={() => {
              fp.current.flatpickr.clear();
            }}
          >
            <i className="fa fa-sync px-2 m-auto bg-white border-none"></i>
          </div>
        )}
      </InputGroup>
    </div>
  );
};

DatePicker.propTypes = {
  setDate: PropTypes.func,
  showIcons: PropTypes.bool,
  isTooltipInput: PropTypes.bool,
  date: PropTypes.any,
};

export default DatePicker;
