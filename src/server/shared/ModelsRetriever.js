import fs from 'fs';

export default class ModelsRetriever {
  // constructor() {}

  static getModels(callback) {
    const modelPath = './public/exports/models/';

    let err = null;
    let res = {};

    fs.readdir(modelPath, (err, files) => {
      if (files) {
        files.forEach(file => {
          if (file !== '.DS_Store' && file !== 'Thumbs.db') {
            const modelName = file.split('Model.json')[0];
            res[modelName] = JSON.parse(fs.readFileSync(modelPath + file));
          }
        });
      }

      if (Object.keys(res).length == 0) {
        err = 'No model files';
        res = null;
      }

      callback(err, res);
    });    
  }
};