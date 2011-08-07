/*
* Stage by Grant Skinner. Dec 5, 2010
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
 * @module EaselJS
 **/

goog.provide('Stage');

goog.require('Container');

/**
 * A stage is the root level Container for a display list. Each time its tick method is called, it will render its display
 * list to its target canvas.
 * @class Stage
 * @extends Container
 * @constructor
 * @param {HTMLCanvasElement} canvas The canvas the stage will render to.
 **/
Stage = function(canvas, useTouch) {
  Container.call(this);
  this.canvas = canvas;
  this._enableMouseEvents(true);
};
goog.inherits(Stage, Container);

// static properties:
/**
 * @property _snapToPixelEnabled
 * @protected
 * @type Boolean
 * @default false
 **/
Stage._snapToPixelEnabled = false; // snapToPixelEnabled is temporarily copied here during a draw to provide global access.
// public properties:
/**
 * Indicates whether the stage should automatically clear the canvas before each render. You can set this to false to manually
 * control clearing (for generative art, or when pointing multiple stages at the same canvas for example).
 * @property autoClear
 * @type Boolean
 * @default true
 **/
Stage.prototype.autoClear = true;

/** The canvas the stage will render to. Multiple stages can share a single canvas, but you must disable autoClear for all but the
 * first stage that will be ticked (or they will clear each other's render).
 * @property canvas
 * @type HTMLCanvasElement
 **/
Stage.prototype.canvas = null;

/**
 * READ-ONLY. The current mouse X position on the canvas. If the mouse leaves the canvas, this will indicate the most recent
 * position over the canvas, and mouseInBounds will be set to false.
 * @property mouseX
 * @type Number
 * @final
 **/
Stage.prototype.mouseX = null;

/** READ-ONLY. The current mouse Y position on the canvas. If the mouse leaves the canvas, this will indicate the most recent
 * position over the canvas, and mouseInBounds will be set to false.
 * @property mouseY
 * @type Number
 * @final
 **/
Stage.prototype.mouseY = null;

/** The onMouseMove callback is called when the user moves the mouse over the canvas.  The handler is passed a single param
 * containing the corresponding EaselMouseEvent instance.
 * @event onMouseMove
 * @param {EaselMouseEvent} event A EaselMouseEvent instance with information about the current mouse event.
 **/
Stage.prototype.onMouseMove = null;

/**
 * The onMouseUp callback is called when the user releases the mouse button anywhere that the page can detect it.  The handler
 * is passed a single param containing the corresponding EaselMouseEvent instance.
 * @event onMouseUp
 * @param {EaselMouseEvent} event A EaselMouseEvent instance with information about the current mouse event.
 **/
Stage.prototype.onMouseUp = null;

/**
 * The onMouseDown callback is called when the user presses the mouse button over the canvas.  The handler is passed a single
 * param containing the corresponding EaselMouseEvent instance.
 * @event onMouseDown
 * @param {EaselMouseEvent} event A EaselMouseEvent instance with information about the current mouse event.
 **/
Stage.prototype.onMouseDown = null;

/**
 * Indicates whether this stage should use the snapToPixel property of display objects when rendering them.
 * @property snapToPixelEnabled
 * @type Boolean
 * @default false
 **/
Stage.prototype.snapToPixelEnabled = false;

/** Indicates whether the mouse is currently within the bounds of the canvas.
 * @property mouseInBounds
 * @type Boolean
 * @default false
 **/
Stage.prototype.mouseInBounds = false;

// private properties:
/** If false, tick callbacks will be called on all display objects on the stage prior to rendering to the canvas.
 * @property tickOnUpdate
 * @type Boolean
 * @default false
 **/
Stage.prototype.tickOnUpdate = true;

// private properties:
/**
 * @property _activeEaselMouseEvent
 * @protected
 * @type EaselMouseEvent
 **/
Stage.prototype._activeEaselMouseEvent = null;

/**
 * @property _activeMouseTarget
 * @protected
 * @type DisplayObject
 **/
Stage.prototype._activeMouseTarget = null;

/**
 * @property _mouseOverIntervalID
 * @protected
 * @type Number
 **/
Stage.prototype._mouseOverIntervalID = null;

/**
 * @property _mouseOverX
 * @protected
 * @type Number
 **/
Stage.prototype._mouseOverX = 0;

/**
 * @property _mouseOverY
 * @protected
 * @type Number
 **/
Stage.prototype._mouseOverY = 0;

/**
 * @property _mouseOverTarget
 * @protected
 * @type DisplayObject
 **/
Stage.prototype._mouseOverTarget = null;

// public methods:
/**
 * @event tick
 * Broadcast to children when the stage is updated.
 **/

