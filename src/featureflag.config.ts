export const featureflag: Record<any, any> = {
  staging: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: false,
    providerPlatformLogo: true,
  },
  production: {
    benchmarkStatus: true,
    cwlParameterDetail: false,
    jupyterLiteIntegration: false,
    basicAuth: true,
    providerPlatformLogo: false,
  },
  preview: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
    basicAuth: true,
    providerPlatformLogo: false,
  },
  default: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: true,
    providerPlatformLogo: true,
  },
};
