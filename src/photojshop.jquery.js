/**
 * PhotoJShop
 * A JavaScript library to perform image editing using filters similar to those found
 * in most photo editing software.
 * jQuery Plugin package
 *
 * Requirements:
 *	- jQuery
 *
 * @author Alejandro U. Alvarez <alejandro@urbanoalvarez.es>
 * @version 1
 */
(function($, window, document, undefined) {
	$.fn.PhotoJShop = function(options){
		var settings = $.extend( {
			'resolution'	: 5,	// Side of squares for resolution in px
			'minRadius'		: 5,	// Minimum radius for effects with circles
			'randRadius'	: 5,	// Max random radius extra
			'randPosition'	: 2,	// Max point position deviation
			'effect'		: null	// Effect to perform
		}, options);
		if(typeof options == "string"){
			settings.effect = options;
		}
		// Internal variables
		var srcCanvas = this,
			destCanvas = document.createElement('canvas'),
			srcCtx = null,
			destCtx = destCanvas.getContext('2d'),
			imgd = null,
			effects = {
				"darken" : [
					[ 0.000, 0.000, 0.000 ],
					[ 0.000, 6.000, 0.000 ],
					[ 0.000, 0.000, 0.000 ]
				]
			};
			
		destCanvas.width = this.width(),
		destCanvas.height = this.height();
		// Store reference to canvas
		/*effects = {
				"blur": [
					[ 1.000, 1.000, 1.000 ],
					[ 1.000, 1.000, 1.000 ],
					[ 1.000, 1.000, 1.000 ]
				],
				"sharpen": [
					[ 0.000, -3.00, 0.000 ],
					[ -3.00, 21.00, -3.00 ],
					[ 0.000, -3.00, 0.000 ]
				],
				"emboss": [
					[ -18.0, -9.00, 0.000 ],
					[ -9.00,  9.00,  9.00 ],
					[ 0.000,  9.00, 18.00 ]
				],
				"lighten": [
					[ 0.000, 0.000, 0.000 ],
					[ 0.000, 12.00, 0.000 ],
					[ 0.000, 0.000, 0.000 ]
				],
				"darken": [
					[ 0.000, 0.000, 0.000 ],
					[ 0.000, 6.000, 0.000 ],
					[ 0.000, 0.000, 0.000 ]
				],
				"edge": [
					[ 0.000, 9.000, 0.000 ],
					[ 9.000, -36.0, 9.000 ],
					[ 0.000, 9.000, 0.000 ]
				]		
			};*/
		// Check if we are operating on an image or in a canvas
		if(this.is('img')){
			// Create a canvas element
			srcCanvas = document.createElement('canvas');
			srcCtx = srcCanvas.getContext('2d');
			// Resize canvas to fit img
			srcCanvas.width = this.width();
			srcCanvas.height = this.height();
			// Draw both (Only for development)
			$('article').append(srcCanvas);
			$('article').append(destCanvas);
			// Create new context
			srcCtx.drawImage(this.get(0), 0, 0);	// Draw image into canvas
			imgd = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
			/*if(!generated){
				generateAvg(function(){
					applyEffect();
				});
				return;
			}*/
			applyEffect();
			return;
		}else if(!this.is('canvas')){
			alert('Unsupported element')
			return;
		}
		srcCtx = srcCanvas.getContext('2d');
		imgd = srcCtx.getImageData(0, 0, this.width(), this.height());
		
		// --------- IMAGE FUNCTIONS ----------- //
		
		applyEffect();
		
		/**
		 * Instead of using every pixel, it "reduces" the resolution by sampling
		 * blocks of this.strokeResolution x this.strokeResolution, whose color is
		 * the average color of the area inside.
		 * This makes most of the editing work faster, and depending on the ratio
		 * image size / resolution it is almost undetectable.
		 */
		function generateAvg(callback){
			console.log("Generating average");
			avg = []; // clear current avg
			
			// Get samples from the image with the resolution set in strokeResolution
			var pix = imgd, auxAvg, points;
			//
			for(var y = 0; y < pix.height; y += settings.resolution){
				for(var x = 0; x < pix.width; x += settings.resolution){
					auxAvg = [0, 0, 0];	// Avg
					points = 0;	// Pixels measured for avg (resolution^2)
					for(var x1 = 0; x1 < settings.resolution; x1++){
						if(x+x1 > pix.width) break;
						for(var y1 = 0; y1 < settings.resolution; y1++){
							if(y+y1 > pix.height) break;
							// I now have all needed pointers
							// Get the index inside pix array
							var pixIndex = ((y+y1)*pix.width+x+x1)*4;
							auxAvg[0] += pix.data[pixIndex];
							auxAvg[1] += pix.data[pixIndex+1];
							auxAvg[2] += pix.data[pixIndex+2];
							points++;
							//console.log(pix.data[pixIndex]);
							//debugger;
						}
					}
					// Now get final average
					auxAvg[0] = Math.round(auxAvg[0]/points);
					auxAvg[1] = Math.round(auxAvg[1]/points);
					auxAvg[2] = Math.round(auxAvg[2]/points);
					// Store
					avg.push(auxAvg);
				}
			}
			// Set flag
			this.generated = true;
			if(callback!==undefined)callback.call();
		}
		/**
		 * Applies a given effect to the canvas
		 */
		function applyEffect(callback){
			console.log("Applying effect: "+settings.effect);
			if(settings.effect == null){
				console.error("PhotoJShop error: You must select an effect");
				return false;
			}
			// Required variables
			var pix = imgd.data,
				dest = pix,
				total = pix.length,
				mat = effects[settings.effect],
				row, col, center, up, down, index, sum, channel;
			
			// Loop through rows and columns of image/canvas
			for (row = 1; row < srcCanvas.width - 1; row++) {
		
				// Current pixel
				//center = (row * canvas.width)*4 + 4;
				center = (row*srcCanvas.width)*4+4;
		
				// Pixels above and below
				up = center - srcCanvas.width*4;
				down = center + srcCanvas.width*4;
		
				// Loop through columns
				for (col = 1; col < srcCanvas.height - 1; col++) {
		
					// channel on dest/src image
					for (channel = 0; channel < 3; channel++) {
						// Current pixel in position
						sum = 0;
		
						// NW (northwest)
						// -4 because each pixel is 4 elements in the array,
						// and -4 goes left one pixel:
						index = (up - 4) + channel;
						sum += pix[index] * mat[0][0];
		
						// N
						index += 4; // next pixel
						sum += pix[index] * mat[0][1];
		
						// NE
						index += 4; // next pixel
						sum += pix[index] * mat[0][2];
		
						// W
						index = (center - 4) + channel;
						sum += pix[index] * mat[1][0];
		
						// Center
						index += 4; // next pixel
						sum += pix[index] * mat[1][1];
		
						// E
						index += 4; // next pixel
						sum += pix[index] * mat[1][2];
		
						// SW
						index = (down - 4) + channel;
						sum += pix[index] * mat[2][0];
		
						// S
						index += 4; // next pixel
						sum += pix[index] * mat[2][1];
		
						// SE
						index += 4; // next pixel
						sum += pix[index] * mat[2][2];
		
						// now we have the sum, apply the divisor and clamp:
						sum /= 9;
						sum = Math.min(Math.max(sum, 0), 255);
		
						// and store in the dest pixels
						dest[center+channel] = sum;
					}
		
					// set alpha on this pixel to fully opaque:
					dest[center+3] = 0xff;
		
					// next pixel:
					center += 4;
					up += 4;
					down += 4;
		
				} // for cols
			} // for rows
			imgd.data = dest;
			destCtx.putImageData(imgd, 0, 0);
			// Now save and display
			//$('article').append('<img src="'+save()+'">');
		}
		/**
		 * Generates a data URL for the canvas
		 */
		function save(){
			return destCanvas.toDataURL();
		}
	};
})(jQuery, window, document);