/**
 * Each time the update method is called, the stage will tick any descendants exposing a tick method (ex. BitmapSequence)
 * and render its entire display list to the canvas.

 **/
Stage.prototype.update = function() {
  if (!this.canvas) {
    return;
  }
  if (this.autoClear) {
    this.clear();
  }
  Stage._snapToPixelEnabled = this.snapToPixelEnabled;
  if (this.tickOnUpdate) {
    this._tick();
  }
  this.draw(this.canvas.getContext('2d'), false, this.getConcatenatedMatrix(this._matrix));
};

/**
 * Calls the update method. Useful for adding stage as a listener to Ticker directly.
 * @property tick
 * @private
 * @type Function
 **/
Stage.prototype.tick = Stage.prototype.update;

/**
 * Clears the target canvas. Useful if autoClear is set to false.

 **/
Stage.prototype.clear = function() {
  if (!this.canvas) {
    return;
  }
  var ctx = this.canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
};

/**
 * Returns a data url that contains a Base64 encoded image of the contents of the stage. The returned data url can be
 * specified as the src value of an image element.

 * @param {String} backgroundColor The background color to be used for the generated image. The value can be any value HTML color
 * value, including HEX colors, rgb and rgba. The default value is a transparent background.
 * @param {String} mimeType The MIME type of the image format to be create. The default is "image/png". If an unknown MIME type
 * is passed in, or if the browser does not support the specified MIME type, the default value will be used.
 * @return {String} a Base64 encoded image.
 **/
Stage.prototype.toDataURL = function(backgroundColor, mimeType) {
  if (!mimeType) {
    mimeType = 'image/png';
  }

  var ctx = this.canvas.getContext('2d');
  var w = this.canvas.width;
  var h = this.canvas.height;

  var data;

  if (backgroundColor) {

    //get the current ImageData for the canvas.
    data = ctx.getImageData(0, 0, w, h);

    //store the current globalCompositeOperation
    var compositeOperation = ctx.globalCompositeOperation;

    //set to draw behind current content
    ctx.globalCompositeOperation = 'destination-over';

    //set background color
    ctx.fillStyle = backgroundColor;

    //draw background on entire canvas
    ctx.fillRect(0, 0, w, h);
  }

  //get the image data from the canvas
  var dataURL = this.canvas.toDataURL(mimeType);

  if (backgroundColor) {
    //clear the canvas
    ctx.clearRect(0, 0, w, h);

    //restore it with original settings
    ctx.putImageData(data, 0, 0);

    //reset the globalCompositeOperation to what it was
    ctx.globalCompositeOperation = compositeOperation;
  }

  return dataURL;
};

/**
 * Enables or disables (by passing a frequency of 0) mouse over handlers (onMouseOver and onMouseOut) for this stage's display
 * list. These events can be expensive to generate, so they are disabled by default, and the frequency of the events
 * can be controlled independently of mouse move events via the frequency parameter.

 * @param {Number} frequency The maximum number of times per second to broadcast mouse over/out events. Set to 0 to disable mouse
 * over events completely. Maximum is 50. A lower frequency is less responsive, but uses less CPU.
 **/
Stage.prototype.enableMouseOver = function(frequency) {
  if (this._mouseOverIntervalID) {
    clearInterval(this._mouseOverIntervalID);
    this._mouseOverIntervalID = null;
  }
  if (frequency <= 0) {
    return;
  }
  var o = this;
  this._mouseOverIntervalID = setInterval(function() {
    o._testMouseOver();
  }, 1000 / Math.min(50, frequency));
  this._mouseOverX = NaN;
  this._mouseOverTarget = null;
};

/**
 * Returns a clone of this Stage.
 * @return {Stage} A clone of the current Container instance.
 **/
Stage.prototype.clone = function() {
  var o = new Stage(null);
  this.cloneProps(o);
  return o;
};

/**
 * Returns a string representation of this object.

 * @return {String} a string representation of the instance.
 **/
Stage.prototype.toString = function() {
  return '[Stage (name=' + this.name + ')]';
};

// private methods:
/**

 * @protected
 * @param {Boolean} enabled
 **/
Stage.prototype._enableMouseEvents = function() {
  var o = this;
  var evtTarget = window.addEventListener ? window : document;
  evtTarget.addEventListener('mouseup', function(e) {
    o._handleMouseUp(e);
  }, false);
  evtTarget.addEventListener('mousemove', function(e) {
    o._handleMouseMove(e);
  }, false);
  evtTarget.addEventListener('dblclick', function(e) {
    o._handleDoubleClick(e);
  }, false);
  this.canvas.addEventListener('mousedown', function(e) {
    o._handleMouseDown(e);
  }, false);
};

/**

 * @protected
 * @param {EaselMouseEvent} e
 **/
