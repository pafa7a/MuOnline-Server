import fs from 'fs';
import path from 'path';

const configCache: { [key: string]: any } = {};

// Get config path based on current directory
const getConfigPath = () => {
  const currentDir = __dirname;
  return path.join(currentDir, '..', 'config');
};

export const loadAllConfigs = () => {
  const traverseDirectory = (currentPath: string, relativePath = '') => {
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const fileStats = fs.statSync(filePath);
      const relativeFilePath = path.join(relativePath, file);

      if (fileStats.isDirectory()) {
        // Recursively traverse subdirectories
        traverseDirectory(filePath, relativeFilePath);
      } else if (file.endsWith('.json')) {
        // Read and parse JSON files
        try {
          const cacheKey = relativeFilePath.replace(path.sep, '/').replace('.json', '');
          configCache[cacheKey] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`Loaded config: ${filePath}`);
        } catch (error) {
          console.error(`Error reading or parsing ${filePath}: ${error}`);
        }
      }
    }
  };

  traverseDirectory(getConfigPath());
};

export const getConfig = (name: string, path = '') => {
  if (!path) {
    return configCache[name];
  }
  try {
    const data = configCache[name];

    // Split the dot-separated path into an array of keys
    const keys = path.split('.');

    // Traverse the JSON object using the keys
    let result = data;
    for (const key of keys) {
      if (key in result) {
        result = result[key];
      } else {
        return null;
      }
    }

    return result;
  } catch (error) {
    console.error(`Error reading or parsing config '${name}': ${error}`);
    return null;
  }
};
