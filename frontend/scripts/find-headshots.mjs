import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { findHeadshotCandidates } from './wikimedia-commons.mjs';

const [, , listPath, outputPath = 'headshot-candidates.json'] = process.argv;

if (!listPath) {
  console.error('Usage: npm run find:headshots -- ./people.json [candidate-output.json]');
  process.exit(1);
}

const people = JSON.parse(await readFile(resolve(process.cwd(), listPath), 'utf8'));
if (!Array.isArray(people) || !people.every((person) => typeof person?.name === 'string')) {
  throw new Error('The input file must be an array like [{ "name": "Ada Lovelace" }].');
}

const results = [];
for (const person of people) {
  console.log(`Finding candidates for ${person.name}…`);
  const candidates = await findHeadshotCandidates(person.name);
  results.push({
    name: person.name,
    output: person.output ?? person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    status: candidates.length ? 'needs-review' : 'no-candidate-found',
    candidates,
  });
}

await writeFile(resolve(process.cwd(), outputPath), `${JSON.stringify({ generatedAt: new Date().toISOString(), people: results }, null, 2)}\n`);
console.log(`Saved reviewable candidates to ${resolve(process.cwd(), outputPath)}`);