Stage.prototype._handleMouseMove = function(e) {

  if (!this.canvas) {
    this.mouseX = this.mouseY = null;
    return;
  }
  if (!e) {
    e = window.event;
  }

  var inBounds = this.mouseInBounds;
  this._updateMousePosition(e.pageX, e.pageY);
  if (!inBounds && !this.mouseInBounds) {
    return;
  }

  var evt = new EaselMouseEvent('onMouseMove', this.mouseX, this.mouseY, this, e);

  if (this.onMouseMove) {
    this.onMouseMove(evt);
  }
  if (this._activeEaselMouseEvent && this._activeEaselMouseEvent.onMouseMove) {
    this._activeEaselMouseEvent.onMouseMove(evt);
  }
};

/**

 * @protected
 * @param {Number} pageX
 * @param {Number} pageY
 **/
Stage.prototype._updateMousePosition = function(pageX, pageY) {

  var o = this.canvas;
  do {
    pageX -= o.offsetLeft;
    pageY -= o.offsetTop;
    o = o.offsetParent;
  } while (o);

  this.mouseInBounds = (pageX >= 0 && pageY >= 0 && pageX < this.canvas.width && pageY < this.canvas.height);

  if (this.mouseInBounds) {
    this.mouseX = pageX;
    this.mouseY = pageY;
  }
};

/**

 * @protected
 * @param {EaselMouseEvent} e
 **/
Stage.prototype._handleMouseUp = function(e) {
  var evt = new EaselMouseEvent('onMouseUp', this.mouseX, this.mouseY, this, e);
  if (this.onMouseUp) {
    this.onMouseUp(evt);
  }
  if (this._activeMouseEvent && this._activeMouseEvent.onMouseUp) {
    this._activeMouseEvent.onMouseUp(evt);
  }
  if (this._activeMouseTarget && this._activeMouseTarget.onClick && this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, true, (this._mouseOverIntervalID ? 3 : 1)) == this._activeMouseTarget) {

    this._activeMouseTarget.onClick(new EaselMouseEvent('onClick', this.mouseX, this.mouseY, this._activeMouseTarget, e));
  }
  this._activeMouseEvent = this._activeMouseTarget = null;
};

/**

 * @protected
 * @param {EaselMouseEvent} e
 **/
Stage.prototype._handleMouseDown = function(e) {
  if (this.onMouseDown) {
    this.onMouseDown(new EaselMouseEvent('onMouseDown', this.mouseX, this.mouseY, this, e));
  }
  var target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, (this._mouseOverIntervalID ? 3 : 1));
  if (target) {
    if (target.onPress instanceof Function) {
      var evt = new EaselMouseEvent('onPress', this.mouseX, this.mouseY, target, e);
      target.onPress(evt);
      if (evt.onMouseMove || evt.onMouseUp) {
        this._activeEaselMouseEvent = evt;
      }
    }
    this._activeMouseTarget = target;
  }
};

/**

 * @protected
 **/
Stage.prototype._testMouseOver = function() {
  if (this.mouseX == this._mouseOverX && this.mouseY == this._mouseOverY && this.mouseInBounds) {
    return;
  }
  var target = null;
  if (this.mouseInBounds) {
    target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, 3);
    this._mouseOverX = this.mouseX;
    this._mouseOverY = this.mouseY;
  }

  if (this._mouseOverTarget != target) {
    if (this._mouseOverTarget && this._mouseOverTarget.onMouseOut) {
      this._mouseOverTarget.onMouseOut(new EaselMouseEvent('onMouseOut', this.mouseX, this.mouseY, this._mouseOverTarget));
    }
    if (target && target.onMouseOver) {
      target.onMouseOver(new EaselMouseEvent('onMouseOver', this.mouseX, this.mouseY, target));
    }
    this._mouseOverTarget = target;
  }
};

/**

 * @protected
 * @param {EaselMouseEvent} e
 **/
Stage.prototype._handleDoubleClick = function(e) {
  if (this.onDoubleClick) {
    this.onDoubleClick(new EaselMouseEvent('onDoubleClick', this.mouseX, this.mouseY, this, e));
  }
  var target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, (this._mouseOverIntervalID ? 3 : 1));
  if (target) {
    if (target.onDoubleClick instanceof Function) {
      target.onDoubleClick(new EaselMouseEvent('onPress', this.mouseX, this.mouseY, target, e));
    }
  }
};

/**
 * @param {DisplayObject} displayObject
 * @return {Stage}
 */
Stage.findStage = function(displayObject) {
  var o = displayObject;
  while (o.parent) {
    o = o.parent;
  }
  if (o instanceof Stage) {
    return o;
  }
  return null;
};
