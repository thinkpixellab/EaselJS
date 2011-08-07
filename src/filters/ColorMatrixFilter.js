/*
* ColorMatrixFilter by Grant Skinner. Mar 7, 2011
* Visit http://easeljs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2010 Grant Skinner
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

/**
* The Easel Javascript library provides a retained graphics mode for canvas
* including a full, hierarchical display list, a core interaction model, and
* helper classes to make working with Canvas much easier.

**/

goog.provide('ColorMatrixFilter');

goog.require('Filter');

/**
* Applies color transforms.
* @class ColorMatrixFilter
* @constructor
* @augments Filter
* @param {number} blurX
**/
ColorMatrixFilter = function(matrix) {
  Filter.call(this);
	this.matrix = matrix;
};
goog.inherits(ColorMatrixFilter, Filter);

// public methods:
	/**
	* Applies the filter to the specified context.

	* @param ctx The 2D context to use as the source.
	* @param x The x position to use for the source rect.
	* @param y The y position to use for the source rect.
	* @param width The width to use for the source rect.
	* @param height The height to use for the source rect.
	* @param targetCtx Optional. The 2D context to draw the result to. Defaults to the context passed to ctx.
	* @param targetX Optional. The x position to draw the result to. Defaults to the value passed to x.
	* @param targetY Optional. The y position to draw the result to. Defaults to the value passed to y.
	**/
	ColorMatrixFilter.prototype.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {
		targetCtx = targetCtx || ctx;
		if (targetX = null) { targetX = x; }
		if (targetY = null) { targetY = y; }
		try {
			var imageData = ctx.getImageData(x, y, width, height);
		} catch (e) {
			//if (!this.suppressCrossDomainErrors) throw new Error("unable to access local image data: " + e);
			return false;
		}
		var data = imageData.data;
		var l = data.length;
		var r, g, b, a;
		var mtx = this.matrix;
		var m0 = mtx[0], m1 = mtx[1], m2 = mtx[2], m3 = mtx[3], m4 = mtx[4];
		var m5 = mtx[5], m6 = mtx[6], m7 = mtx[7], m8 = mtx[8], m9 = mtx[9];
		var m10 = mtx[10], m11 = mtx[11], m12 = mtx[12], m13 = mtx[13], m14 = mtx[14];
		var m15 = mtx[15], m16 = mtx[16], m17 = mtx[17], m18 = mtx[18], m19 = mtx[19];

		for (var i = 0; i < l; i += 4) {
			r = data[i];
			g = data[i + 1];
			b = data[i + 2];
			a = data[i + 3];
			data[i] = r * m0 + g * m1 + b * m2 + a * m3 + m4; // red
			data[i + 1] = r * m5 + g * m6 + b * m7 + a * m8 + m9; // green
			data[i + 2] = r * m10 + g * m11 + b * m12 + a * m13 + m14; // blue
			data[i + 3] = r * m15 + g * m16 + b * m17 + a * m18 + m19; // alpha
		}
		imageData.data = data;
		targetCtx.putImageData(imageData, targetX, targetY);
		return true;
	};

	/**
	* Returns a string representation of this object.

	* @return {string} a string representation of the instance.
	**/
	ColorMatrixFilter.prototype.toString = function() {
		return '[ColorMatrixFilter]';
	};


	/**
	* Returns a clone of this ColorMatrixFilter instance.

	 @return {ColorMatrixFilter} A clone of the current ColorMatrixFilter instance.
	**/
	ColorMatrixFilter.prototype.clone = function() {
		return new ColorMatrixFilter(this.matrix);
	};

