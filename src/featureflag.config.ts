export const featureflag: Record<any, any> = {
  staging: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: false,
    providerPlatformLogo: true,
    costAnalysis: true,
  },
  production: {
    benchmarkStatus: true,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
    basicAuth: false,
    providerPlatformLogo: true,
    costAnalysis: false,
  },
  preview: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
    basicAuth: true,
    providerPlatformLogo: true,
    costAnalysis: false,
  },
  default: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: true,
    providerPlatformLogo: true,
    costAnalysis: true,
  },
};
