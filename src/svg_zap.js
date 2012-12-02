	var SVGZaP = function( element ){

			var client_bb,
			current_zoom,
			current_origin_x,
			current_origin_y,
			current_width,
			current_height
			;

			var round = function( value, decimals ) {
				var pow = Math.pow( 10, decimals );
				return Math.round( value * pow ) / pow;
			};

			this.refresh = function(){

				client_bb = element.getBoundingClientRect();
				current_zoom = 1;
				current_origin_x = 0;
				current_origin_y = 0;
				current_width = client_bb.width;
				current_height = client_bb.height;

				this.zoom(1);
			};

			this.zoom = function (zoom, point_x, point_y ){

				point_x = point_x >= 0? point_x : client_bb.width / 2 ;
				point_y = point_y >= 0? point_y : client_bb.height / 2;

				// should only be able to operate within original view box
				point_x =  point_x > client_bb.width ? client_bb.width : point_x;
				point_y =  point_y > client_bb.height ? client_bb.height : point_y;

				// we dont do zoom outs pass 1 ( 1 being the origin )
				if( ( zoom = round(zoom, 5) ) < 1 ) {
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

				// apply new view box :)
				var decimals = 5;
				current_zoom = zoom,
				current_width = round(width, decimals),
				current_height = round(height, decimals),
				current_origin_x = round(min_x, decimals),
				current_origin_y = round(min_y, decimals);

				element.setAttribute('viewBox', [ current_origin_x, current_origin_y, current_width, current_height ].join(', ') );

				if( this.trigger ) this.trigger('change change:zoom', this.getPosition() );
			};

			this.pan = function ( from_point_x, from_point_y, to_point_x, to_point_y ){

				var decimals = 5;
				current_origin_x = round( current_origin_x + (from_point_x - to_point_x) , decimals),
				current_origin_y = round(current_origin_y + (from_point_y - to_point_y), decimals);

				element.setAttribute('viewBox', [ current_origin_x, current_origin_y, current_width, current_height ].join(', ') );

				if( this.trigger ) this.trigger('change change:pan', this.getPosition() );

			};


			this.getPosition = function () {
				return {
					zoom: current_zoom,
					x: current_origin_x,
					y: current_origin_y,
					cx: current_origin_x - ( current_width / 2 ),
					cy: current_origin_y - ( current_height / 2 ),
					width: current_width,
					height: current_height,
					ratio: current_width / client_bb.width
				};
			};

			// I can't be asked to do reimplent this functionality
			// if its not accessible then no event triggers #mofo
			if( _ && Backnone ) {
				_.extend( this, Backbone.Events );
			}

			this.refresh();
	};
	