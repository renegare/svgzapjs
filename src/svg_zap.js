var SVG_ZAP = function( element, options ){

		var client_bb = element.getBoundingClientRect();

		current_level = 1;


		// set view box to its default/original state
		element.setAttribute('viewBox', [ 0, 0, client_bb.width, client_bb.width ].join(', ') );

		var round = function( value, decimals ) {
			var pow = Math.pow( 10, decimals );
			return Math.round( value * pow ) / pow;
		};

		this.zoom = function (level, point_x, point_y, zoom_out ){

			point_x = point_x >= 0? point_x : client_bb.width / 2 ;
			point_y = point_y >= 0? point_y : client_bb.height / 2;

			// should only be able to operate within original view box
			point_x =  point_x > client_bb.width ? client_bb.width : point_x;
			point_y =  point_y > client_bb.height ? client_bb.height : point_y;

			// we dont do zoom outs pass 1 ( 1 being the origin )
			if( (level = parseFloat(level)) < 1 ) {
				level = 1;
			}

			// if the rest was this easy
			var width = client_bb.width / level,
			height = client_bb.height / level,

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

			// apply new view box :)
			var decimals = 5;
			element.setAttribute('viewBox', [ round(min_x, decimals), round(min_y, decimals), round(width, decimals), round(height, decimals) ].join(', ') );


		};

		this.pan = function ( point_x, point_y ){
			this.zoom( current_level, point_x, point_y );
		};


		this.getRect = function () {
			return {
				level: current_level,
				cx: x_center,
				cy: y_center,
				x: x_center - ( zoom_width / 2 ),
				y: y_center - ( zoom_height / 2 ),
				width: zoom_width,
				height: zoom_height,
				ratio: zoom_width / $page.width
			};
		};
};