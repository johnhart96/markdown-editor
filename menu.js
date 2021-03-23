const {
  app,
  Menu,
  shell,
  ipcMain,
  BrowserWindow,
  globalShortcut,
  dialog
} = require('electron');

const fs = require('fs');

function saveFile() {
  console.log('Saving the file');

  const window = BrowserWindow.getFocusedWindow();
  window.webContents.send('editor-event', 'save');
}

function newFile() {
  console.log('New file');
  const window = BrowserWindow.getFocusedWindow();
  window.webContents.send('editor-event', 'new');
}

function loadFile() {
  const window = BrowserWindow.getFocusedWindow();
  const files = dialog.showOpenDialogSync(window, {
      properties: ['openFile'],
      title: 'Pick a markdown file',
      filters: [{ name: 'Markdown', extensions: ['md', 'markdown','txt'] }]

  });
  if (!files) return;

  const file = files[0];
  const fileContent = fs.readFileSync(file).toString();
  console.log(fileContent);
  window.webContents.send('load', fileContent);
}

app.on('ready', () => {
  globalShortcut.register('CommandOrControl+S', () => {
    saveFile();
  });

  globalShortcut.register('CommandOrControl+O', () => {
    loadFile();
  });
});

ipcMain.on('save', (event, arg) => {
  console.log(`Saving content of the file`);
  console.log(arg);

  const window = BrowserWindow.getFocusedWindow();
  const options = {
    title: 'Save markdown file',
    filters: [
      {
        name: 'MyFile',
        extensions: ['md']
      }
    ]
  };

  const filename = dialog.showSaveDialogSync(window, options);
  if (filename) {
    console.log(`Saving content to the file: ${filename}`);
    fs.writeFileSync(filename, arg);
  }
});

ipcMain.on('editor-reply', (event, arg) => {
  console.log(`Received reply from web page: ${arg}`);
});
function editorEvent(string) {
  const window = BrowserWindow.getFocusedWindow();
  window.webContents.send('editor-event',string);
}
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CommandOrControl+N',
        click() {
          newFile();
        }
      },
      {
        label: 'Open',
        accelerator: 'CommandOrControl+O',
        click() {
          loadFile();
        }
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() {
          saveFile();
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'quit',
        accelerator: 'CommandOrControl+Q',
      }
    ]
  },
  {
    label: 'Format',
    submenu: [
      {
        label: 'Bold',
        click() {
          editorEvent('toggle-bold');
        }
      },
      {
        label: 'Italic',
        click() {
          editorEvent('toggle-italic');
        }
      },
      {
        label: 'Heading',
        click() {
          editorEvent('toggle-heading');
        }
      },
      {
        label: 'Striketrough',
        click() {
          editorEvent('toggle-Strikethough')
        }
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        role: 'about'
      }
    ]
  }
];

if (process.env.DEBUG) {
  template.push({
    label: 'Debugging',
    submenu: [
      {
        label: 'Dev Tools',
        role: 'toggleDevTools'
      },

      { type: 'separator' },
      {
        role: 'reload',
        accelerator: 'Alt+R'
      }
    ]
  });
}

if (process.platform === 'darwin') {
  console.log('macos detected');
  template.unshift({
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  });
}

const menu = Menu.buildFromTemplate(template);

module.exports = menu;
