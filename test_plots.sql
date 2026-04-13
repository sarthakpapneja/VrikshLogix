SELECT id, ST_AsGeoJSON(centroid) as centroid_json, ST_AsText(centroid) as centroid_text FROM plots LIMIT 1;
