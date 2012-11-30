var SVG_ZAP = function( element, options ){

		var client_bb = element.getBoundingClientRect();

		current_level = 1;

		// set view box to its default/original state
		element.setAttribute('viewBox', [ 0, 0, client_bb.width, client_bb.width ].join(', ') );

		this.zoom = function (level, point_x, point_y, zoom_out ){

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
				// @TODO: zooming out is really ugly need to review
				var zoom_out_ratio = element.viewBox.baseVal.width / width ;
				min_x = element.viewBox.baseVal.x * zoom_out_ratio;
				min_y = element.viewBox.baseVal.y * zoom_out_ratio;
			} else {

				// using given points so zoom can be used in an animation find their
				// true point (taking into consideration any exisiting zoom)
				var true_point_x = element.viewBox.baseVal.x + ( point_x * current_ratio );
				var true_point_y = element.viewBox.baseVal.y + ( point_y * current_ratio );


				min_x = true_point_x - ( point_x * new_ratio),
				min_y = true_point_y - ( point_y * new_ratio);
			}


			// ensure bounding box of original view box are not breached
			if( min_x  < 0 ) {
				min_x = 0;
			}

			if( min_y < 0 ) {
				min_y = 0;
			}

			if( (min_x + width) > client_bb.width ) {
				min_x -= (min_x + width) - client_bb.width;
			}

			if( (min_y + height) > client_bb.height ) {
				min_y -= (min_y + height) - client_bb.height;
			}
			
			// apply new view box :)
			element.setAttribute('viewBox', [ min_x, min_y, width, height ].join(', ') );


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