import type { PlaywrightTestConfig } from '@playwright/test';
//import { CandidateSelectionClient } from '../../src/services/CandidateSelectionClient';

const config: PlaywrightTestConfig = {
    webServer: {
        command: 'npm run build && npm run preview',
        port: 4173
    },
    testDir: 'tests',
    testMatch: /(.+.)?(test|spec).[jt]s/,
    use: {
        headless: false
    }
};

export default config;