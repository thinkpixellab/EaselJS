goog.require('DisplayText');
goog.require('Ticker');
goog.require('Ship');
goog.require('SpaceRock');
goog.require('Stage');

/**
 * @constructor
 **/
var Game = function() {
  this.canvas = /** @type {!HTMLCanvasElement} */ document.getElementById("testCanvas");
  this.stage = new Stage(this.canvas);

  this.scoreField = new DisplayText("0", "bold 12px Arial", "#FFFFFF");
  this.scoreField.textAlign = "right";
  this.scoreField.x = this.canvas.width - 10;
  this.scoreField.y = 22;

  this.messageField = new DisplayText("Welcome:  Click to play", "bold 24px Arial", "#FFFFFF");
  this.messageField.textAlign = "center";
  this.messageField.x = this.canvas.width / 2;
  this.messageField.y = this.canvas.height / 2;

  this.canvas.onclick = goog.bind(Game.prototype.handleClick, this);
  document.onkeydown = goog.bind(this.handleKeyDown, this);
  document.onkeyup = goog.bind(this.handleKeyUp, this);

  this.watchRestart();
};

Game.DIFFICULTY = 2; //how fast the game gets mor difficult
Game.ROCK_TIME = 110; //aprox tick count untill a new asteroid gets introduced
Game.SUB_ROCK_COUNT = 4; //how many small rocks to make on rock death
Game.BULLET_TIME = 5; //ticks between bullets
Game.BULLET_ENTROPY = 100; //how much energy a bullet has before it runs out.
Game.TURN_FACTOR = 7; //how far the ship turns per frame
Game.BULLET_SPEED = 17; //how fast the bullets move
Game.KEYCODE_SPACE = 32; //usefull keycode
Game.KEYCODE_UP = 38; //usefull keycode
Game.KEYCODE_LEFT = 37; //usefull keycode
Game.KEYCODE_RIGHT = 39; //usefull keycode
Game.KEYCODE_W = 87; //usefull keycode
Game.KEYCODE_A = 65; //usefull keycode
Game.KEYCODE_D = 68; //usefull keycode

Game.prototype.watchRestart = function() {
  this.stage.addChild(this.messageField);
  this.stage.update(); //update the stage to show text
};

Game.prototype.handleClick = function() {
  this.stage.removeChild(this.messageField);
  this.restart();
};

//reset all game logic
Game.prototype.restart = function() {
  //hide anything on stage and show the score
  this.stage.removeAllChildren();
  this.scoreField.text = (0).toString();
  this.stage.addChild(this.scoreField);

  //new arrays to dump old data
  this.rockBelt = [];
  this.bulletStream = [];

  //create the player
  this.alive = true;
  this.ship = new Ship();
  this.ship.x = this.canvas.width / 2;
  this.ship.y = this.canvas.height / 2;

  //log time untill values
  this.timeToRock = Game.ROCK_TIME;
  this.nextRock = 0;
  this.nextBullet = 0;

  //reset key presses
  this.shootHeld = false;
  this.lfHeld = false;
  this.rtHeld = false;
  this.fwdHeld = false;

  //ensure stage is blank and add the ship
  this.stage.clear();
  this.stage.addChild(this.ship);

  //start game timer
  Ticker.removeListener(this);
  Ticker.addListener(this);
};

Game.prototype.tick = function() {
  var index;
  var o;

  //handle firing
  if (this.nextBullet <= 0) {
    if (this.alive && this.shootHeld) {
      this.nextBullet = Game.BULLET_TIME;
      this.fireBullet();
    }
  } else {
    this.nextBullet--;
  }

  //handle turning
  if (this.alive && this.lfHeld) {
    this.ship.rotation -= Game.TURN_FACTOR;
  } else if (this.alive && this.rtHeld) {
    this.ship.rotation += Game.TURN_FACTOR;
  }

  //handle thrust
  if (this.alive && this.fwdHeld) {
    this.ship.accelerate();
  }

  //handle new spaceRocks
  if (this.nextRock <= 0) {
    if (this.alive) {
      this.timeToRock -= Game.DIFFICULTY; //reduce spaceRock spacing slowly to increase difficulty with time
      index = this.getSpaceRock(SpaceRock.LRG_ROCK);
      this.rockBelt[index].floatOnScreen(this.canvas.width, this.canvas.height);
      this.nextRock = this.timeToRock * (Math.random() + 1);
    }
  } else {
    this.nextRock--;
  }

  //handle ship looping
  if (this.alive && this.outOfBounds(this.ship, this.ship.bounds)) {
    this.placeInBounds(this.ship, this.ship.bounds);
  }

  //handle bullet movement and looping
  for (var bullet in this.bulletStream) {
    o = this.bulletStream[bullet];
    if (!o || !o.active) {
      continue;
    }
    if (this.outOfBounds(o, this.ship.bounds)) {
      this.placeInBounds(o, this.ship.bounds);
    }
    o.x += Math.sin(o.rotation * (Math.PI / -180)) * Game.BULLET_SPEED;
    o.y += Math.cos(o.rotation * (Math.PI / -180)) * Game.BULLET_SPEED;

    if (--o.entropy <= 0) {
      this.stage.removeChild(o);
      o.active = false;
    }
  }

  //handle spaceRocks (nested in one loop to prevent excess loops)
  for (var spaceRock in this.rockBelt) {
    o = this.rockBelt[spaceRock];
    if (!o || !o.active) {
      continue;
    }

    //handle spaceRock movement and looping
    if (this.outOfBounds(o, o.bounds)) {
      this.placeInBounds(o, o.bounds);
    }
    o.tick();

    //handle spaceRock ship collisions
    if (this.alive && o.hitRadius(this.ship.x, this.ship.y, this.ship.hit)) {
      this.alive = false;

      this.stage.removeChild(this.ship);
      this.messageField.text = "You're dead:  Click to play again";
      this.stage.addChild(this.messageField);
      this.watchRestart();

      continue;
    }

    //handle spaceRock bullet collisions
    for (bullet in this.bulletStream) {
      var p = this.bulletStream[bullet];
      if (!p || !p.active) {
        continue;
      }

      if (o.hitPoint(p.x, p.y)) {
        var newSize;
        switch (o.size) {
        case SpaceRock.LRG_ROCK:
          newSize = SpaceRock.MED_ROCK;
          break;
        case SpaceRock.MED_ROCK:
          newSize = SpaceRock.SML_ROCK;
          break;
        case SpaceRock.SML_ROCK:
          newSize = 0;
          break;
        }

        //score
        if (this.alive) {
          this.addScore(o.score);
        }

        //create more
        if (newSize > 0) {
          var i;
          var offSet;

          for (i = 0; i < Game.SUB_ROCK_COUNT; i++) {
            index = this.getSpaceRock(newSize);
            offSet = (Math.random() * o.size * 2) - o.size;
            this.rockBelt[index].x = o.x + offSet;
            this.rockBelt[index].y = o.y + offSet;
          }
        }

        //remove
        this.stage.removeChild(o);
        this.rockBelt[spaceRock].active = false;

        this.stage.removeChild(p);
        this.bulletStream[bullet].active = false;
      }
    }
  }

  //call sub ticks
  this.ship.tick();
  this.stage.update();
};

