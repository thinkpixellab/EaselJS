/*
* EaselMouseEvent by Grant Skinner. Dec 5, 2010
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

goog.provide('EaselMouseEvent');

/**
 * This is passed as the parameter to onPress, onMouseMove, onMouseUp, onMouseDown, and onClick handlers on
 * DisplayObject instances.
 * By default, mouse events are disabled for performance reasons. In order to enabled them for a specified stage
 * set mouseEventsEnabled to true on your stage instance.
 * @constructor
 * @param {string} type The event type.
 * @param {number} stageX The mouseX position relative to the stage.
 * @param {number} stageY The mouseY position relative to the stage.
 * @param {DisplayObject} target The display object this event relates to.
 * @param {EaselMouseEvent} nativeEvent The native DOM event related to this mouse event.
 **/
EaselMouseEvent = function(type, stageX, stageY, target, nativeEvent) {
  this.type = type;
  this.stageX = stageX;
  this.stageY = stageY;
  this.target = target;
  this.nativeEvent = nativeEvent;
};

/**
 * For events of type "onPress" and "onMouseDown" only you can assign a handler to the onMouseMove
 * property. This handler will be called every time the mouse is moved until the mouse is released.
 * This is useful for operations such as drag and drop.
 * @param {EaselMouseEvent} event A EaselMouseEvent instance with information about the current mouse event.
 **/
EaselMouseEvent.prototype.onMouseMove = null;

/**
 * For events of type "onPress" and "onMouseDown" only you can assign a handler to the onMouseUp
 * property. This handler will be called every time the mouse is moved until the mouse is released.
 * This is useful for operations such as drag and drop.
 * @param {EaselMouseEvent} event A EaselMouseEvent instance with information about the current mouse event.
 */
EaselMouseEvent.prototype.onMouseUp = null;

// public methods:
/**
 * Returns a clone of the EaselMouseEvent instance.
 * @return {EaselMouseEvent} a clone of the EaselMouseEvent instance.
 **/
EaselMouseEvent.prototype.clone = function() {
  return new EaselMouseEvent(this.type, this.stageX, this.stageY, this.target, this.nativeEvent);
};

/**
 * Returns a string representation of this object.
 * @return {string} a string representation of the instance.
 **/
EaselMouseEvent.prototype.toString = function() {
  return '[EaselMouseEvent (type=' + this.type + ' stageX=' + this.stageX + ' stageY=' + this.stageY + ')]';
};
