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
			srcImgd = null,
			destImgd = null,
			effects = {
				"blur": 	[[ 1.000, 1.000, 1.000 ],	[ 1.000, 1.000, 1.000 ],	[ 1.000, 1.000, 1.000 ]],
				"sharpen": 	[[ 0.000, -3.00, 0.000 ],	[ -3.00, 21.00, -3.00 ],	[ 0.000, -3.00, 0.000 ]],
				"emboss": 	[[ -18.0, -9.00, 0.000 ],	[ -9.00,  9.00,  9.00 ],	[ 0.000,  9.00, 18.00 ]],
				"lighten": 	[[ 0.000, 0.000, 0.000 ],	[ 0.000, 12.00, 0.000 ],	[ 0.000, 0.000, 0.000 ]],
				"darken": 	[[ 0.000, 0.000, 0.000 ],	[ 0.000, 6.000, 0.000 ],	[ 0.000, 0.000, 0.000 ]],
				"edge": 	[[ 0.000, 9.000, 0.000 ],	[ 9.000, -36.0, 9.000 ],	[ 0.000, 9.000, 0.000 ]]
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
			// Draw both (Only for development)
			//$('article').append(srcCanvas);
			$('article').append(destCanvas);
			// Create new context
			srcCtx.drawImage(this.get(0), 0, 0);	// Draw image into canvas
			srcImgd = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
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
		srcImgd = srcCtx.getImageData(0, 0, this.width(), this.height());
		
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
			var pix = srcImgd, auxAvg, points;
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
				row, col, matRow, matCol, sum, offset;
				
			// Loop through each pixel
			for(row = 0; row < src.height; row++){
				for(col = 0; col < src.width*4; col++){
					// Skip alpha channel
					if(channel == 3){
						dest.data[current] = 255; // Alpha max
						current++;
						channel = 0;
						continue;
					}
					sum = 0;
					
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
								offset -= (centerRow - matRow)*src.width*4; // Might be 4
							}else if(matRow > centerRow){
								offset += (matRow - centerRow)*src.width*4; // Might be 4
							}
							// Horizontal index
							offset += (centerCol - matCol)*4;
							
							// Add to sum if boundaries are ok
							if(offset < 0 || offset > src.data.length) sum += 0;
							else sum += mat[matRow][matCol] * src.data[current + offset];
							
							/*console.log("	Row: "+matRow+", Col: "+matCol);
							console.log("	Mat Value: "+mat[matRow][matCol]);
							console.log("	Offset: "+offset);
							console.log("	Sum: "+sum);//*/
						}
					}
					
					// Fix and check boundaries of sum
					sum /= matTotal;
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