Game.prototype.outOfBounds = function(o, bounds) {
  //is it visibly off screen
  return o.x < bounds * -2 || o.y < bounds * -2 || o.x > this.canvas.width + bounds * 2 || o.y > this.canvas.height + bounds * 2;
};

Game.prototype.placeInBounds = function(o, bounds) {
  //if its visual bounds are entirely off screen place it off screen on the other side
  if (o.x > this.canvas.width + bounds * 2) {
    o.x = bounds * -2;
  } else if (o.x < bounds * -2) {
    o.x = this.canvas.width + bounds * 2;
  }

  //if its visual bounds are entirely off screen place it off screen on the other side
  if (o.y > this.canvas.height + bounds * 2) {
    o.y = bounds * -2;
  } else if (o.y < bounds * -2) {
    o.y = this.canvas.height + bounds * 2;
  }
};

Game.prototype.fireBullet = function() {
  //create the bullet
  var o = this.bulletStream[this.getBullet()];
  o.x = this.ship.x;
  o.y = this.ship.y;
  o.rotation = this.ship.rotation;
  o.entropy = Game.BULLET_ENTROPY;
  o.active = true;

  //draw the bullet
  o.graphics.beginStroke("#FFFFFF").moveTo(-1, 0).lineTo(1, 0);
};

Game.prototype.getSpaceRock = function(size) {
  var i = 0;
  var len = this.rockBelt.length;

  //pooling approach
  while (i <= len) {
    if (!this.rockBelt[i]) {
      this.rockBelt[i] = new SpaceRock(size);
      break;
    } else if (!this.rockBelt[i].active) {
      this.rockBelt[i].activate(size);
      break;
    } else {
      i++;
    }
  }

  if (len === 0) {
    this.rockBelt[0] = new SpaceRock(size);
  }

  this.stage.addChild(this.rockBelt[i]);
  return i;
};

Game.prototype.getBullet = function() {
  var i = 0;
  var len = this.bulletStream.length;

  //pooling approach
  while (i <= len) {
    if (!this.bulletStream[i]) {
      this.bulletStream[i] = new Shape();
      break;
    } else if (!this.bulletStream[i].active) {
      this.bulletStream[i].active = true;
      break;
    } else {
      i++;
    }
  }

  if (len === 0) {
    this.bulletStream[0] = new Shape();
  }

  this.stage.addChild(this.bulletStream[i]);
  return i;
};

//allow for WASD and arrow control scheme
Game.prototype.handleKeyDown = function(e) {
  //cross browser issues exist
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
  case Game.KEYCODE_SPACE:
    this.shootHeld = true;
    break;
  case Game.KEYCODE_A:
  case Game.KEYCODE_LEFT:
    this.lfHeld = true;
    break;
  case Game.KEYCODE_D:
  case Game.KEYCODE_RIGHT:
    this.rtHeld = true;
    break;
  case Game.KEYCODE_W:
  case Game.KEYCODE_UP:
    this.fwdHeld = true;
    break;
  }
};

Game.prototype.handleKeyUp = function(e) {
  //cross browser issues exist
  if (!e) {
    e = window.event;
  }
  switch (e.keyCode) {
  case Game.KEYCODE_SPACE:
    this.shootHeld = false;
    break;
  case Game.KEYCODE_A:
  case Game.KEYCODE_LEFT:
    this.lfHeld = false;
    break;
  case Game.KEYCODE_D:
  case Game.KEYCODE_RIGHT:
    this.rtHeld = false;
    break;
  case Game.KEYCODE_W:
  case Game.KEYCODE_UP:
    this.fwdHeld = false;
    break;
  }
};

Game.prototype.addScore = function(value) {
  //trust the field will have a number and add the score
  this.scoreField.text = (Number(this.scoreField.text) + Number(value)).toString();
};

goog.exportSymbol('Game', Game);
goog.exportProperty(Game.prototype, 'tick', Game.prototype.tick);
