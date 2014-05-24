


var myMetro;

$(function(){
	var $MetroSelected = $('.metro_selected');


	var oMetro = new als.Metro({
		city : 'moscow',
		node : '.metrobox'
	});

	oMetro.addEventListener('mapchange',function(e,station){
		var m = oMetro.getCurrentList();

		$('.metro_selected_title').toggle(m.length > 0);

		var h = $MetroSelected.height();

		$MetroSelected
			.css('height',h+'px')
			.html('')
		;

		$.each(m,function(i,val){
			var $Item = $('<dl rel="'+val.id+'"><dt>'+ val.name +'</dt><dd>x</dd></dl>');

			$Item.find('dd').click(function(){

				oMetro.toggleStation(val.id,false);

				$Item.remove();
			});
			$MetroSelected.append($Item);
		});
		$MetroSelected.css('height','auto');

		var hew_h = $MetroSelected.height();

		$MetroSelected
			.css('height',h+'px')
			.animate({'height':hew_h}, 500, function(){
           		$MetroSelected.css('height','auto');
	       	})
		;
	});
	//oMetro.removeEventListener('stationchange',function(){})


	myMetro = oMetro;



    $('.metrobox')
        .show()
//        .height(1000)
    ;
    oMetro.show(function(){
        oMetro.setSelectedStations($MetroSelected.find('dl').map(function(){
            return $(this).attr('rel');
        }));
    });


});