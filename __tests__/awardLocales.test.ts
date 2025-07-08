import fs from 'fs';
import path from 'path';
import { AwardNameTypes } from '../libs/types/src/lib/constants';

const apps = ['portal', 'frontend'];
const localesDir = (app: string) => path.join(__dirname, `../apps/${app}/locale`);
const awardNames = Object.values(AwardNameTypes);

describe('Award Name Locales', () => {
  apps.forEach((app) => {
    const dir = localesDir(app);
    const files = fs.readdirSync(dir).filter((file) => file.endsWith('.json'));

    describe(`${app} localization`, () => {
      files.forEach((file) => {
        const localePath = path.join(dir, file);
        const locale = require(localePath);

        it(`${file} - should have all award names defined`, () => {
          awardNames.forEach((awardName) => {
            expect(locale["hooks:useAwardName"]?.awards?.[awardName]).toBeDefined();
          });
        });

        it(`${file} - should not have extra undefined award names`, () => {
          const awardKeys = Object.keys(locale["hooks:useAwardName"]?.awards || {});
          awardKeys.forEach((key) => {
            expect(awardNames).toContain(key);
          });
        });
      });
    });
  });
});
