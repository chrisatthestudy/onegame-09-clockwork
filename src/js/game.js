/*
 * =============================================================================
 * Clockwork
 * =============================================================================
 * September game for One Game A Month
 *
 * (c) 2013 chrisatthestudy
 * -----------------------------------------------------------------------------
 * See the end of this file for the main entry point
 */

/*
 * =============================================================================
 * DebugConsole() - simple console display
 * =============================================================================
 */
//{{{
var DebugConsole = function( options ) {
    
    var self = {
        setup: function( options ) {
            this.visible = true;
        },
        
        update: function( ) {
        },
        
        draw: function( ) {
            if (this.visible) {
                // Draw the console background as a semi-transparent rectangle
                // at the top of the screen
                jaws.context.fillStyle = "rgba(128, 128, 128, 0.5";
                jaws.context.fillRect( 0, 0, jaws.width, 64 );
                jaws.context.fillStyle = "#ffffff";
                jaws.context.fillText("Mouse: " + jaws.mouse_x + ", " + jaws.mouse_y, 8, 16);
                jaws.context.fillText("Ticks: " + jaws.game_loop.ticks, 8, 32);
                jaws.context.fillText("FPS: " + jaws.game_loop.fps, 8, 48);
            }
        }
    };
    
    self.setup( options );
    return self;
};
//}}}

/*
 * =============================================================================
 * Countdown() - handles Timer countdowns
 * =============================================================================
 * This is a private class used internally by the Timer object (see below), and
 * holds details of a single countdown
 */
