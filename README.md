# CSVViewer

[![License](https://img.shields.io/badge/license-MPL-blue.svg)](https://www.mozilla.org/MPL/2.0/)

Add-on for [Mozilla Firefox](https:/www.mozilla.org/firefox) that enables viewing/creating/editing [CSV](https://en.wikipedia.org/wiki/Comma-separated_values) files directly from your browser.

## Some screenshots

### Screenshot 01

![Data table](https://raw.github.com/ondrejd/csvviewer/master/doc/screen01.png)

### Screenshot 02

![Main menu in toolbar popup](https://raw.github.com/ondrejd/csvviewer/master/doc/screen02.png)

### Screenshot 03

![Footer of data table](https://raw.github.com/ondrejd/csvviewer/master/doc/screen03.png)

## Notes for developers

__CSVViewer__ is developed using [Add-on SDK](https://developer.mozilla.org/en-US/Add-ons/SDK) with new command-line tool called [JPM](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Getting_Started_%28jpm%29).

### Building XPI package

To build _XPI_ package write:

```bash
jpm xpi
```

### Running development version

```bash
jpm run -b \usr\bin\firefox --debug
```

__Note__: The `--debug` flag is optional.
