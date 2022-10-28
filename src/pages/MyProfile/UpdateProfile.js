import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardBody, CardTitle, Media, Form, Label, Input, Modal } from 'reactstrap';
import avatar from '../../assets/images/users/profile.png';
import { Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import { getInfo, updateInfo, uploadProfImg, getRoleList, getOrgList, deleteAccount, signOut, resetStatus } from '../../store/appAction';
import { getGeneralErrors, getError } from '../../helpers/errorHelper';
import _ from 'lodash';

import countryList from 'country-list';
import * as Yup from 'yup';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'

//i18n
import { withTranslation } from 'react-i18next'


const UpdateProfile = ({ t }) => {
  toastr.options = {
    preventDuplicates: true,
  }

  const { id } = useSelector(state => state.user.info);
  const { uploadFileSuccessRes, deleteAccSuccessRes, uploadFileFailRes, deleteAccFailRes, updateStatus, info: user, defaultAoi } = useSelector(state => state.user);
  const { orgList = [], roleList: roles = [] } = useSelector(state => state.common);
  const [modal_backdrop, setmodal_backdrop] = useState(false);
  const [orgName, setorgName] = useState('');
  const [citizenId, setcitizenId] = useState('');
  const [currentRole, setCurrentRole] = useState(null);

  const formInit = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    organization: user?.organization || '',
    country: user?.country || '',
    city: user?.city || '',
    role: user?.role || '',
    address: user?.address || ''
  };
  const [error, setError] = useState(false);
  const fileUploader = useRef(null);
  const dispatch = useDispatch();

  const countryNames = countryList.getNames().sort();

  useEffect(() => {
    dispatch(getInfo(id))
    if (roles.length === 0)
      dispatch(getRoleList());
    if (orgList.length === 0)
      dispatch(getOrgList());
  }, []);

  if (uploadFileSuccessRes?.detail) {
    toastr.success(uploadFileSuccessRes.detail, '');
  }
  useEffect(() => {
    if (user && roles.length) {
      const currentRoleObj = _.find(roles, { id: user.role });
      if (currentRoleObj) {
        setCurrentRole(currentRoleObj.name);
      }
      const objCitizen = _.find(roles, { name: 'citizen' });
      setcitizenId(objCitizen.id)

    }
  }, [user, roles]);

  useEffect(() => {
    if (updateStatus) {
      toastr.success(t('updated-info', { ns: 'common' }), '');
      dispatch(resetStatus());
    }
  }, [updateStatus]);

  if (deleteAccSuccessRes) {
    dispatch(signOut());
  }

  useEffect(() => {
    const error = uploadFileFailRes ? uploadFileFailRes : (deleteAccFailRes ? deleteAccFailRes : false);
    setError(error);
  }, [uploadFileFailRes, deleteAccFailRes]);

  useEffect(() => {
    if (orgList.length && user?.organization) {
      const organization = _.find(orgList, { id: user.organization });
      setorgName(organization.name.split('-')[0])
    }
  }, [orgList, user]);

  const onChangeFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    var file = event.target.files[0];
    dispatch(uploadProfImg(file));
  }


  const confirmAccDelete = () => {
    dispatch(deleteAccount(id));
    setmodal_backdrop(false);
  }

  const tog_modal = () => {
    setmodal_backdrop(!modal_backdrop);
    removeBodyCss();
  }

  const removeBodyCss = () => {
    document.body.classList.add('no_padding');
  }

  const handleClick = () => {
    fileUploader.current.click();
  }
  
  const myProfileSchema = Yup.object().shape({
    first_name: Yup.string()
      .required(t('field-empty-err', { ns: 'common' })),
    last_name: Yup.string()
      .required(t('field-empty-err', { ns: 'common' })),
    role: Yup.string()
      .required(t('field-empty-err', { ns: 'common' })),
  })
    .when((values, schema) => {
      if (values.role !== citizenId) {
        return schema.shape({
          organization: Yup.string().required(t('field-empty-err', { ns: 'common' })),
        });
      }
    });

  if (!user) {
    return null;
  }

  return (
    <>
      <Row>
        <Col lg={12}>
          {getGeneralErrors(error)}
        </Col>
      </Row>
      <Row>
        <Col lg={4}>
          <Card color="dark default-panel">
            <CardBody>
              <CardTitle className="mb-2 dflt-seperator pb-3">
                <Media>
                  <div className="ms-3">
                    <img
                      src={avatar}
                      alt=""
                      className="avatar-md rounded-circle img-thumbnail"
                    />
                    <div className='text-center mt-2 d-none'><a className='lnk-edit' onClick={(e) => { handleClick(e) }}>{t('Edit Image')}</a></div>
                    <input type="file" id="file" ref={fileUploader} style={{ display: 'none' }} onChange={(e) => { onChangeFile(e) }} />
                  </div>
                  <Media body className="ms-4 align-self-center">
                    <h1 className="h5">{user.first_name} {user.last_name}</h1>
                    <h2 className="h6">{currentRole}</h2>
                  </Media>
                </Media>
              </CardTitle>
              <div className="p-4">
                <Row className='prof-list'>
                  <Col md="6" className='p-2 dflt-seperator'>
                    <i className='bx bx-mail-send me-2'></i><span>{t('Email')}</span>
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    {user.email}
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    <i className='bx bx-map me-2'></i><span>{t('Location', { ns: 'common' })}</span>
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    {user.address && user.address.length > 0 ? `${user.address}, ` : ''}{user.city && user.city.length > 0 ? `${user.city}, ` : ''}{user.country && user.country.length > 0 ? `${user.country}` : ''}
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    <i className='bx bx-shopping-bag me-2'></i><span>{t('Organization', { ns: 'common' })}</span>
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    {orgName}
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    <i className='bx bx-flag me-2'></i><span>{t('Area of Interest', { ns: 'common' })}</span>
                  </Col>
                  <Col md="6" className='p-2 dflt-seperator'>
                    {defaultAoi?.features[0].properties.name}
                  </Col>
                </Row>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col lg={8}>
          <Card color="dark default-panel">
            <CardBody>
              <CardTitle className="mb-2 dflt-seperator">
                <h3 className="h5 mb-0">{t('Personal Details')}</h3>
              </CardTitle>
              <Formik
                enableReinitialize={true}
                initialValues={formInit}
                validationSchema={myProfileSchema}
                onSubmit={(values, { setSubmitting }) => {
                  dispatch(updateInfo(id, values, values.role === citizenId));
                  setSubmitting(false);
                }}
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
                  <Form className='p-3' onSubmit={handleSubmit} noValidate>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-email-Input">{t('First Name')}</Label>
                          <Input
                            type="text"
                            id="first_name"
                            className={getError('first_name', errors, touched)}
                            name="first_name"
                            placeholder="First name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.first_name}
                            autoComplete="on"
                            data-testid="update-profile-firstName"
                          />
                          {getError('first_name', errors, touched, false)}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="clearfix mb-3">
                          <Label htmlFor="formrow-password-Input">{t('Last Name')}</Label>
                          <Input
                            type="text"
                            id="last_name"
                            className={getError('last_name', errors, touched)}
                            name="last_name"
                            placeholder="Last name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.last_name}
                            autoComplete="on"
                            data-testid="update-profile-lastName"
                          />
                          {getError('last_name', errors, touched, false)}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-password-Input">{t('Organization', { ns: 'common' })}</Label>
                          <Input
                            type="select"
                            id="organization"
                            className={getError('organization', errors, touched)}
                            name="organization"
                            placeholder="organization"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={values.role === citizenId}
                            value={values.role === citizenId ? '' : values.organization}
                            autoComplete="on"
                            data-testid="update-profile-org"
                          >
                            <option value={''} >{values.role === citizenId ? 'N/A' : '--Select organisation--'}</option>
                            {orgList.map((org, index) => { return (<option key={index} value={org.id}>{org.name}</option>) })}
                          </Input>
                          {getError('organization', errors, touched, false)}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-password-Input">{t('Country')}</Label>
                          <Input
                            id="country"
                            className={getError('country', errors, touched)}
                            name="country"
                            placeholder="select country"
                            type="select"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.country}
                            data-testid="update-profile-country"
                          >
                            <option value={''} >--{t('Select your country')}--</option>
                            {countryNames.map((countryName) => { return (<option key={countryName} value={countryName}>{countryName}</option>) })}
                          </Input>
                          {getError('country', errors, touched, false)}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-password-Input">{t('City')}</Label>
                          <Input
                            type="text"
                            id="city"
                            className={getError('city', errors, touched)}
                            name="city"
                            placeholder="city"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.city}
                            autoComplete="on"
                            data-testid="update-profile-city"
                          />
                          {getError('city', errors, touched, false)}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-password-Input">{t('Role')}</Label>
                          <Input
                            id="role"
                            className={getError('role', errors, touched)}
                            name="role"
                            placeholder="select role"
                            type="select"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.role}
                            data-testid="update-profile-role"
                          >
                            <option value={''} >--{t('Select your role')}--</option>
                            {roles.map((roleObj, index) => { return (<option key={index} value={roleObj.id}>{roleObj.label}</option>) })}
                          </Input>
                          {getError('role', errors, touched, false)}
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <Label htmlFor="formrow-password-Input">{t('Address')}</Label>
                          <Input
                            type="text"
                            id="address"
                            className={getError('address', errors, touched)}
                            name="address"
                            placeholder="address"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            value={values.address}
                            autoComplete="on"
                            data-testid="update-profile-address"
                          />
                          {getError('address', errors, touched, false)}
                        </div>
                      </Col>
                    </Row>
                    <div className='text-center'>
                      <button type="submit" data-testid="updateProfileButton" className="btn btn-primary w-md me-2" disabled={isSubmitting}>
                        {t('update-details')}
                      </button>
                      <button type="button" className="btn btn-secondary w-md"
                        onClick={() => {
                          tog_modal()
                        }}
                        data-toggle="modal">
                        {t('delete-account')}
                      </button>
                      <Modal
                        isOpen={modal_backdrop}
                        toggle={() => {
                          tog_modal()
                        }}
                        scrollable={true}
                        id="staticBackdrop"
                      >
                        <div className="modal-header">
                          <h5 className="modal-title" id="staticBackdropLabel">{t('Warning', { ns: 'common' })}!</h5>
                          <button type="button" className="btn-close"
                            onClick={() => {
                              setmodal_backdrop(false)
                            }} aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                          <p>{t('confirm-delete-text')}.</p>
                        </div>
                        <div className="modal-footer">
                          <button type="button" className="btn btn-light" onClick={() => {
                            setmodal_backdrop(false)
                          }}>{t('Close', { ns: 'common' })}</button>
                          <button type="button" className="btn btn-primary" onClick={() => { confirmAccDelete() }}>{t('Yes', { ns: 'common' })}</button>
                        </div>
                      </Modal>
                    </div>
                  </Form>
                )}
              </Formik >
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}

UpdateProfile.propTypes = {
  t: PropTypes.any,
}

export default withTranslation(['myprofile'])(UpdateProfile);
