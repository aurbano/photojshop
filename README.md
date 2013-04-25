PhotoJShop
==========

A JavaScript library for **photo editing** using the canvas, aiming to reproduce most usual filters.
A demo of its capabilities can be seen in [Nuophoto](https://github.com/aurbano/nuophoto), a project that uses this library for all the editing.

Right now I am working on a jQuery plugin version, still **under development** *(== with bugs)*!

The idea is to provide a simple library to developers that will allow quick integration of photo filters to their website.

##Usage
After including jQuery, include *photojshop.jquery.js*. Once loaded you simply need to call it on a valid element.
Right now it works on Canvas and images, so you would call it like so:

```javascript
$('img').PhotoJShop("blur");
```

If you want to change some of the default parameters, you can use:

```javascript
$('img').PhotoJShop({
  effect : "blur",
  resolution : 1
});
```
##Parameters
Right now the only real parameter is **effect**, all the others are not really used and come from the old implementation in Nuophoto. I'm still in the process of porting it.
The available effects are

| Parameter | Values | Description|
|--------|-------------|----------|
|effect|blur, sharpen, emboss, lighten, darken, edge|Select the effect you want to apply|

******
Please feel free to fork this project and contribute!
