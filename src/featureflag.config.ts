export const featureflag: Record<any, any> = {
  staging: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: false,
  },
  production: {
    benchmarkStatus: true,
    cwlParameterDetail: false,
    jupyterLiteIntegration: false,
    basicAuth: true,
  },
  preview: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
    basicAuth: true,
  },
  default: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: true,
  },
};
