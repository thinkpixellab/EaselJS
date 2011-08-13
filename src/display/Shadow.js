/*
* Shadow by Grant Skinner. Dec 5, 2010
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

goog.provide('Shadow');

/**
 * Encapsulates the properties required to define a shadow to apply to a DisplayObject via it's .shadow property.
 * @constructor
 * @param {string} color The color of the shadow.
 * @param {number} offsetX The x offset of the shadow.
 * @param {number} offsetY The y offset of the shadow.
 * @param {number} blur The size of the blurring effect.
 **/
Shadow = function(color, offsetX, offsetY, blur) {
  this.color = color;
  this.offsetX = offsetX;
  this.offsetY = offsetY;
  this.blur = blur;
};

// public methods:
/**
 * Returns a string representation of this object.
 * @return {string} a string representation of the instance.
 **/
Shadow.prototype.toString = function() {
  return '[Shadow]';
};

/**
 * Returns a clone of this Shadow instance.
 
 @return {Shadow} A clone of the current Shadow instance.
 **/
Shadow.prototype.clone = function() {
  return new Shadow(this.color, this.offsetX, this.offsetY, this.blur);
};

// this has to be populated after the class is defined:
Shadow.identity = new Shadow('black', 0, 0, 0);
