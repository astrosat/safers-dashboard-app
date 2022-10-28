import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types'
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

import { signOut } from '../../store/appAction';

//i18n
import { withTranslation } from 'react-i18next';

// users
import user1 from '../../assets/images/users/profile.png'

const ProfileMenu = props => {
  // Declare a new state variable, which we'll call 'menu'
  const [menu, setMenu] = useState(false);  

  const dispatch = useDispatch();
  const { username } = useSelector(state => state.user.info);


  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className='d-inline-block'
      >
        <DropdownToggle
          className='btn header-item '
          id='page-header-user-dropdown'
          tag='button'
        >
          <img
            className='rounded-circle header-profile-user'
            src={user1}
            alt='Header Avatar'
          />
          <span className='d-none d-xl-inline-block ms-2 me-1 text-capitalize'>{username}</span>
          <i className='mdi mdi-chevron-down d-none d-xl-inline-block' />
        </DropdownToggle>
        <DropdownMenu className='dropdown-menu-end'>
          <DropdownItem tag='a' href='/my-profile/view'>
            {' '}
            <i className='bx bx-user font-size-16 align-middle me-1' />
            <span className="text-capitalize">{props.t('profile')}{' '}</span>
          </DropdownItem>
          <div className='dropdown-divider' />
          <DropdownItem className='clickable' tag='span' onClick={() => { dispatch(signOut()) }}>
            {' '}
            <i className='bx bx-power-off font-size-16 align-middle me-1 text-danger logout' />
            <span className="text-capitalize">{props.t('logout')}{' '}</span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any
}


export default withTranslation(['common'])(ProfileMenu)
