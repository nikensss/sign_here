const path = require('path');
const fs = require('fs');

const package = JSON.parse(fs.readFileSync('./package.json'));

module.exports = {
  packagerConfig: {
    name: 'Don Notario',
    icon: path.join(__dirname, 'icon', 'icon.ico'),
    win32metadata: {
      FileDescription: 'Don Notario',
      OriginalFilename: 'Don Notario',
      ProductName: 'Don Notario',
      CompanyName: 'λ bit'
    }
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'don_notario',
        setupExe: `don_notario-${package.version}_setup.exe`,
        setupIcon: path.join(__dirname, 'icon', 'icon.ico')
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
};
