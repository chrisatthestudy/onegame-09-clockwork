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
 * Player() - Handler for the main player object
 * =============================================================================
 */
//{{{
var Player = function( options ) {
    
    var self = {
        setup: function( options ) {
            this.sprite = new jaws.Sprite( options );
            this.thrust = {
                x: 0,
                y: 0
            };
        },
        
        update: function() {
            this.sprite.x = this.sprite.x + this.thrust.x;
            this.sprite.y = this.sprite.y + this.thrust.y;
        },
        
        draw: function() {
            this.sprite.draw();
        }
    };
    
    self.setup( options );
    return self;
};    
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
            var y = jaws.mouse_y;
            var rune;
            if (key === "left_mouse_button") {
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
                        this.rotation = this.rotation_target;
                        this.rotate_by = 0;
                        this.hex.normaliseAngle( );
                    }
                } else if (this.rotate_by < 0) {
                    if (this.rotation < this.rotation_target) {
                        this.rotation = this.rotation_target;
                        this.rotate_by = 0;
                        this.hex.normaliseAngle( );
                    }
                }
                this.sprite.rotateTo(this.rotation);
            }
        },
        
        draw: function( ) {
            /*
            this.context.save( );
            this.context.beginPath( );
            this.context.translate(this.sprite.x, this.sprite.y);
            this.context.rotate(this.rotation);
            var corners = this.hex.corners( );
            // var offset = { x: this.sprite.x, y: this.sprite.y }
            var offset = { x: -this.sprite.rect().width / 2, y: -this.sprite.rect().height / 2 }
            this.context.moveTo(corners[0].x + offset.x, corners[0].y + offset.y);
            for (var i = 1; i < corners.length; i++) {
                this.context.lineTo(corners[i].x + offset.x, corners[i].y + offset.y);
            }
            this.context.strokeStyle = "#ffffff";
            this.context.lineWidth = 1;
            this.context.stroke();
            this.context.closePath( );
            this.context.restore( );
            */
            this.sprite.draw( );
        },
        
        moveTo: function( row, col ) {
            /*
            var colOffset = ((row % 2 === 0) ? this.sprite.rect().width * 0.75 : 0);
            this.row = row;
            this.col = col;
            this.sprite.x = colOffset + (col * (this.sprite.rect().width * 1.5));
            this.sprite.y = (row * (this.sprite.rect().height / 2)) + (this.sprite.rect().height / 2);
            */
            
            this.hex.row = row;
            this.hex.col = col;
            var pos = this.hex.position( );
            this.sprite.x = pos.x + ( this.width / 2 ) + 40;
            this.sprite.y = pos.y + ( this.height / 2 ) + 64;
            this.hex.setConnectors( );
        },
        
        checkHit: function( x, y, response ) {
            if (response == "rotate") {
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
            } else if (response == "config") {
                separation = Math.sqrt( Math.pow(this.sprite.x - x, 2) + Math.pow(this.sprite.y - y, 2) );
                if (separation < (this.height / 2)) {
                    this.configuration = this.configuration + 1;
                    if (this.configuration > 8) {
                        this.configuration = 1;
                    }
                    this.configure( this.configuration );
                }
            }
        },
        
        configure: function( configuration ) {
            this.configuration = configuration;
            var imagename = "hex_tile_0" + this.configuration + ".png";
            this.images = new jaws.Animation( {sprite_sheet: "graphics/" + imagename, frame_size: [this.width, this.height]} );
            this.hex = Hex( {row: this.row, col: this.col, configuration: this.configuration} );
            this.hex.wScale(this.width);
            this.moveTo(this.row, this.col);
            this.rotation = 0;
        }
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
        
        setup: function( options ) {
            var row;
            var col;
            this.context = options.context;
            //this.tiles = new jaws.SpriteList( );
            this.state = "rotate";
            /*            
            this.map = [
                [ 0, 1, 1, 1, 0 ],
                [ 1, 1, 1, 1, 1 ],
                [ 1, 1, 1, 1, 1 ],
                [ 1, 1, 1, 1, 1 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 1, 0, 0 ]
            ];
            
            for (row = 0; row < this.map.length; row++) {
                for (col = 0; col < this.map[row].length; col++ ) {
                    if (this.map[row][col] === 1) {
                        this.tiles.push( Tile( { context: this.context, row: row, col: col } ) );
                    }
                }
            }
            */
            self.level_1();
            
            this.checkConnections( );
        },
        
        level_1: function( ) {
            this.tiles = new jaws.SpriteList( );
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
        },
        
        update: function( ) {
            this.checkConnections( );
            this.tiles.update( );
        },
        
        draw: function( ) {
            this.tiles.draw( );
            var hex;
            var connectionList;
            var connectionValue;
            for (var i = 0; i < this.tiles.length; i++) {
                tile = this.tiles.at(i);
                /*
                jaws.context.fillText(tile.hex.row + "," + tile.hex.col + "," + tile.hex.angle, tile.sprite.x, tile.sprite.y);
                connectionList = "";
                for (var c = 0; c < 6; c++) {
                    connectionValue = tile.hex.connector[c].value;
                    connectionList += "," + connectionValue;
                }
                jaws.context.fillText(connectionList, tile.sprite.x - 25, tile.sprite.y + 24);
                */
            }

        },
        
        checkHit: function( x, y ) {
            var i;
            for (i = 0; i < this.tiles.length; i++) {
                item = this.tiles.at(i);
                item.checkHit( x, y, this.state );
            }
        },

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

            // console.log(hex.row + ", " + hex.col);
            
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
                    if ((hex.row == 2) && (hex.col == 3)) {
                        //console.log("Checking " + r + ", " + c + " : " + connPoint);
                    }
                    adjacentHex = this.hexAt(r, c);
                    if (adjacentHex) {
                        //console.log("Checking adjacent " + adjacentHex.row + ", " + adjacentHex.col);
                    }
                    if ((adjacentHex) && (!adjacentHex.lit)) {
                        // Compare the adjacent connectors
                        if (hex.connector[connPoint].value === adjacentHex.connector[connector].value) {
                            //console.log("Match with adjacent " + adjacentHex.row + ", " + adjacentHex.col);
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

        },
        
        toText: function( ) {
            var output = "this.tiles.clear();\n";
            for (i = 0; i < this.tiles.length; i++) {
                item = this.tiles.at(i);
                output += "this.tiles.push( Tile( { context: this.context, row: " + item.row + ", col: " + item.col + ", configuration: " + item.configuration + " } ) );\n";
            }
            return output;
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

            this.state = "rotate";
            
            // The jaws library will locate the canvas element itself, but it
            // it is useful to have our reference to it, for drawing directly
            // on to the canvas.
            this.canvas  = document.getElementById("board");
            this.context = this.canvas.getContext("2d");
            
            // Set up a default font for text output on the canvas
            this.context.font      = "12px Georgia";
            this.context.fillStyle = "#ffeecc";
            
            this.configure_button = $("#configBtn");
            this.rotate_button = $("#rotateBtn");
            this.save_button = $("#saveBtn");
            this.state_label = $("#stateLbl");
            this.state_label.html("Rotate");
            
            self = this;
            this.configure_button.click(function(event) { self.state = "config"; self.state_label.html("Configure"); });
            this.rotate_button.click(function(event) { self.state = "rotate"; self.state_label.html("Rotate");  });
            this.save_button.click(function(event) { self.save( ); });
            
            // Load the backdrop for the game
            this.backdrop = new jaws.Sprite({image: "graphics/backdrop.png"});
            
            this.board = Board( { context: this.context } );
            this.board.state = this.state;
            
            // Create the player object
            this.player = Player({image: "graphics/player.png", x: 144, y: 224});
            
            // Create the debug console
            this.debug = DebugConsole( { } );
            
            // Load and play the game soundtrack
            this.gameTrack = new Audio("sounds/DST-OurRealm.ogg");
            this.gameTrack.volume = 0.5;
            this.gameTrack.addEventListener("ended", function() {
                this.currentTime = 0;
                this.play();
            }, false);
            this.gameTrack.play();
    
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
            this.board.state = this.state;
            this.board.update( );
        },
        //}}}
        
        // ---------------------------------------------------------------------
        // draw()
        // ---------------------------------------------------------------------
        // Draws the game components. This is called automatically by the jaws
        // library.
        //{{{
        draw: function() {
            //jaws.context.fillStyle  = "black"
            //jaws.context.fillRect(0, 0, jaws.width, jaws.height);
            this.backdrop.draw( );
            this.board.draw( );
            
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
            if (key === "left_mouse_button") {
                this.board.checkHit( x, y );
            }
        },
        //}}}
        
        save: function( ) {
            // Under Firefox this will open a new tab with the contents displayed
            // in it. Other browsers might vary.
            var uriContent = "data:text/plain," + encodeURIComponent(this.board.toText());
            var newWindow = window.open(uriContent, 'tiles');
        }
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
            "graphics/player.png",
            "graphics/hex_tile_01.png",
            "graphics/hex_tile_02.png",
            "graphics/hex_tile_03.png",
            "graphics/hex_tile_04.png",
            "graphics/hex_tile_05.png",
            "graphics/hex_tile_06.png",
            "graphics/hex_tile_07.png",
            "graphics/hex_tile_08.png"
    ] ); 
    // Start the game running. jaws.start() will handle the game loop for us.
    jaws.start( Intro, {fps: 60, width: 480, height: 480} ); 
}
//}}}

