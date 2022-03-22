import React, { useEffect } from 'react';
import { isRemembered } from '../../store/appAction';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import { Button, Col, Form, Row, } from 'reactstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGeneralErrors }  from '../../helpers/errorHelper'
import { signInOauth2 } from '../../store/authentication/action';


/* 
The `authorize` fn gets the authorization_code from the Authentication Server
which redirects back to this page w/ that code.  It is run when the SSO button
is clicked.

The `OAuth2` component looks for a code; if it finds one it calls `signInOauth2`
which tries to exchange that code for a token from the API.
*/

const DEFAULT_PAGE = 'sign-in';

const authorize = () => {

  // TODO: get these from config...
  const CLIENT_BASE_URL = 'http://localhost:3000'
  const AUTH_BASE_URL = 'http://localhost:9011'
  const AUTH_CLIENT_ID = '24c3750b-088a-43d0-af23-781258e6e78c'

  const params = {
    response_type: 'code',
    client_id: AUTH_CLIENT_ID,
    redirect_uri: `${CLIENT_BASE_URL}/auth/${DEFAULT_PAGE}`,
    locale: 'en',
    // tenant_id: 'whatever',
    // state: 'whatever',
    scope: 'offline_access',
  };
  const urlParams = new URLSearchParams(params).toString();
  window.location = `${AUTH_BASE_URL}/oauth2/authorize?${urlParams}`;
};

// const authenticate = (authCode) => async (dispatch) => {

//   const response = await fetch(`${API_BASE_URL}/api/oauth2/login`, {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       code: authCode,
//     })
//   })
//   const content = await response.json()
//   if (response.status === 200) {
//     const sessionData = {
//       access_token: content.token,
//       userId: content.user.id 
//     }
//     setSession(sessionData)  
//     if (content.user.default_aoi) {
//       dispatch(setAoiBySignInSuccess(content.user.default_aoi))
//     }
//     dispatch(signInSuccess(content.user))
//   }
//   dispatch(signInFail(content))


//   console.log(content)
// }

const OAuth2 = () => {
  const isLoggedIn = useSelector(state => state.auth.isLoggedIn);
  const genError = useSelector(state => state.auth.errorSignIn);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // check if we've been passed a code
  const location = useLocation();
  const queryString = location.search;
  const params = new URLSearchParams(queryString);
  const authCode = params.get('code')
  if (authCode) {
    console.log(authCode)
    dispatch(signInOauth2({authCode}));
  }

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard');
    }
    else {
      dispatch(isRemembered());
    }
  }, [isLoggedIn]);
  
  return (
    <Formik
      initialValues={{ }}
      onSubmit={({ setSubmitting }) => {
        dispatch(authorize);
        setSubmitting(false);
      }}
      id="oauth2-form"
    >
      {({
        
        handleSubmit,
        isSubmitting,
      }) => (
        <div className="jumbotron">
          {getGeneralErrors(genError)}
          <div className="container auth-form">
            <Form onSubmit={handleSubmit} noValidate>
              <Row form>
                <Col>
                  <div className="form-group center-oauth2">
                    <Button
                      className="outh2-btn"
                      color="primary"
                      disabled={isSubmitting}>
                      SSO
                    </Button>
                  </div>
                </Col>
              </Row>            
            </Form>
          </div>
        </div>
      )}
    </Formik>
  );
}

export default OAuth2;
