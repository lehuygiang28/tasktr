export type AppConfig = {
    deployEnv: string;
    workerMode: boolean;
    workerName: string;
    globalPrefix: string;
    eventsMaxLen: number;
    port: number;
    fallbackLanguage: string;
    apiStatsPath: string;
    apiStatsUsername: string;
    apiStatsPassword: string;
    bullBoardPath: string;
};
