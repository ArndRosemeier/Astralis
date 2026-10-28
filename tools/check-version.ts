import {readdirSync} from 'node:fs';
import {VERSION} from '../packages/sim/src/rules';
const entries=readdirSync('apps/web/src/changelog/entries').filter(n=>/^\d{4}-\d{2}-\d{2}-\d{4}-.+\.md$/.test(n)).sort();
const expected=(entries.length/1000).toFixed(3);if(VERSION!==expected)throw Error(`Game VERSION ${VERSION} does not match ${entries.length} changelog entries (${expected}). Add one player-facing entry and advance the build together.`);console.log(`Build ${VERSION}: ${entries.length} immutable changelog entries verified.`);
