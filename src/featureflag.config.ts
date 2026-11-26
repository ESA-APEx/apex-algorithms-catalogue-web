import { link } from "fs";

export const featureflag: Record<any, any> = {
  staging: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: false,
    providerPlatformLogo: true,
    costAnalysis: true,
    platformProviderFilter: true,
    linkExplorer: true,
  },
  production: {
    benchmarkStatus: true,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
    basicAuth: false,
    providerPlatformLogo: true,
    costAnalysis: true,
    platformProviderFilter: true,
    linkExplorer: false,
  },
  preview: {
    benchmarkStatus: false,
    cwlParameterDetail: false,
    jupyterLiteIntegration: true,
    basicAuth: true,
    providerPlatformLogo: true,
    costAnalysis: false,
    platformProviderFilter: true,
    linkExplorer: false,
  },
  default: {
    benchmarkStatus: true,
    cwlParameterDetail: true,
    jupyterLiteIntegration: true,
    basicAuth: true,
    providerPlatformLogo: true,
    costAnalysis: true,
    platformProviderFilter: true,
    linkExplorer: true,
  },
};
