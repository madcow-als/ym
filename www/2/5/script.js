

$(function(){
	var metroSelected = $('.metro_selected');


	var oMetro = new als.Metro({
		city : 'moscow',
//        city : 'spb',
		node : '.metrobox'
	});

	oMetro.addEventListener('mapchange',function(e,station){
		var m = oMetro.getCurrentList();

		$('.metro_selected_title').toggle(m.length > 0);

		var h = metroSelected.height();

		metroSelected
			.css('height',h+'px')
			.html('')
		;

		$.each(m,function(i,val){
			var $Item = $('<dl rel="'+val.id+'"><dt>'+ val.name +'</dt><dd>x</dd></dl>');

			$Item.find('dd').click(function(){

				oMetro.toggleStation(val.id,false);

				$Item.remove();
			});
			metroSelected.append($Item);
		});
		metroSelected.css('height','auto');

		var hew_h = metroSelected.height();

		metroSelected
			.css('height',h+'px')
			.animate({'height':hew_h}, 500, function(){
           		metroSelected.css('height','auto');
	       	})
		;
	});
	//oMetro.removeEventListener('stationchange',function(){})


    oMetro.show(function(){
        oMetro.setSelectedStations(metroSelected.find('dl').map(function(){
            return $(this).attr('rel');
        }));
    });


});