export const featureflag: Record<any, any> = {
    staging: {
        benchmarkStatus: true,
    },
    production: {
        benchmarkStatus: false,
    },
    default: {
        benchmarkStatus: true,
    }
}