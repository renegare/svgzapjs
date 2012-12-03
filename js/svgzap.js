var SVGZaP = function( element, restrict ){

	var client_bb,
	current_zoom,
	current_origin_x,
	current_origin_y,
	current_width,
	current_height,
	self = this
	;

	// ensure we dealing with a bool
	restrict = restrict? true : false;

	var round = function( value, decimals ) {
		var pow = Math.pow( 10, decimals );
		return Math.round( value * pow ) / pow;
	};

	updateViewBox = function ( method, zoom, x, y, width, height, silent ) {

		var decimals = 5;

		zoom = round(zoom, decimals),
		width = round(width, decimals),
		height = round(height, decimals),
		x = round(x, decimals),
		y = round(y, decimals);

		if( zoom !== current_zoom
			|| width !== current_width
			|| height !== current_height
			|| x !== current_origin_x
			|| y !== current_origin_y) {
			current_zoom = zoom,
			current_width = width,
			current_height = height,
			current_origin_x = x,
			current_origin_y = y;

			element.setAttribute('viewBox', [ current_origin_x, current_origin_y, current_width, current_height ].join(' ') );

			if( !silent && self.trigger ) self.trigger('change change:'+(method? method : 'unknown'), self.getPosition() );
		}
	};

	this.updateView = function ( zoom, x, y, width, height, silent ){
		updateViewBox( 'zoom', zoom, x, y, width, height, silent );
	};

	this.refresh = function( silent ){

		client_bb = element.getBBox();

		updateViewBox( 'zoom', 1, 0, 0, client_bb.width, client_bb.height, silent );
	};

	this.zoom = function (zoom, point_x, point_y, silent ){

		point_x = point_x >= 0? point_x : client_bb.width / 2 ;
		point_y = point_y >= 0? point_y : client_bb.height / 2;

		// should only be able to operate within original view box
		point_x =  point_x > client_bb.width ? client_bb.width : point_x;
		point_y =  point_y > client_bb.height ? client_bb.height : point_y;

		// we dont do zoom outs pass 1 ( 1 being the origin )
		if( (restrict && ( zoom = round(zoom, 5) ) < 1)
			|| zoom <= 0 ) {

			zoom = 1;

		}

		// if the rest was this easy
		var width = client_bb.width / zoom,
		height = client_bb.height / zoom,

		// now calculate ratios, to be used so incremental zoom is some what smooth
		current_ratio = element.viewBox.baseVal.width / client_bb.width,
		new_ratio = width / client_bb.width,
		min_x,
		min_y;

		// if zooming out need to take a different angle when calculating the min_x and min_y
		if( current_ratio < new_ratio ) {
			// naming here is crazy, had to bend my mind backwards to understand

			// *_diff it the difference between the viewbox now and next ( when we actually update the viewbox )
			// *_ratio is the percentage the current axis has of the overal space that is not viewable in the view box
			// @TODO: simplify so its even more absctract whats going on ... but it works #DAMMIT!

			var height_diff = height - element.viewBox.baseVal.height;
			var height_ratio = element.viewBox.baseVal.y / (client_bb.height - element.viewBox.baseVal.height);
			min_y = element.viewBox.baseVal.y - ( height_diff * height_ratio );

			var width_diff = width - element.viewBox.baseVal.width;
			var width_ratio = element.viewBox.baseVal.x / (client_bb.width - element.viewBox.baseVal.width);
			min_x = element.viewBox.baseVal.x - ( width_diff * width_ratio );

		} else {

			// using given points so zoom can be used in an animation find their
			// true point (taking into consideration any exisiting zoom)
			var true_point_x = element.viewBox.baseVal.x + ( point_x * current_ratio );
			var true_point_y = element.viewBox.baseVal.y + ( point_y * current_ratio );


			min_x = true_point_x - ( point_x * new_ratio),
			min_y = true_point_y - ( point_y * new_ratio);
		}

		updateViewBox( 'zoom', zoom, min_x, min_y, width, height, silent );

	};

	this.pan = function ( from_point_x, from_point_y, to_point_x, to_point_y, silent ){

		var decimals = 5,
		min_x = round( current_origin_x + (from_point_x - to_point_x) , decimals),
		min_y = round(current_origin_y + (from_point_y - to_point_y), decimals);

		if( restrict ) {

			if( min_x < 0 ) {
				min_x = 0;
			} else if( (min_x + current_width) > client_bb.width ) {
				min_x -= (min_x + current_width) - client_bb.width;
			}

			if( min_y < 0 ) {
				min_y = 0;
			} else if( (min_y + current_height) > client_bb.height ) {
				min_y -= (min_y + current_height) - client_bb.height;
			}

		}

		updateViewBox( 'pan', current_zoom, min_x, min_y, current_width, current_height, silent );

	};

	this.getPosition = function () {
		return {
			zoom: current_zoom,
			x: current_origin_x,
			y: current_origin_y,
			cx: current_origin_x + ( current_width / 2 ),
			cy: current_origin_y + ( current_height / 2 ),
			width: current_width,
			height: current_height,
			ratio: current_width / client_bb.width
		};
	};

	// I can't be asked to do reimplent this functionality
	/*
	if( _ ){
		_.extend( this, Backbone.Events );
	}
	*/

	this.refresh();
};