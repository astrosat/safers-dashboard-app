import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardBody, CardTitle, Form, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import { Formik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { resetProfilePsw } from '../../store/appAction';
import { passwordHelper, pwdRegEx, pwdValidationTxt } from '../../helpers/passwordHelper'
import { getGeneralErrors, getError } from '../../helpers/errorHelper'
import toastr from 'toastr';
import 'toastr/build/toastr.min.css'

//i18n
import { withTranslation } from 'react-i18next'

const ResetPsw = ({ t }) => {
  const resetPswSuccessRes = useSelector(state => state.user.resetPswSuccessRes);
  const error = useSelector(state => state.user.resetPswFailRes);
  const config = useSelector(state => state.common.config);
  const [passwordToggle, setPasswordToggle] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (resetPswSuccessRes?.detail) {
      toastr.success(resetPswSuccessRes.detail, '');
    }
  }, [resetPswSuccessRes]);

  const pswResetSchema = Yup.object().shape({
    old_password: Yup.string()
      .required(t('field-empty-err', { ns: 'common' })),
    new_password1: Yup.string()
      .matches(
        pwdRegEx,
        pwdValidationTxt
      )
      .required(t('field-empty-err', { ns: 'common' })),
    new_password2: Yup.string()
      .oneOf([Yup.ref('new_password1')], t('psw-match-err', { ns: 'common' })),
  });

  return (
    <Row data-testid='change-password'>
      <Col lg={12}>
        <Card color="dark default-panel">
          <CardBody>
            <CardTitle className="mb-2 dflt-seperator">
              <h3 className="h5 mb-0">{t('Personal Details')}</h3>
            </CardTitle>
            <Formik
              initialValues={{
                old_password: '',
                new_password1: '',
                new_password2: '',
              }}
              validationSchema={pswResetSchema}
              onSubmit={(values, { setSubmitting }) => {
                dispatch(resetProfilePsw(values));
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
                handleReset,
              }) => (
                <Form className='p-3' onSubmit={handleSubmit} noValidate>
                  {config?.allow_password_change ?
                    <>
                      <Row form>
                        {getGeneralErrors(error)}
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label htmlFor="formrow-email-Input">{t('current-password')}</Label>
                              <InputGroup>
                                <Input
                                  type={passwordToggle ? 'text' : 'password'}
                                  id="old_password"
                                  className={getError('old_password', errors, touched)}
                                  name="old_password"
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.old_password}
                                  autoComplete="on"
                                  data-testid="old_password"
                                />
                                <InputGroupText>
                                  <i data-testid="sign-up-password-toggle" onClick={() => { setPasswordToggle(!passwordToggle) }} className={`fa ${passwordToggle ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </InputGroupText>
                              </InputGroup>
                              {getError('old_password', errors, touched, false)}
                            </div>
                          </Col>
                        </Row>
                        <Row>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label htmlFor="formrow-password-Input">{t('new-password')}</Label>
                              <InputGroup>
                                <Input
                                  id="new_password1"
                                  className={errors.new_password1 ? 'is-invalid' : ''}
                                  name="new_password1"
                                  placeholder="new password"
                                  type={passwordToggle ? 'text' : 'password'}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.new_password1}
                                  autoComplete="on"
                                  data-testid="new_password"
                                />
                                <InputGroupText>
                                  <i data-testid="sign-up-password-toggle" onClick={() => { setPasswordToggle(!passwordToggle) }} className={`fa ${passwordToggle ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </InputGroupText>
                              </InputGroup>
                              {values.new_password1 && (<>{passwordHelper(values.new_password1)}</>)}
                              {getError('new_password1', errors, touched, false)}
                            </div>
                          </Col>
                          <Col md={6}>
                            <div className="mb-3">
                              <Label htmlFor="formrow-password-Input">{t('confirm-password')}</Label>
                              <InputGroup>
                                <Input
                                  id="new_password2"
                                  className={getError('new_password2', errors, touched)}
                                  name="new_password2"
                                  placeholder="confirm password"
                                  type={passwordToggle ? 'text' : 'password'}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.new_password2}
                                  autoComplete="on"
                                  data-testid="confirm_password"
                                />
                                <InputGroupText>
                                  <i data-testid="sign-up-password-toggle" onClick={() => { setPasswordToggle(!passwordToggle) }} className={`fa ${passwordToggle ? 'fa-eye-slash' : 'fa-eye'}`} />
                                </InputGroupText>
                              </InputGroup>
                              {getError('new_password2', errors, touched, false)}
                            </div>
                          </Col>
                        </Row>
                        <div className='mt-2 text-end'>
                          <button type="submit" data-test-id="changePasswordUpdateBtn" className="btn btn-primary w-md me-2" disabled={isSubmitting}>
                            {t('change-password')}
                          </button>
                          <button type="button" onClick={handleReset} className="btn btn-secondary w-md">
                            {t('clear', { ns: 'common' })}
                          </button>
                        </div>
                      </Row>
                    </>
                    :
                    <>
                      <h5>{t('change-psw-not-available', { ns: 'common' })}</h5>
                    </>
                  }
                </Form>
              )}
            </Formik >
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

ResetPsw.propTypes = {
  t: PropTypes.any,
}


export default withTranslation(['myprofile'])(ResetPsw);
