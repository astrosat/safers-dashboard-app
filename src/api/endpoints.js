export const endpoints = {
  authentication: {
    signIn: '/auth/login/',
    signUp: '/auth/register/',
    signOut: '/auth/logout/',
    forgotPswReset: '/auth/password/reset/',
    resetPsw: '/auth/password/reset/confirm/',
    refreshToken: '/auth/token/refresh/',
    oAuth2SignIn: '/oauth2/login',
    oAuth2SignUp: '/oauth2/register'
  },
  aoi: {
    getAll: '/aois/',
  },
  fireAlerts: {
    getAll: '/alerts/',
    setFavorite: '/alerts/:alert_id/favorite/',
    validate: '/alerts/:alert_id/validate/',
    edit: '/alerts/:alert_id/',
    source: '/alerts/sources',
  },
  dataLayers: {
    getAll: '/data/layers',
    metadata:'/data/layers/metadata/'
  },
  eventAlerts: {
    getAll: '/events/',
    getEvent: '/events/:event_id/',
    setFavorite: '/events/:event_id/favorite/',
    validate: '/event-alerts/validate',
    edit: '/events/:event_id/',
    getInSitu: '/event-alerts/inSitu',
    getTweets: '/event-alerts/tweets'
  },
  user: {
    profile: '/users/',
    resetPsw: '/auth/password/change/',
  },
  common: {
    config: '/config',
    organizations: '/organizations/',
    roles: '/roles/',
    termsNconditions: '/api/documents/terms-current',
    privacyPolicy: '/api/documents/privacy-current',
  },
  dashboard: {
    getStats: '/dashboard/stats',
    getWeatherStats: '/dashboard/weatherstats',
    getWeatherVariables: '/dashboard/weathervariables',
    getInSitu: '/dashboard/inSitu',
    getTweets: '/dashboard/tweets'
  },
  notifications: {
    getAll: '/notifications/',
    sources: '/notifications/sources',
  },
  insitu: {
    cameraList: '/cameras/',
    getMedia: '/cameras/media/',
    setFavorite: '/cameras/media/:media_id/favorite/',
    getSources: '/cameras/media/sources',
  },
  chatbot: {
    reports: {
      getReports: '/chatbot/reports',
      getReportInfo: '/chatbot/reports/:report_id',
    },
    comms: {
      getAll: '/chatbot/communications'
    },
    missions: {
      getMissions: '/chatbot/missions',
      getMissionInfo: '/chatbot/missions/:mission_id',
    },
    people: {
      getAll: '/chatbot/people'
    }
  }
};

