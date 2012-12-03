var initializeUserControl = function ( element, zap_handler ) {

	var MAX_ZOOM = 20,
	$svg = $(element),
	current_view_box = zap_handler.getPosition(),
	is_mousedown = false,
	start_x = 0,
	start_y = 0,
	form_animating = false;

	// set up mouse controls
	$svg.mousewheel( function( event, delta ){
		if( form_animating ) return;
        event.preventDefault();

        delta *= 0.1;

        var offset =  $svg.offset();
        var x = event.pageX - offset.left;
        var y = event.pageY - offset.top;
        current_view_box = zap_handler.getPosition();

        var zoom = current_view_box.zoom + ( current_view_box.zoom * delta );

        zap_handler.zoom( zoom > MAX_ZOOM? MAX_ZOOM : zoom, x, y);

	})
	.mousedown(function(event){
		if( form_animating ) return;
        is_mousedown = true;
        var offset =  $svg.offset();
        start_x = event.pageX - offset.left;
        start_y = event.pageY - offset.top;
        current_view_box = zap_handler.getPosition();

    })
    .mousemove(function(event){
    	if( form_animating ) return;
        if (!is_mousedown) return;
        var offset =  $svg.offset();
        var to_x = event.pageX - offset.left;
        var to_y = event.pageY - offset.top;

        zap_handler.pan( start_x, start_y, to_x, to_y );

        start_x = to_x;
        start_y = to_y;
    })
    .mouseup(function(event){
        is_mousedown = false;
        if( form_animating ) return;
    });


    // setup form control

    var $form = $('form').submit(function( event ){
    	event.preventDefault();

    	form_animating = true;

    	var width = parseInt( $form.find('#width').val() );
    	var height = parseInt( $form.find('#height').val() );
    	var x = parseInt( $form.find('#x').val() );
    	var y = parseInt( $form.find('#y').val() );

    	var zoom_x = current_view_box.width / width;
    	var zoom_y = current_view_box.height / height;


        var from = { 
            z: current_view_box.zoom,
            x: current_view_box.x,
            y: current_view_box.y,
            w: current_view_box.width,
            h: current_view_box.height
        };
        var to = { 
            z: ( zoom_x < zoom_y? zoom_x : zoom_y ),
            x: x,
            y: y,
            w: width,
            h: height
        };

        $( $.extend( {}, from) ).animate(to, {
            duration: 1000,
            step: function() {
                zap_handler.updateView( this.z, this.x, this.y, this.w, this.h );
                current_view_box = zap_handler.getPosition();
            },
            complete: function() {
            	form_animating = false;
            }
        });

    });

}