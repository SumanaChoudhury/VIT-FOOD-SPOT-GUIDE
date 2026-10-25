const EventEmitter = require('events');

class CampusFoodEventEmitter extends EventEmitter {}

const appEvents = new CampusFoodEventEmitter();

// Event Listener 1: menuImportCompleted
appEvents.on('menuImportCompleted', (payload) => {
  console.log(`[Event:menuImportCompleted] Imported ${payload.importedCount} items from '${payload.sourceFile}'. Missing prices: ${payload.missingPrices}, Variants: ${payload.variantCount}`);
});

// Event Listener 2: recommendationSubmitted
appEvents.on('recommendationSubmitted', (payload) => {
  console.log(`[Event:recommendationSubmitted] New recommendation pending approval for dish '${payload.dishName}' at '${payload.spotName}' by '${payload.displayName}'`);
});

// Event Listener 3: recommendationStatusChanged
appEvents.on('recommendationStatusChanged', (payload) => {
  console.log(`[Event:recommendationStatusChanged] Recommendation ID ${payload.id} status updated to: ${payload.status}`);
});

// Event Listener 4: databaseConnected
appEvents.on('databaseConnected', (payload) => {
  console.log(`[Event:databaseConnected] Database operational on ${payload.uri}`);
});

module.exports = {
  appEvents
};
