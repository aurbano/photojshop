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
			'effect'		: null,	// Effect to perform
			'replace'		: true	// Replace original
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
				"sharpen": 	[[0, -1, 0],	[-1, 9, -1],	[ 0, -1, 0]],
				"emboss": 	[[ -18, -9, 0 ],	[ -9,  9,  9 ],	[ 0,  9, 18 ]],
				"lighten": 	[[1.1]],
				"darken": 	[[0.9]],
				"edge-enhance": 	[[ 0, 0, 0 ],	[-20, 20, 0 ],	[ 0, 0, 0 ]],
				"edge-detect": 	[[ 0, 9, 0 ],	[9, -18, 9 ],	[ 0, 9, 0 ]]
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
			alert('Unsupported element')
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
			console.log("Applying effect: "+settings.effect);
			if(settings.effect == null){
				console.error("PhotoJShop error: You must select an effect");
				return false;
			}
			// Local variables
			var src = srcImgd,
				dest = destImgd,
				total = src.data.length,
				mat = effects[settings.effect],
				centerRow = Math.floor(mat.length/2),
				centerCol = Math.floor(mat[0].length/2),
				matTotal = mat.length*mat[0].length,
				current = 0,
				channel = 0,
				row, col, matRow, matCol, sum, offset, divider;
			
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
							if(offset < 0 || offset > src.data.length){
								divider--;
							}else{
								sum += mat[matRow][matCol] * src.data[current + offset];
							}
							
							/*console.log("	Row: "+matRow+", Col: "+matCol);
							console.log("	Mat Value: "+mat[matRow][matCol]);
							console.log("	Offset: "+offset);
							console.log("	Sum: "+sum);//*/
						}
					}
					
					// Fix and check boundaries of sum
					sum /= divider;
					sum = Math.min(Math.max(sum, 0), 255);
					
					// Store sum
					dest.data[current] = sum;
					
					current++;
					channel++;
				}
			}
			console.log("Done");
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