PhotoJShop
==========

> A JavaScript photo editing library packaged in a simple [jQuery plugin](http://plugins.jquery.com/photojshop/)

PhotoJShop is a JavaScript library for **photo editing** using the canvas, aiming to reproduce most usual filters.
A demo of its capabilities can be seen in [Nuophoto](https://github.com/aurbano/nuophoto), a project that uses this library for all the editing *(Not really yet, it's still using the old version)*

The idea is to provide a simple library to developers that will allow quick integration of photo filters to their website.

##Demo
If you clone the repo, simply open `index.html`, which is a very simple demo of the plugin's capabilities.
The project has Github's pages enabled, so you can see the demo page online:

* [PhotoJShop demo](http://github.urbanoalvarez.es/PhotoJShop/) *(Development)*

###Download
Head over to the [releases list](https://github.com/aurbano/PhotoJShop/releases) and grab the lastest one

##Usage
After including jQuery, include *photojshop.jquery.js*. Once loaded you simply need to call it on a valid element. You have to ensure that the element has loaded, `$(document).ready()` doesn't mean images is loaded!

Right now it works on Canvas and images, so you would call it like so:

```javascript
$('#img1').PhotoJShop("blur");

// The following would produce the same effect:
$('#img1').PhotoJShop({ effect : "blur"});

// Color effects can be applied at the same time:
$('#img1').PhotoJShop({
  effect  : "blur",
  color   : "b&w"
});
```

Effects can also be chained if `replace` is set to `true` (Which is by default)

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
Do you want to do a non-implemented effect? Use the `custom` mode, and define your own matrix, in the example below we will use a version of `blur` that also lightens the image:
```javascript
$('img').PhotoJShop({
  matrix :  [ [1, 1,  1],
              [1, 1.5,1],
              [1, 1,  1] ]
});
// That code is exactly the same as the following:
$('img').PhotoJShop({
  matrix :  [ [1.5] ]
});
```
You can use any size for the matrix, although it must be square. You can use a 1x1 matrix for example, which will lighten/darken the image if you use a bigger/lower value than 1.

##Parameters

| Parameter | Values | Description|
|--------|-------------|----------|
|**effect**|`blur`, `sharpen`, `emboss`, `lighten`, `darken`, `edge-enhance`, `edge-detect`, `custom` | Select the effect you want to apply|
|**replace**|`true`, `false`| If `true` the result of the filter will replace the original image/canvas data and return the jQuery object for chainability. If `false` it will return the dataURL of the resulting image|
|**matrix**|JavaScript matrix| Use this with the `custom` effect (Although if you set the matrix you don't have to specify the `effect`), the matrix can be any size, but it must be in JavaScript format.|
|**color**|`b&w`, `sepia`, `vintage`, `recolor`, `red`, `blue`, `green`| Apply a coloring effect. Red, blue and green leave only the corresponding channel on all channels.|

##Changelog
History of changes:

####1.0.1
* Add minified version
* Released in jQuery plugin repository

####1.0.0
* First stable release


##Meta

- Developed by [Alejandro U. Álvarez](http://urbanoalvarez.es)
- Licensed under the MIT license.
- Contributors: -
