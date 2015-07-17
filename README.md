# CsvViewer

[![License](https://img.shields.io/badge/license-MPL-blue.svg)](https://www.mozilla.org/MPL/2.0/)

Add-on for [Mozilla Firefox](https:/www.mozilla.org/firefox) that enables viewing/creating/editing [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) files directly from your browser.

## Notes for users

See [doc/README.md](doc/README.md) for more details.

## Notes for developers

__CSVViewer__ is developed using [Mozilla Add-on SDK](https://developer.mozilla.org/en-US/Add-ons/SDK) with new command-line tool called [JPM](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_Started_%28jpm%29) and [Google Material Design Lite](https://github.com/google/material-design-lite) library.

Here are all neccessary commands:

```bash
# Download sources
git clone https://github.com/ondrejd/CSVViewer.git csvviewer
# Enter sources folders and download libraries
cd csvviewer
npm udpate
# Execute development version
jpm run -b \path\to\firefox --debug
# Build XPI
jpm xpi
```
