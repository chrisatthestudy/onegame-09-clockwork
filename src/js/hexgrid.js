/*
 * =============================================================================
 * Hex Grid
 * =============================================================================
 * Class and routines for handling hex-grid maths
 *            
 *                 +-------w-------+
 *                 |               |
 *                 |               |
 *                 +-----s-----+   |        +-----col-----+
 *                 |           |   |        |             |
 *             +-  |   _________   |           _________     ---+
 *             |   |  / \       \  |          /         \       |
 *             |   | /   r       \ |         /           \      |
 *             h    /__r__\       \_________/             \     |
 *             |    \             /         \    0, 2     /     |
 *             |     \   0, 0    /           \           /      | row
 *             |      \         /             \         /       |
 *             +-      ---------      0, 1     ---------        |
 *                    /         \             /         \       |
 *                   /           \           /           \      |
 *                  /    1, 0     \         /    1, 2     \     |
 *                  \              ---------                 ---+
 *                   \            /         \
 *                    \          /   1, 1    \
 *
 *
 * w = width
 * h = height
 * r = radius (a hexagon can be thought of as a truncated circle)
 * s = separation (often called 'size') - this is the distance between the start
 *     of one bounding-cell and the bounding-cell of the next hexagon in the
 *     same row:
 *
 *          
 *                  _________    
 *                 /         \   
 *                /  row 0    \  
 *               /   col 0     \___
 *              ^\             / 
 *              | \           /  row 0
 *              |  \         /   col 1
 *              |   ---------    
 *              |  /        ^\   
 *              |           | \
 *              |<----s---->|  \
 *                              ---
 *
 *
 * (c) 2013 chrisatthestudy
 * -----------------------------------------------------------------------------
 */

/*
 * =============================================================================
 * Hex() - definitions for a single hex
 * =============================================================================
 */
