export const featureflag: Record<any, any> = {
  staging: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
  },
  production: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
  },
  preview: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
  },
  default: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
  },
};