//{{{
Countdown = function(duration) {
    'use strict';
    
    var self = {
        duration: duration,
        active: true,
        expired: false,
        last_tick: jaws.game_loop.current_tick,
        
        // ---------------------------------------------------------------------
        // reset(duration)
        // ---------------------------------------------------------------------
        reset: function(duration) {
            this.duration = duration;
            this.active = true;
            this.expired = false;
            this.last_tick = jaws.game_loop.current_tick;
        },
        
        // -----------------------------------------------------------------------------
        // update()
        // -----------------------------------------------------------------------------
        update: function(tick) {
            if ((!this.expired) && (Math.floor((tick - this.last_tick) / 100) >= 1)) {
                this.last_tick = tick;
                this.duration--;
                if (this.duration <= 0) {
                    this.expired = true;
                }
            }
        },
        
        // -----------------------------------------------------------------------------
        // remove()
        // -----------------------------------------------------------------------------
        remove: function() {
            this.active = false;
        }
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Timer() - game timer, stopwatch, and countdown handler
 * =============================================================================
 * Keeps track of the duration of the game and provides countdown and counter
 * facilities.
 *
 * This class has to be slightly tricky because it needs to accommodate the game
 * pausing (when the browser tab loses focus, for example) and to continue the
 * timing correctly when it is unpaused.
 *
 * It also provides a 'counter' facility. Start it using 'startCounter', and
 * then check the 'counter' property to find out how long it has been since the
 * counter was started.
 */
//{{{ 
Timer = function() {
    'use strict';
    
    var self = {

        // Number of seconds since the Timer was created or last reset        
        seconds: 1,
        
        // Collection of active countdowns
        countdowns: [],
        
        // Keep a record of the last game tick so that we can track the time
        last_tick: jaws.game_loop.current_tick,
            
        // ---------------------------------------------------------------------
        // reset()
        // ---------------------------------------------------------------------
        reset: function() {
            'use strict';
            // Set the timer to 1 second (starting from 0 seems to cause issues if
            // you attempt to use mod (%) on the seconds)
            this.seconds = 1;
            this.last_tick = jaws.game_loop.current_tick;
        },
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        update: function() {
            'use strict';
            var tick = jaws.game_loop.current_tick;
            // Check the difference between the last tick and the current tick. If
            // amounts to 1 second or more, assume that 1 second has passed. This
            // means that if multiple seconds have passed (because the game has been
            // paused), it will still only count as a single second. This is not
            // exactly accurate, but works well enough for the game.
            this.countdowns.forEach( function(item, total) { item.update(tick); } );
            if (Math.floor((tick - this.last_tick) / 1000) >= 1) {
                this.last_tick = tick;
                this.seconds++;
                if (this.counter >= 0) {
                    if (Math.floor((tick - this.last_counter_tick) / 1000) >= 1) {
                        this.last_counter_tick = tick;
                        this.counter++;
                    }
                }
            }
            this.countdowns = this.countdowns.filter(function(item) { return (item.active); });
        },
        
        // ---------------------------------------------------------------------
        // startCountdown()
        // ---------------------------------------------------------------------
        // Creates and returns a new Countdown.
        startCountdown: function(duration) {
            'use strict';
            var countdown = Countdown(duration);
            this.countdowns.push(countdown);
            return countdown;
        },
        
        // Starts a counter, taking the current second as 0 and counting up each
        // second.
        startCounter: function() {
            this.counter = 0;
            this.last_counter_tick = jaws.game_loop.current_tick;
        },
        
        // Stops the counter.
        stopCounter: function() {
            this.counter = -1;
        },
        
        // Returns True if the counter is active.
        isActive: function() {
            return (this.counter != -1);
        }
    };

    self.reset( );    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Button() - Simple two-state button
 * =============================================================================
 */
//{{{
var Button = function( options ) {
    
    var self = {
        
        setup: function( options ) {
            this.sprite = jaws.Sprite( { image: options.image, x: options.x, y: options.y } );
            this.images = new jaws.Animation( {sprite_sheet: options.image, frame_size: [this.sprite.width / 2, this.sprite.height]} );
        },
        
        update: function( ) {
            var x = jaws.mouse_x;
            var y = jaws.mouse_y;
            var rune;
            if (this.sprite.rect().collidePoint(x, y)) {
                this.images.index = 1;
            } else {
                this.images.index = 0;
            }
            this.sprite.setImage(this.images.currentFrame());
            this.wasClicked = this.rect().collidePoint(jaws.mouse_x, jaws.mouse_y);
        },
        
        draw: function( ) {
            this.sprite.draw( );
        },
        
        rect: function( ) {
            return this.sprite.rect( );
        },
        
        setImage: function( image ) {
            this.sprite.setImage( image );
            this.images = new jaws.Animation( {sprite_sheet: image, frame_size: [this.sprite.width / 2, this.sprite.height]} );
        },
        
        moveTo: function( x, y ) {
            this.sprite.x = x;
            this.sprite.y = y;
        }
        
    }
    
    self.setup( options );
    return self;
}
//}}}

/*
 * =============================================================================
 * Intro() - Intro state handler.
 * =============================================================================
 */
//{{{
var Intro = function() {
    
    var self = {

        // ---------------------------------------------------------------------
        // setup()
        // ---------------------------------------------------------------------
        // Creates and initialises the components. This is called
        // automatically by the jaws library.
        //{{{
        setup: function() {
            // Load the Intro graphic
            this.background = new jaws.Sprite({image: "graphics/intro.png"});
            
            this.startButton = Button({image: "graphics/button_start.png", x: 160, y: 510});
            
            // Direct any mouse-clicks to our onClick event-handler
            jaws.on_keydown(["left_mouse_button", "right_mouse_button"], function(key) { self.onClick(key); });
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the game components. This is called automatically by the
        // jaws library.
        //{{{        
        update: function() {
            this.startButton.update( );
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the game components. This is called automatically by the jaws
        // library.
        //{{{
        draw: function() {
            this.background.draw();
            this.startButton.draw();
        },
        //}}}

        // ---------------------------------------------------------------------
        // onClick()
        // ---------------------------------------------------------------------
        // This callback is called by the jaws library when the mouse is 
        // clicked. See the jaws.on_keydown() call in the setup() method.
        //{{{        
        onClick: function(key) {
            if (this.startButton.wasClicked) {
                jaws.switchGameState( Game );
            }
        }
        //}}}
    };
    
    return self;
};
//}}}

/*
 * =============================================================================
 * Tile() - Represents a single tile on the board
 * =============================================================================
 */
//{{{
var Tile = function( options ) {
    
    var self = {
        
        // ---------------------------------------------------------------------
        // setup()
        // ---------------------------------------------------------------------
        // Initialises the tile using default values (these will usually be
        // overridden by subsequent calls to the configure() function).
        //{{{
        setup: function( options ) {
            this.configuration = options.configuration || Math.floor(Math.random() * 7) + 1
            var imagename = "hex_tile_0" + this.configuration + ".png";
            this.context = options.context;
            this.row = options.row || 0;
            this.col = options.col || 0;
            this.width = 100
            this.height = 87
            this.images = new jaws.Animation( {sprite_sheet: "graphics/" + imagename, frame_size: [this.width, this.height]} );
            this.sprite = new jaws.Sprite( { image: "graphics/" + imagename, anchor: "center" } );
            this.hex = Hex( {row: this.row, col: this.col, configuration: this.configuration} );
            this.hex.wScale(this.width);
            this.moveTo(this.row, this.col);
            this.rotation = 0;
            this.rotation_target = 0;
            this.rotate_by = 0;
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        //{{{
        update: function( ) {
            if ( this.hex.lit ) {
                this.images.index = 1;
            } else {
                this.images.index = 0;
            }
            this.sprite.setImage(this.images.currentFrame());

            if (this.rotate_by !== 0) {
                this.rotation = this.rotation + this.rotate_by;
                if (this.rotate_by > 0) {
                    if (this.rotation > this.rotation_target) {
                        this.rotate_by = 0;
                        this.hex.normaliseAngle( );
                        this.rotation = this.hex.angle;
                    }
                } else if (this.rotate_by < 0) {
                    if (this.rotation < this.rotation_target) {
                        this.rotate_by = 0;
                        this.hex.normaliseAngle( );
                        this.rotation = this.hex.angle;
                    }
                }
                this.sprite.rotateTo(this.rotation);
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        //{{{
        draw: function( ) {
            this.sprite.draw( );
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // moveTo()
        // ---------------------------------------------------------------------
        // Moves the tile to the specified row and column, updating the location
        // of the sprite to match. This currently hard-codes the offset from
        // the top and left of the drawing area.
        //{{{
        moveTo: function( row, col ) {
            this.hex.row = row;
            this.hex.col = col;
            var pos = this.hex.position( );
            this.sprite.x = pos.x + ( this.width / 2 ) + 40;
            this.sprite.y = pos.y + ( this.height / 2 ) + 64;
            this.hex.setConnectors( );
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // checkHit()
        // ---------------------------------------------------------------------
        // This checks whether the supplied co-ordinates (assumed to be the
        // current mouse-position) are within the tile, and if so triggers the
        // appropriate rotation based on which side of the tile was clicked.
        //{{{
        checkHit: function( x, y ) {
            if (this.rotate_by === 0) {
                separation = Math.sqrt( Math.pow(this.sprite.x - x, 2) + Math.pow(this.sprite.y - y, 2) );
                if (separation < (this.height / 2)) {
                    if (x > this.sprite.x) {
                        this.rotation_target = this.hex.rotate(true);
                        this.rotate_by = 5;
                    } else {
                        this.rotation_target = this.hex.rotate(false);
                        this.rotate_by = -5;
                    }
                }
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // configure()
        // ---------------------------------------------------------------------
        // Updates the tile with new details, based on the supplied 
        // configuration number (0 to 7)
        //{{{
        configure: function( configuration ) {
            this.configuration = configuration;
            var imagename = "hex_tile_0" + this.configuration + ".png";
            this.images = new jaws.Animation( {sprite_sheet: "graphics/" + imagename, frame_size: [this.width, this.height]} );
            this.hex = Hex( {row: this.row, col: this.col, configuration: this.configuration} );
            this.hex.wScale(this.width);
            this.moveTo(this.row, this.col);
            this.rotation = 0;
        }
        //}}}
    };
    
    self.setup( options );
    return self;
};
//}}}

/*
 * =============================================================================
 * Board() - Handles the game board
 * =============================================================================
 */
//{{{
var Board = function( options ) {
    
    var self = {
        
        // ---------------------------------------------------------------------
        // setup()
        // ---------------------------------------------------------------------
        // Initialises the board and loads the first level
        setup: function( options ) {
            var row;
            var col;
            this.context = options.context;

            self.level(1);
            this.levelComplete = false;
            
            this.checkConnections( );
        },
        
        // ---------------------------------------------------------------------
        // level()
        // ---------------------------------------------------------------------
        // Creates the specfied level
        level: function( levelNumber ) {
            this.levelComplete = false;
            this.tiles = new jaws.SpriteList( );
            if ( levelNumber === 1 ) {
                this.tiles.push( Tile( { context: this.context, row: 0, col: 1, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 2, configuration: 8 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 3, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 0, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 1, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 3, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 4, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 1, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 2, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 3, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 4, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 1, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 2, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 3, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 4, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 4, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 5, col: 2, configuration: 4 } ) );
            } else if ( levelNumber === 2 ) {
                this.tiles.push( Tile( { context: this.context, row: 0, col: 1, configuration: 1 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 2, configuration: 8 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 3, configuration: 1 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 0, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 1, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 3, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 4, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 1, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 2, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 3, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 4, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 1, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 3, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 4, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 4, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 5, col: 2, configuration: 4 } ) );
            } else if ( levelNumber === 3 ) {
                this.tiles.push( Tile( { context: this.context, row: 0, col: 1, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 2, configuration: 8 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 3, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 0, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 1, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 3, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 4, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 1, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 2, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 3, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 4, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 1, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 2, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 3, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 4, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 4, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 5, col: 2, configuration: 4 } ) );            
            } else if ( levelNumber === 4 ) {
                this.tiles.push( Tile( { context: this.context, row: 0, col: 1, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 2, configuration: 8 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 3, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 0, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 1, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 3, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 4, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 1, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 2, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 3, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 4, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 0, configuration: 1 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 1, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 2, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 3, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 4, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 4, col: 2, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 5, col: 2, configuration: 1 } ) );                
            } else if ( levelNumber === 5 ) {
                this.tiles.push( Tile( { context: this.context, row: 0, col: 1, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 2, configuration: 8 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 3, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 0, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 1, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 2, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 3, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 4, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 1, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 2, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 3, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 4, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 0, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 1, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 2, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 3, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 4, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 4, col: 2, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 5, col: 2, configuration: 5 } ) );            
            } else if ( levelNumber === 6 ) {
                this.tiles.push( Tile( { context: this.context, row: 0, col: 1, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 2, configuration: 8 } ) );
                this.tiles.push( Tile( { context: this.context, row: 0, col: 3, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 0, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 1, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 2, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 3, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 1, col: 4, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 1, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 2, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 3, configuration: 3 } ) );
                this.tiles.push( Tile( { context: this.context, row: 2, col: 4, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 0, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 1, configuration: 5 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 2, configuration: 7 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 3, configuration: 4 } ) );
                this.tiles.push( Tile( { context: this.context, row: 3, col: 4, configuration: 2 } ) );
                this.tiles.push( Tile( { context: this.context, row: 4, col: 2, configuration: 6 } ) );
                this.tiles.push( Tile( { context: this.context, row: 5, col: 2, configuration: 4 } ) );            
            }
        },
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        update: function( ) {
            this.checkConnections( );
            this.tiles.update( );
        },
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        draw: function( ) {
            this.tiles.draw( );
        },
        
        // ---------------------------------------------------------------------
        // checkHit()
        // ---------------------------------------------------------------------
        checkHit: function( x, y ) {
            var i;
            for (i = 0; i < this.tiles.length; i++) {
                item = this.tiles.at(i);
                item.checkHit( x, y );
            }
        },

        // ---------------------------------------------------------------------
        // hexAt()
        // ---------------------------------------------------------------------
        // Returns the tile at the specified location, or null if no tile is
        // found at that location
        hexAt: function( r, c ) {
            var hex;
            for (var i = 0; i < this.tiles.length; i++) {
                hex = this.tiles.at(i).hex;
                if ( ( hex.row === r) && ( hex.col === c ) ) {
                    return hex;
                }
            }
            return null;
        },
        
        // ---------------------------------------------------------------------
        // checkConnection()
        // ---------------------------------------------------------------------
        checkConnections: function( hex ) {
            var adjacentHex;
            var h;
            var p;
            var r;
            var c;
            if (!hex) {
                for(i = 0; i < this.tiles.length; i++) {
                    hex = this.tiles.at(i).hex;
                    if (hex) {
                        hex.lit = false;
                    }
                }
                hex = this.tiles.at(this.tiles.length - 1).hex;
            }

            // Each hex has six connection points, one on each side. For
            // each connection point, find the hex which abuts that side
            // and check the connection point. If the values of the two
            // connection points match up, then a connection exists 
            // between the two hexes.
            for (var connPoint = 0; connPoint < 6; connPoint++) {
                if (hex.connector[connPoint].value !== 0) {
                    // Locate the hex adjacent to this connection point, if any
                    r = hex.row + hex.adjacentConnectors[connPoint][0];
                    c = hex.col + hex.adjacentConnectors[connPoint][1];
                    connector = hex.adjacentConnectors[connPoint][2] - 1;
                    adjacentHex = this.hexAt(r, c);
                    if ((adjacentHex) && (!adjacentHex.lit)) {
                        // Compare the adjacent connectors
                        if (hex.connector[connPoint].value === adjacentHex.connector[connector].value) {
                            // If they match, a connection exists and both hexes are lit.
                            hex.lit = true;
                            if (!adjacentHex.lit) {
                                adjacentHex.lit = true;
                                // Recursively check the connections with the adjacent hex,
                                // so that we follow the circuit's path
                                this.checkConnections(adjacentHex);
                            }
                        }
                    }
                }
            }
            this.tiles.at(this.tiles.length - 1).hex.lit = true;
            if (this.tiles.at(1).hex.lit) {
                this.levelComplete = true;
            }
        }
    }
    
    self.setup( options );
    return self;
};
//}}}

/*
 * =============================================================================
 * Game() - Main game state handler.
 * =============================================================================
 */
//{{{ 
var Game = function() { 
    
    var self = {

        // ---------------------------------------------------------------------
        // Variables
        // ---------------------------------------------------------------------
        //{{{
        
        // Game components. These are actually created and initialised when the
        // init() method is called.
        board: null,
        
        gameWon: false,
        levelComplete: false,
        levelWon: false,
        outOfTime: false,
        level: 1,
        //}}}
        
        // ---------------------------------------------------------------------
        // Methods
        // ---------------------------------------------------------------------
        //{{{
        
        // ---------------------------------------------------------------------
        // setup()
        // ---------------------------------------------------------------------
        // Creates and initialises the game components. This is called
        // automatically by the jaws library.
        //{{{
        setup: function() {
            
            // The jaws library will locate the canvas element itself, but it
            // it is useful to have our reference to it, for drawing directly
            // on to the canvas.
            this.canvas  = document.getElementById("board");
            this.context = this.canvas.getContext("2d");
            
            // Set up a default font for text output on the canvas
            this.context.font      = "12px Georgia";
            this.context.fillStyle = "#ffeecc";
            
            // Load the backdrop for the game
            this.backdrop = new jaws.Sprite({image: "graphics/backdrop.png"});
            
            this.board = Board( { context: this.context } );
            
            this.banner = new jaws.Sprite({image: "graphics/banner_level_complete.png", x: 0, y: 192});
            
            this.quitButton = Button({image: "graphics/button_quit.png", x: 240, y: 292});
            this.nextButton = Button({image: "graphics/button_next.png", x: 80, y: 292});
            
            this.levelLabels = jaws.Sprite({image: "graphics/levels.png", x:410, y: 74})
            this.levelFrames = jaws.Animation({sprite_sheet: "graphics/levels.png", frame_size: [48, 48]});
            this.levelLabels.setImage(this.levelFrames.currentFrame());
            
            // Create the debug console
            this.debug = DebugConsole( { } );
            
            // Load and play the game soundtrack
            this.gameTrack = new Audio("sounds/DST-Aronara.ogg");
            this.gameTrack.volume = 0.5;
            this.gameTrack.addEventListener("ended", function() {
                this.currentTime = 0;
                this.play();
            }, false);
            this.gameTrack.play();
            
            this.timeupTrack = new Audio("sounds/timeup.ogg");
            this.winTrack = new Audio("sounds/win.ogg");
            
            this.timer = Timer( );
            
            this.pointer = jaws.Sprite( { image: "graphics/dial_pointer.png", x: 68, y: 517, anchor: "center" } );
            
            this.startLevel( );
    
            // Direct any mouse-clicks to our onClick event-handler
            jaws.on_keydown(["left_mouse_button", "right_mouse_button"], function(key) { self.onClick(key); });
        },
        //}}}

        startLevel: function( ) {
            this.board.level(this.level);
            this.levelComplete = false,
            this.levelWon = false,
            this.outOfTime = false,
            this.levelDuration = 300;
            this.counter = this.timer.startCountdown(this.levelDuration);
            this.levelFrames.index = this.level - 1;
            this.levelLabels.setImage(this.levelFrames.currentFrame());
        },
        
        // ---------------------------------------------------------------------
        // update()
        // ---------------------------------------------------------------------
        // Updates the game components. This is called automatically by the
        // jaws library.
        //{{{        
        update: function() {
            this.timer.update( );
            this.board.update( );

            if (!this.levelComplete) {
                if (this.counter.expired) {
                    this.levelComplete = true;
                    this.outOfTime = true;
                    this.banner.setImage("graphics/banner_out_of_time.png");
                    this.nextButton.setImage("graphics/button_retry.png");
                    this.quitButton.moveTo( 240, 292 );
                    this.timeupTrack.play();
                } else if (this.board.levelComplete) {
                    this.levelComplete = true;
                    if (this.level === 6) {
                        this.gameWon = true;
                        this.banner.setImage("graphics/banner_winner.png");
                        this.quitButton.moveTo( 160, 292 );
                    } else {
                        this.banner.setImage("graphics/banner_level_complete.png");
                        this.nextButton.setImage("graphics/button_next.png");
                        this.quitButton.moveTo( 240, 292 );
                    }
                    this.winTrack.play();
                }
            }
            
            if (!this.levelComplete) {
                var units = 360 / this.levelDuration;
                var angle = ((this.levelDuration - this.counter.duration) * units);
                this.pointer.rotateTo(angle);
            } else {
                if (!this.gameWon) {
                    this.nextButton.update( );
                }
                this.quitButton.update( );
            }
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the game components. This is called automatically by the jaws
        // library.
        //{{{
        draw: function() {
            this.backdrop.draw( );
            this.board.draw( );
            this.levelLabels.draw( );
            this.pointer.draw( );
            if (this.levelComplete) {
                this.banner.draw( );
                this.quitButton.draw( );
                if (!this.gameWon) {
                    this.nextButton.draw( );
                }
            }
            // jaws.context.fillStyle = "#ffffff";
            // jaws.context.fillText("Time: " + (Math.floor(this.counter.duration / 10)), 32, 480);
            // this.debug.draw( );
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // onClick()
        // ---------------------------------------------------------------------
        // This callback is called by the jaws library when the mouse is 
        // clicked. See the jaws.on_keydown() call in the setup() method.
        //{{{        
        onClick: function(key) {
            var x = jaws.mouse_x;
            var y = jaws.mouse_y - 16;
            /*
            var rect = this.canvas.getBoundingClientRect();
            x = jaws.mouse_x - rect.left;
            y = jaws.mouse_y - rect.top;
            */
            if ((!this.levelComplete) && (key === "left_mouse_button")) {
                this.board.checkHit( x, y );
            }
            if (this.levelComplete) {
                if (this.quitButton.wasClicked) {
                    if (this.gameWon) {
                        window.location.assign("http://games.cyberealms.net/");
                    } else {
                        window.location.reload();
                    }
                } else if (this.nextButton.wasClicked) {
                    if (!this.outOfTime) {
                        this.level += 1;
                    }
                    this.startLevel( );
                }
            }
        }
        //}}}
        
        //}}}
    };
    
    return self;
    
};
//}}}

/*
 * =============================================================================
 * Main entry point
 * =============================================================================
 * Loads the game assets and launches the game.
 */
//{{{ 
jaws.onload = function( ) {
    // Pre-load the game assets
    jaws.assets.add( [
            "graphics/intro.png",
            "graphics/backdrop.png",
            "graphics/hex_tile_01.png",
            "graphics/hex_tile_02.png",
            "graphics/hex_tile_03.png",
            "graphics/hex_tile_04.png",
            "graphics/hex_tile_05.png",
            "graphics/hex_tile_06.png",
            "graphics/hex_tile_07.png",
            "graphics/hex_tile_08.png",
            "graphics/button_start.png",
            "graphics/button_retry.png",
            "graphics/button_next.png",
            "graphics/button_quit.png",
            "graphics/banner_out_of_time.png",
            "graphics/banner_level_complete.png",
            "graphics/banner_winner.png",
            "graphics/levels.png"
    ] ); 
    // Start the game running. jaws.start() will handle the game loop for us.
    jaws.start( Intro, {fps: 60, width: 480, height: 480} ); 
}
//}}}

