function escapeXml(unsafe) {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateFoodSpotsXml(foodSpots, menuItems) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<!DOCTYPE campusFoodGuide SYSTEM "foodspots.dtd">\n';
  xml += '<campusFoodGuide xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="foodspots.xsd">\n';
  xml += `  <metadata>\n`;
  xml += `    <generatedAt>${new Date().toISOString()}</generatedAt>\n`;
  xml += `    <totalSpots>${foodSpots.length}</totalSpots>\n`;
  xml += `    <totalDishes>${menuItems.length}</totalDishes>\n`;
  xml += `    <campus>VIT Vellore</campus>\n`;
  xml += `  </metadata>\n`;
  xml += '  <foodSpots>\n';

  foodSpots.forEach(spot => {
    const spotItems = menuItems.filter(m => String(m.foodSpot) === String(spot._id) || String(m.foodSpot) === spot.slug);
    xml += `    <foodSpot id="${escapeXml(spot._id || spot.slug)}">\n`;
    xml += `      <name>${escapeXml(spot.name)}</name>\n`;
    xml += `      <slug>${escapeXml(spot.slug)}</slug>\n`;
    xml += `      <zone>${escapeXml(spot.zone || 'Other')}</zone>\n`;
    xml += `      <location>${escapeXml(spot.specificLocation || spot.location)}</location>\n`;
    xml += `      <menuStatus>${escapeXml(spot.menuStatus)}</menuStatus>\n`;
    xml += `      <mustTryItem>${escapeXml(spot.mustTryItem || 'N/A')}</mustTryItem>\n`;
    xml += `      <categories>\n`;
    (spot.categories || []).forEach(cat => {
      xml += `        <category>${escapeXml(cat)}</category>\n`;
    });
    xml += `      </categories>\n`;
    xml += `      <menu>\n`;
    spotItems.forEach(item => {
      xml += `        <dish id="${escapeXml(item._id || item.name)}">\n`;
      xml += `          <name>${escapeXml(item.name)}</name>\n`;
      xml += `          <price>${item.price !== null ? item.price : 'unlisted'}</price>\n`;
      xml += `          <classification>${escapeXml(item.foodClassification || 'unclassified')}</classification>\n`;
      xml += `          <category>${escapeXml((item.categories && item.categories[0]) || 'General')}</category>\n`;
      if (item.counter) {
        xml += `          <counter>${escapeXml(item.counter)}</counter>\n`;
      }
      xml += `        </dish>\n`;
    });
    xml += `      </menu>\n`;
    xml += `    </foodSpot>\n`;
  });

  xml += '  </foodSpots>\n';
  xml += '</campusFoodGuide>\n';
  return xml;
}

module.exports = {
  generateFoodSpotsXml,
  escapeXml
};
