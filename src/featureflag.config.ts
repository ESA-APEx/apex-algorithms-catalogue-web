export const featureflag: Record<any, any> = {
  staging: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
  },
  production: {
    benchmarkStatus: true,
    cwlParameterDetail: false,
    jupyterLiteIntegration: false,
  },
  preview: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
  },
  default: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
  },
};
