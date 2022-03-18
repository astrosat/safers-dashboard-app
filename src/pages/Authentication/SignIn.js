import React, { useEffect, useState } from 'react';
import { signIn, isRemembered } from '../../store/appAction';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { Button, Col, Form, FormGroup, Input, InputGroup, InputGroupText, Label, Row, } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getGeneralErrors, getError }  from '../../helpers/errorHelper'
import * as Yup from 'yup'

const SignIn = () => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const genError = useSelector(state => state.auth.errorSignIn);
  const [passwordToggle, setPasswordToggle] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
    else {
      dispatch(isRemembered());
    }
  }, [isLoggedIn]);

  const signInSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('The field cannot be empty'),
    password: Yup.string()
      .required('The field cannot be empty'),
  });

  return (
    <Formik
      initialValues={{ email: '', password: '', rememberMe: false }}
      validationSchema={signInSchema}
      onSubmit={(values, { setSubmitting }) => {
        dispatch(signIn(values));
        setSubmitting(false);
      }}
      id="login-form"
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
        <div className="jumbotron">
          {getGeneralErrors(genError)}
          <div className="container auth-form" data-test="signInComponent">
            <Form onSubmit={handleSubmit} noValidate>
              <Row form>
                <Col>
                  <FormGroup className="form-group">
                    <Label for="userEmail">
                      EMAIL ADDRESS:
                    </Label>
                    <Input
                      id="userEmail"
                      className={getError('email', errors, touched)}
                      name="email"
                      placeholder="email address"
                      type="email"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.email}
                      autoComplete="on"
                      data-testid="sign-in-email"
                    />
                    {getError('email', errors, touched, false)}
                  </FormGroup>
                </Col>
                <Col >
                  <FormGroup className="form-group">
                    <Label for="userPassword">
                      PASSWORD:
                    </Label>
                    <InputGroup>
                      <Input
                        id="userPassword"
                        className={getError('password', errors, touched)}
                        name="password"
                        placeholder="password"
                        type={passwordToggle ? 'text' : 'password'}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        autoComplete="on"
                        data-testid="sign-in-password"
                      />
                      <InputGroupText>
                        <i data-testid="password-toggle" onClick={() => { setPasswordToggle(!passwordToggle) }} className={`fa ${passwordToggle ? 'fa-eye-slash' : 'fa-eye'}`} />
                      </InputGroupText>
                    </InputGroup>
                    {getError('password', errors, touched, false)}
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup className="form-group" check>
                <Input
                  id="rememberMe"
                  data-testid="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  value={values.rememberMe}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <Label
                  check
                  for="rememberMe"
                >
                  Remember Me
                </Label>
              </FormGroup>
              <div className="form-group center-sign-in">
                <Button
                  className="sign-in-btn"
                  color="primary"
                  data-testid="signInButton"
                  disabled={isSubmitting}>
                  SIGN IN
                </Button>

              </div>
              <div className="mt-1 center-sign-in">
                <Link to="/auth/forgot-password" className="text-muted">
                  Forgot password?
                </Link>
              </div>
            </Form>
          </div>
        </div>
      )}
    </Formik>
  );
}

export default SignIn;