//{{{
var Hex = function( options ) {
    
    var self = {
        
        lit: false,
        
        angle: 0,
        
        // Array of connector states
        // value = connection number (varies with each configuration)
        // 0 = unknown state, -1 = not connected, 1 = connected
        connector: [ 
            { side: 1, value: 0, state: 0}, 
            { side: 2, value: 0, state: 0}, 
            { side: 3, value: 0, state: 0},
            { side: 4, value: 0, state: 0}, 
            { side: 5, value: 0, state: 0}, 
            { side: 6, value: 0, state: 0}
        ],
        
        layouts: [
            [1, 0, 2, 0, 3, 0],
            [4, 0, 5, 0, 6, 0],
            [3, 0, 2, 0, 1, 0],
            [6, 0, 5, 0, 4, 0],
            [1, 2, 0, 3, 4, 0],
            [3, 4, 0, 5, 6, 0],
            [5, 6, 0, 1, 2, 0],
            [1, 2, 3, 4, 5, 6]
        ],
        
        adjacentConnectors: [
          [ -1, -1 , 4 ],
          [ -1,  0 , 5 ],
          [  0, +1 , 6 ],
          [ +1, +1 , 1 ],
          [ +1,  0 , 2 ],
          [ +1, -1 , 3 ]
        ],
        
        // Initialises the hex, with a default radius of 1
        setup: function( options ) {
            this.rScale( 1 );
            this.row = options.row || 0;
            this.col = options.row || 0;
            this.configuration = options.configuration || 1;
            for (var i = 0; i < this.connector.length; i++) {
                this.connector[i].value = this.layouts[this.configuration - 1][i];
            }
            this.setConnectors( );
        },
        
        // Sets the connectors, based on the hex's current position
        setConnectors: function( ) {
            // Adjust the adjacentConnectors
            this.adjacentConnectors[0][0] = (this.col % 2) - 1;
            this.adjacentConnectors[1][0] = - 1;
            this.adjacentConnectors[2][0] = (this.col % 2) - 1;
            this.adjacentConnectors[3][0] = (this.col % 2);
            this.adjacentConnectors[4][0] = 1;
            this.adjacentConnectors[5][0] = (this.col % 2);
        },
        
        // Scales the hex based on the supplied radius
        rScale: function( r ) {
            this.r = r;
            this.w = 2 * r;
            this.s = 1.5 * r;
            this.h = Math.sqrt(3) * r;
        },
        
        // Scales the hex based on the supplied width
        wScale: function( w ) {
            var r = w / 2;
            this.w = w;
            this.r = r;
            this.s = 1.5 * r;
            this.h = Math.sqrt(3) * r;
        },
        
        // Scales the hex based on the supplied height
        hScale: function( h ) {
            var r = h / Math.sqrt(3);
            this.h = h;
            this.r = r;
            this.w = 2 * r;
            this.s = 1.5 * r;
        },
        
        // Scales the hex based on the supplied separation
        sScale: function( s ) {
            var r = s / 1.5;
            this.s = s;
            this.r = r;
            this.w = 2 * r;
            this.h = Math.sqrt(3) * r;
        },
        
        // Returns an object containing the x and y co-ordinates of the top-left
        // edge of the bounding cell for the hexagon. Because this is assumed
        // to be for displaying the hex on-screen, the values are rounded to
        // the nearest integer.
        position: function( ) {
            // For the x co-ordinate simply calculate the column number 
            // multiplied by the separation distance between the cells
            x = Math.round( this.col * this.s );
            
            // Because the tops of columns are staggered (see the diagram at the
            // top of this unit), we need to offset the position on every odd
            // row in order to calculate the y co-ordinate. The easiest way to
            // achieve this is with the modulus of the column.
            y = Math.round( this.row * this.h + ((this.col % 2) * (this.h / 2)));

            // Return an object encapsulating the values
            return {
                x: x,
                y: y
            }
        },
        
        // Returns the positions of the corners of the hexagon, in order 
        // starting from the top-left and going in a clock-wise direction.
        // This can then be used to draw the hexagon by doing moveTo to the
        // first position, then lineTo for each of the subsequent positions (to
        // make this complete the hexagon the first position is repeated at the
        // end.
        corners: function( ) {
            return [
                { x: Math.round(this.r / 2), y: 0 },
                { x: Math.round(this.r + (this.r / 2)), y: 0 },
                { x: Math.round(this.r * 2), y: Math.round(this.h / 2) },
                { x: Math.round(this.r + (this.r / 2)), y: Math.round( this.h ) },
                { x: Math.round(this.r / 2), y: Math.round( this.h ) },
                { x: 0, y: Math.round( this.h / 2) },
                { x: Math.round(this.r / 2), y: 0 }
            ]
        },
        
        // Clears the current connection states
        clearConnections: function( ) {
            for (var i = 0; i < 6; i++ ) {
                this.connector[i].state = 0;
            }
        },
        
        // Rotates the sides of the hex ( this changes the position of the
        // sides in the connector array). Returns the new angle.
        rotate: function( clockwise ) {
            if ( clockwise ) {
                this.angle += 60;
                // Remove the last connector...
                var connection = this.connector.pop( );
                // ...and push it onto the start of the array
                this.connector.unshift( connection );
            } else {
                this.angle -= 60;
                // Remove the first connector...
                var connection = this.connector.shift( );
                // ...and push it onto the end of the array
                this.connector.push( connection );
            }
            return this.angle;
        },

        // Adjusts the angle to stay between 0 and 360.        
        normaliseAngle: function( ) {
            if (this.angle < 0) {
                this.angle = 360 + this.angle;
            } else if (this.angle >= 360) {
                this.angle = this.angle - 360;
            }
        }
        
    };
    
    self.setup( options );
    return self;
};
//}}}

/*
 * =============================================================================
 * HexGrid() - handler for a complete grid of hexagons
 * =============================================================================
 */
//{{{
var HexGrid = function( options ) {
    
    var self = {
        
        hexes: [],
        
        adjacentConnectors: [
          [ -1,  0, 4 ],
          [  0,  1, 5 ],
          [  1,  1, 6 ],
          [  1,  0, 1 ],
          [  1, -1, 2 ],
          [  0, -1, 3 ]
        ],
        
        setup: function( options ) {
        },
        
        update: function( ) {
        },
        
        draw: function( ) {
        },
        
        checkConnections: function( ) {
            var hex;
            var adjacentHex;
            var h;
            var p;
            var r;
            var c;
            for(i = 0; i < hexes.length; i++) {
                hex = hexes[i];
                if (hex) {
                    // Each hex has six connection points, one on each side. For
                    // each connection point, find the hex which abuts that side
                    // and check the connection point. If the values of the two
                    // connection points match up, then a connection exists 
                    // between the two hexes.
                    for (p = 0; p < 6; p++) {
                        if (hex.connector[p].value !== 0) {
                            r = hex.row + this.adjacentConnectors[p][0];
                            c = hex.col + this.adjacentConnectors[p][1];
                            connector = this.adjacentConnectors[p][2];
                            adjacentHex = this.hexAt(r, c);
                            if (adjacentHex) {
                                if (hex.connector[p].value === adjacent.connector[connector].value) {
                                    // We have a match!
                                    hex.lit = true;
                                    adjacent.lit = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    self.setup( options );
    return self;
};
//}}}
