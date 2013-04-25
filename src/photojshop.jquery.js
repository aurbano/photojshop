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
	var avg = [];
	var generated = false; // Flag to know if averages have been calculated
	
	$.fn.PhotoJShop = function(options){
		var settings = $.extend( {
			'resolution'	: 5,	// Side of squares for resolution in px
			'minRadius'		: 5,	// Minimum radius for effects with circles
			'randRadius'	: 5,	// Max random radius extra
			'randPosition'	: 2,	// Max point position deviation
			'innerMargin'	: 20,	// Margin to each side of the canvas
			'effect'		: null	// Effect to perform
		}, options);
		// Store reference to canvas
		var canvas = this,
			ctx = null;
		// Check if we are operating on an image or in a canvas
		if(this.is('img')){
			// Create a canvas element
			canvas = document.createElement('canvas');
			canvas.width = this.width();	// Resize canvas to fit img
			canvas.height = this.height();
			ctx = canvas.getContext('2d');	// Get the drawing context
			ctx.drawImage(this.get(0), 0, 0);		// Draw image into canvas
		}else if(!this.is('canvas')){
			alert('unsupported')
		}
		if(ctx == null) ctx = canvas.getContext('2d');
		
		// --------- IMAGE FUNCTIONS ----------- //
		
		//if(!generated){
		//	generateAvg();
		//}
	
		/**
		 * Instead of using every pixel, it "reduces" the resolution by sampling
		 * blocks of this.strokeResolution x this.strokeResolution, whose color is
		 * the average color of the area inside.
		 * This makes most of the editing work faster, and depending on the ratio
		 * image size / resolution it is almost undetectable.
		 */
		generateAvg = function(callback){
			avg = []; // clear current avg
			
			// Get samples from the image with the resolution set in strokeResolution
			var pix = this.canvas.ctx.getImageData(0, 0, this.canvas.WIDTH, this.canvas.HEIGHT), auxAvg, points;
			//
			for(var y = 0; y < pix.height; y += this.strokeResolution){
				for(var x = 0; x < pix.width; x += this.strokeResolution){
					auxAvg = [0, 0, 0];	// Avg
					points = 0;	// Pixels measured for avg (strokeResolution^2)
					for(var x1 = 0; x1 < this.strokeResolution;	x1++){
						if(x+x1 > pix.width) break;
						for(var y1 = 0; y1 < this.strokeResolution;	y1++){
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
					this.avg.push(auxAvg);
				}
			}
			console.log('Sampling done');
			console.log(this.avg);
			// Set flag
			this.generated = true;
			callback.call();
		}
		/**
		 * Applies a given effect to the canvas
		 */
		applyEffect = function(effect, callback){
			require(["effects/"+effect], $.proxy( function(){
				var obj = this;
				if(!this.generated){
					this.generateAvg(function(){
						exec(obj);
						callback.call();
					});
				}else{
					exec(obj);
					callback.call();
				}
			},this));
		}
		/**
		 * Generates a data URL for the canvas
		 */
		save = function(){
			return this.canvas.elem.get(0).toDataURL();
		}
		
		/**
		 * Still not working, this should scale the image
		 * it should be moved to NuoPhoto, since this is not really
		 * an editing function.
		 */
		zoom = function(clicks, x, y){
			//var pt = this.canvas.elem.get(0).transformedPoint(x,y);
			this.canvas.ctx.translate(x,y);
			// Change the factor here for faster/slower zoom
			var factor = Math.pow(1.1,clicks);
			this.canvas.ctx.scale(factor,factor);
			this.canvas.ctx.translate(-x,-y);
		}
		
	};
})(jQuery, window, document);