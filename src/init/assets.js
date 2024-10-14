import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets');

const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

let gameAssets = {};

export const loadGameAssets = async () => {
  try {
    const [monsters, spartaHeadQuaters, stages, towers] = await Promise.all([
      readFileAsync('monster.json'),
      readFileAsync('spartaHeadQuater.json'),
      readFileAsync('stage.json'),
      readFileAsync('tower.json'),
    ]);

    gameAssets = { monsters, spartaHeadQuaters, stages, towers };
    return gameAssets;
  } catch (error) {
    throw error;
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
