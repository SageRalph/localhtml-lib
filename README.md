# localhtml

The library is for building single page static sites with persistent form data and rich text editor fields. The page can be saved locally as a single HTML file and works offline. The local copy holds all data needed to repopulate the sheet, and newer versions of the page can import data from older versions.

## How To use

Refer to demo/index.html for a showcase of all major features, or demo/simple.html for a minimal example 

The demo's support offline use by having all content inlined (other than localhtml-lib, which can inline itself when saving). If you prefer to split code across multiple files or need to include other assets (e.g. images), you must inline them in your build process and output a single HTML file (e.g. by using Webpack and html-webpack-plugin).
