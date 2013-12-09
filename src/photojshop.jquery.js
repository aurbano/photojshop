/**
 * PhotoJShop
 * A JavaScript library to perform image editing using filters similar to those found
 * in most photo editing software.
 * jQuery Plugin package
 *
 * Requirements:
 *	- jQuery
 * 
 * Licensed under the MIT License
 *
 * @author Alejandro U. Alvarez <alejandro@urbanoalvarez.es>
 * @version 1.0.4
 */
(function($, window, document, undefined) {
	$.fn.PhotoJShop = function(options){
		var settings = $.extend( {
			'effect'		: null,	// Filter to perform
			'color'			: null, // Color effect
			'replace'		: true,	// Replace original
			'matrix'		: null	// Custom effect matrix
		}, options);
		if(typeof options == "string"){
			settings.effect = options;
		}
		// Internal variables
		var obj = this,
			srcCanvas = this,
			destCanvas = document.createElement('canvas'),
			srcCtx = null,
			destCtx = destCanvas.getContext('2d'),
			srcImgd = null,
			destImgd = null,
			effects = {
				"blur": 	[[1, 1, 1],		[1, 1, 1],		[1, 1, 1]],
				"blur2": 	[[1, 1, 1, 1],	[1, 1, 1, 1],	[1, 1, 1, 1],	[1, 1, 1, 1]],
				"sharpen": 	[[0, -1, 0],	[-1, 13, -1],	[ 0, -1, 0]],
				"emboss": 	[[ -10, -7, 0 ],	[ 10,  8,  -10 ],	[ 0,  7, 10 ]],
				"lighten": 	[[1.1]],
				"darken": 	[[0.9]],
				"edge-enhance": [[ 0, 0, 0 ],	[-20, 20, 0 ],	[ 0, 0, 0 ]],
				"edge-detect": 	[[ 0, 9, 0 ],	[9, -40, 9 ],	[ 0, 9, 0 ]],
				'hard-edge' : [[2, 22, 1],[22, 1, -22],[ 1, -22, -2]],
				'laplace' : [[-2,-2,-2],[-2,15,-2],[-2,-2,-2]]
			},
			colorEffects = {
				"b&w" : [[1, 1, 1],[1, 1, 1],[1, 1, 1]],
				"sepia" : [[1.2, 1.1, 1],[0.8, 0.7, 0.6],[0.3, 0.2, 0.1]],
				"vintage" : [[4, 0.5, -0.6], [-0.2, 3.1, -0.1],[0.6, 0.4, 2]],
				"recolor" : [[0.1,1.5,1.5],[1.5,0.1,1.5],[1.5,1.5,0.1]],
				"red" : [[3,0, 0],[3, 0, 0],[3, 0, 0]],
				"blue" : [[0, 0, 3],[0, 0, 3],[0, 0, 3]],
				"green" : [[0, 3, 0],[0, 3, 0],[0, 3, 0]]
			};
			
		destCanvas.width = this.width(),
		destCanvas.height = this.height();
		
		// Fill with empty pixels
		destCtx.beginPath();
		destCtx.rect(0, 0, destCanvas.width, destCanvas.height);
		destCtx.fillStyle = "rgba(0,0,0,0)";
		destCtx.fill();
		destImgd = destCtx.getImageData(0, 0, destCanvas.width, destCanvas.height);
		
		// Check if we are operating on an image or in a canvas
		if(this.is('img')){
			// Create a canvas element
			srcCanvas = document.createElement('canvas');
			srcCtx = srcCanvas.getContext('2d');
			// Resize canvas to fit img
			srcCanvas.width = this.width();
			srcCanvas.height = this.height();
			// Draw image into canvas
			srcCtx.drawImage(this.get(0), 0, 0);
			srcImgd = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
			// Apply desired filter
			applyEffect();
			return;
		}else if(!this.is('canvas')){
			alert('Unsupported element');
			return;
		}
		srcCtx = srcCanvas.getContext('2d');
		srcImgd = srcCtx.getImageData(0, 0, this.width(), this.height());
		
		// --------- IMAGE FUNCTIONS ----------- //
		
		applyEffect();
		
		/**
		 * Applies a given effect to the canvas
		 */
		function applyEffect(callback){
			
			// Local variables
			var src = srcImgd,
				dest = destImgd,
				total = src.data.length,
				mat = settings.matrix,
				colorMat = null,
				current = 0,
				channel = 0,
				row, col, sum;
				
			// Effect matrix
			if(mat == null && settings.effect !== null) mat = effects[settings.effect];
			if(mat == null && settings.color == null){
				console.error('PhotoJShop error: Please specify an effect or custom matrix');
				return obj;
			}else if(mat !== null){
				var centerRow = Math.floor(mat.length/2),
					centerCol = Math.floor(mat[0].length/2),
					matTotal = mat.length*mat[0].length,
					matRow, matCol, offset, divider;
			}
			// Color effect matrix
			if(settings.color !== null) colorMat = colorEffects[settings.color];
			
			
			// Loop through each pixel
			for(row = 0; row < src.height; row++){
				for(col = 0; col < src.width*4; col++){
					// Skip alpha channel
					if(channel == 3){
						dest.data[current] = src.data[current]; // Alpha max
						current++;
						channel = 0;
						continue;
					}
					sum = 0;
					divider = matTotal;
					
					/*
					 * Apply color effect, if selected. Only apply on first channel
					 */
					if(colorMat !== null){
						sum = src.data[current - channel] * colorMat[channel][0];		// R
						sum += src.data[current - channel + 1] * colorMat[channel][1];	// G
						sum += src.data[current - channel + 2] * colorMat[channel][2];	// B
						sum = Math.min(Math.max(sum/3, 0), 255);
						dest.data[current] = sum;
						sum = 0;
					}
					
					if(mat !== null){
						/*
						 * Now loop through the effect matrix. This gives
						 * more freedom when developing filters, since it allows
						 * convolutions with matrixes of any size.
						 */
						for(matRow = 0; matRow < mat.length; matRow++){
							for(matCol = 0; matCol < mat[0].length; matCol++){
								// Skip 0 values
								if(mat[matRow][matCol] == 0) continue;
								
								offset = 0;
								// Now get the index of the corresponding pixel
								// Vertical index
								if(matRow < centerRow){
									offset -= (centerRow - matRow)*src.width*4;
								}else if(matRow > centerRow){
									offset += (matRow - centerRow)*src.width*4;
								}
								// Horizontal index
								offset += (centerCol - matCol)*4;
								
								// Add to sum if boundaries are ok
								if(current + offset < 0 || offset > src.data.length){
									divider--; // If the pixel is not used, dont divide by it.
								}else{
									sum += mat[matRow][matCol] * src.data[current + offset];
								}
							}
						}
					}
					
					// Fix and check boundaries of sum
					if(mat !== null){
						sum /= divider;
						sum = Math.min(Math.max(sum, 0), 255);
						
						// Store sum
						if(mat !== null) dest.data[current] = sum;
					}
					
					//if(current > 10 && sum > 0) return;
					
					current++;
					channel++;
				}
			}
			// Store in destination canvas
			destCtx.putImageData(dest, 0, 0);
			
			if(settings.replace){
				if(obj.is('img')) $('img').attr('src',save());
				else srcCtx.putImageData(dest, 0, 0);
				return obj;
			}else{
				// Return image data
				return save();
			}
		}
		/**
		 * Generates a data URL for the canvas
		 */
		function save(){
			return destCanvas.toDataURL();
		}
	};
})(jQuery, window, document);