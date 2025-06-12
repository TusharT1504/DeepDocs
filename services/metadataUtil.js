const fs = require("fs");
const path = require("path");

const METADATA_MAP_PATH = path.join(__dirname, "..", "metadata", "metadataMap.json");

async function loadMetadataMap() {
  if (!fs.existsSync(METADATA_MAP_PATH)) {
    fs.writeFileSync(METADATA_MAP_PATH, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(METADATA_MAP_PATH, "utf-8"));
}

async function saveMetadataMap(map) {
  fs.writeFileSync(METADATA_MAP_PATH, JSON.stringify(map, null, 2));
}

module.exports = { loadMetadataMap, saveMetadataMap };
