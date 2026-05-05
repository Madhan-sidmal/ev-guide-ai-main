const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const EV_MODELS = [
  { name: 'Model 3 Long Range',   manufacturer: 'Tesla',    battery_capacity: 75,   range_km: 580, efficiency: 129 },
  { name: 'Model Y',              manufacturer: 'Tesla',    battery_capacity: 75,   range_km: 533, efficiency: 141 },
  { name: 'Nexon EV Max',         manufacturer: 'Tata',     battery_capacity: 40.5, range_km: 437, efficiency: 93  },
  { name: 'Nexon EV',             manufacturer: 'Tata',     battery_capacity: 30.2, range_km: 312, efficiency: 97  },
  { name: 'ZS EV',                manufacturer: 'MG',       battery_capacity: 50.3, range_km: 461, efficiency: 109 },
  { name: 'Atto 3',               manufacturer: 'BYD',      battery_capacity: 60.5, range_km: 521, efficiency: 116 },
  { name: 'Kona Electric',        manufacturer: 'Hyundai',  battery_capacity: 39.2, range_km: 452, efficiency: 87  },
  { name: 'XUV400',               manufacturer: 'Mahindra', battery_capacity: 39.4, range_km: 456, efficiency: 86  },
  { name: 'e6',                   manufacturer: 'BYD',      battery_capacity: 71.7, range_km: 520, efficiency: 138 },
  { name: 'Tigor EV',             manufacturer: 'Tata',     battery_capacity: 26,   range_km: 315, efficiency: 83  },
];

function seedEVModels() {
  const existing = db.prepare('SELECT COUNT(*) as count FROM ev_models').get();

  if (existing.count > 0) {
    console.log(`ℹ️  EV models already seeded (${existing.count} models)`);
    return;
  }

  const insert = db.prepare(`
    INSERT INTO ev_models (id, name, manufacturer, battery_capacity, range_km, efficiency)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((models) => {
    for (const m of models) {
      insert.run(uuidv4(), m.name, m.manufacturer, m.battery_capacity, m.range_km, m.efficiency);
    }
  });

  insertMany(EV_MODELS);
  console.log(`✅ Seeded ${EV_MODELS.length} EV models`);
}

module.exports = { seedEVModels };
