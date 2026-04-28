const fs = require("fs");
const path = require("path");

function readJsonFile(fileName) {
  const filePath = path.join(__dirname, "..", "data", fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function listSampleSummaries() {
  return readJsonFile("samples.json").map((sample) => ({
    sample_id: sample.sample_id,
    label: sample.label,
    description: sample.description,
  }));
}

function findSampleById(sampleId) {
  return readJsonFile("samples.json").find((sample) => sample.sample_id === sampleId) || null;
}

function getNutrientGuides() {
  return readJsonFile("nutrient-guides.json");
}

module.exports = {
  findSampleById,
  getNutrientGuides,
  listSampleSummaries,
};
