var SVG_ZAP = function( element, options ){

		var client_bb = element.getBoundingClientRect();

		zoom_level = 0,
		x_center = client_bb.width / 2,
		y_center = client_bb.height / 2,

		max_x = client_bb.width,
		max_y = client_bb.height,

		zoom_width = client_bb.width,
		zoom_height = client_bb.height;

		element.setAttribute('viewBox', [ 0, 0, max_x, max_y ].join(', ') );
		/*
		last_zoom_center_x,
		last_zoom_center_y,
		last_zoom_width,
		last_zoom_height,
		*/


		this.zoom = function (level, point_x, point_y ){


			point_x =  point_x > max_x ? max_x : point_x;
			point_y =  point_y > max_y ? max_y : point_y;

			if( !(level = parseFloat(level)) > 0 ) {
				level = 1;
			}

			var current_ratio = max_x / element.viewBox.baseVal.width;
			var true_point_x = element.viewBox.baseVal.x + ( point_x / current_ratio );
			var true_point_y = element.viewBox.baseVal.y + ( point_y / current_ratio );

			// find bounding box
			var width = client_bb.width / level,
			height = client_bb.height / level,

			ratio = width / client_bb.width,

			min_x = true_point_x - ( point_x * ratio),
			min_y = true_point_x - ( point_x * ratio);

			min_x =  min_x < 0 ? 0 : min_x;
			min_y =  min_y < 0 ? 0 : min_y;

			element.setAttribute('viewBox', [ min_x, min_y, width, height ].join(', ') );

		}

};