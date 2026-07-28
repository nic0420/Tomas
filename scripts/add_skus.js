const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'public', 'productos.csv');
const outPath = path.join(__dirname, '..', 'public', 'productos.csv.tmp');

const csvData = fs.readFileSync(csvPath, 'utf8');

Papa.parse(csvData, {
  header: true,
  complete: function(results) {
    const data = results.data;
    const newData = [];
    
    data.forEach(row => {
      if (Object.keys(row).length === 1 && Object.keys(row)[0] === '') return; // skip empty rows
      
      let sku = '';
      if (row.imagen_url && row.imagen_url.includes('arsenalsports.com/img/')) {
        // format: https://www.arsenalsports.com/img/8345/produtos/...
        const match = row.imagen_url.match(/arsenalsports\.com\/img\/(\d+)\//);
        if (match && match[1]) {
          sku = match[1];
        }
      }
      
      // We want to insert 'sku' after 'id'
      const newRow = {
        id: row.id,
        sku: sku,
        nombre_producto: row.nombre_producto,
        categoria: row.categoria,
        imagen_url: row.imagen_url,
        precio_usd: row.precio_usd,
        descripcion: row.descripcion,
        caracteristicas: row.caracteristicas
      };
      newData.push(newRow);
    });

    const newCsv = Papa.unparse(newData);
    fs.writeFileSync(outPath, newCsv);
    console.log(`Processed ${newData.length} rows. Writing to tmp file...`);
    fs.renameSync(outPath, csvPath);
    console.log('Done! Updated productos.csv');
  }
});
