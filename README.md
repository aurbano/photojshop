PhotoJShop
==========

> A JavaScript photo editing library packaged in a simple jQuery plugin

PhotoJShop is a JavaScript library for **photo editing** using the canvas, aiming to reproduce most usual filters.
A demo of its capabilities can be seen in [Nuophoto](https://github.com/aurbano/nuophoto), a project that uses this library for all the editing *(Not really yet, it's still using the old version)*

The idea is to provide a simple library to developers that will allow quick integration of photo filters to their website.

##Demo
If you clone the repo, simply open `index.html`, which is a very simple demo of the plugin's capabilities.
The project has Github's pages enabled, so you can see the demo page online:

* [PhotoJShop demo](http://github.urbanoalvarez.es/PhotoJShop/) *(Development)*

*Please note that it sometimes takes Github several hours to update the files shown in GH Pages*

##Usage
After including jQuery, include *photojshop.jquery.js*. Once loaded you simply need to call it on a valid element. You have to ensure that the element has loaded, `$(document).ready()` doesn't mean images is loaded!

Right now it works on Canvas and images, so you would call it like so:

```javascript
$('img').PhotoJShop("blur");
```

Effects can also be chained if `replace` is set to `true`:

```javascript
$('img').PhotoJShop("blur").PhotoJShop("lighten");
```

You can also set `replace` to `false`, and obtain the _dataURL_ of the filtered photo:

```javascript
$('#image1').attr('src',
  $('#image2').PhotoJShop({
    effect : "blur",
    replace : false
  })
);
```
##Parameters
Right now the only real parameter is **effect**, all the others are not really used and come from the old implementation in Nuophoto. I'm still in the process of porting it.
The available effects are

| Parameter | Values | Description|
|--------|-------------|----------|
|**effect**|`blur`, `sharpen`, `emboss`, `lighten`, `darken`, `edge-enhance`, `edge-detect` | Select the effect you want to apply|
|**replace**|`true`, `false`| If `true` the result of the filter will replace the original image/canvas data and return the jQuery object for chainability. If `false` it will return the dataURL of the resulting image|

##Meta

- Developed by [Alejandro U. Álvarez](http://urbanoalvarez.es)
- Licensed under the MIT license.
- Contributors: -
