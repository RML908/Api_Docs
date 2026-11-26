export type Lang = 'en' | 'hy';

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hy', label: 'ՀԱՅ' },
];

const dict = {
  en: {
    documentation: 'Documentation',
    changelog: 'Changelog',
    signIn: 'Sign In',
    admin: 'Admin',
    search: 'Search…',
    endpoints: 'Endpoints',
    loading: 'Loading…',
    selectEndpoint: 'Select an endpoint to view its documentation',
    noEndpoints: 'No endpoints found',
    requestBody: 'Request Body',
    requestFormat: 'Request Format',
    response: 'Response',
    noResponse: 'No response example provided.',
    codeSample: 'Code Sample',
    changelogSub: 'API updates and version history',
    noChangelog: 'No changelog entries yet',
    language: 'Language',
  },
  hy: {
    documentation: 'Փաստաթղթեր',
    changelog: 'Փոփոխությունների պատմություն',
    signIn: 'Մուտք',
    admin: 'Ադմին',
    search: 'Որոնել…',
    endpoints: 'Endpoint-ներ',
    loading: 'Բեռնվում է…',
    selectEndpoint: 'Ընտրեք endpoint՝ փաստաթուղթը դիտելու համար',
    noEndpoints: 'Endpoint-ներ չեն գտնվել',
    requestBody: 'Հարցման մարմին',
    requestFormat: 'Հարցման ձևաչափ',
    response: 'Պատասխան',
    noResponse: 'Պատասխանի օրինակ տրամադրված չէ։',
    codeSample: 'Կոդի օրինակ',
    changelogSub: 'API-ի թարմացումներ և տարբերակների պատմություն',
    noChangelog: 'Փոփոխությունների գրառումներ դեռ չկան',
    language: 'Լեզու',
  },
} as const;

export type TKey = keyof (typeof dict)['en'];
export const translate = (lang: Lang, key: TKey): string => dict[lang][key];
