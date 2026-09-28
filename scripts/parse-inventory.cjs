const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'here', 'PHOTO_INVENTORY_VIEWER.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Cards split by <div class="card"
const rawCards = html.split('<div class="card"').slice(1);
console.log('Total raw cards found:', rawCards.length);

const items = [];

for (const raw of rawCards) {
  const codeMatch = raw.match(/data-code="([^"]+)"/);
  const projMatch = raw.match(/data-project="([^"]+)"/);
  const discMatch = raw.match(/data-discipline="([^"]+)"/);
  const imgMatch = raw.match(/<img\s+src="([^"]+)"/);
  
  const subdiscMatch = raw.match(/class="input-subdiscipline"\s+value="([^"]*)"/);
  const modelMatch = raw.match(/class="input-model"(?:\s+value="([^"]*)")?/);
  const clientMatch = raw.match(/class="input-client"(?:\s+value="([^"]*)")?/);
  const muaMatch = raw.match(/class="input-mua"(?:\s+value="([^"]*)")?/);
  const assistantMatch = raw.match(/class="input-assistant"(?:\s+value="([^"]*)")?/);
  const dateMatch = raw.match(/class="input-date"(?:\s+value="([^"]*)")?/);
  const keywordsMatch = raw.match(/class="input-keywords"(?:\s+value="([^"]*)")?/);

  if (codeMatch) {
    items.push({
      code: codeMatch[1],
      project: projMatch ? projMatch[1] : '',
      discipline: discMatch ? discMatch[1] : '',
      imgSrc: imgMatch ? imgMatch[1] : '',
      subdiscipline: subdiscMatch ? subdiscMatch[1] : '',
      model: modelMatch && modelMatch[1] ? modelMatch[1] : '',
      client: clientMatch && clientMatch[1] ? clientMatch[1] : '',
      makeupArtist: muaMatch && muaMatch[1] ? muaMatch[1] : '',
      assistant: assistantMatch && assistantMatch[1] ? assistantMatch[1] : '',
      date: dateMatch && dateMatch[1] ? dateMatch[1] : '',
      keywords: keywordsMatch && keywordsMatch[1] ? keywordsMatch[1] : ''
    });
  }
}

console.log('Successfully parsed items:', items.length);
console.log('Sample item 0:', items[0]);
console.log('Sample item 100:', items[100]);

const disciplines = [...new Set(items.map(i => i.discipline))];
console.log('Disciplines count:', disciplines);

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'inventory-items.json'),
  JSON.stringify(items, null, 2),
  'utf8'
);
console.log('Written to src/data/inventory-items.json');
