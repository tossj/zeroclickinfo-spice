(function (env) {
    "use strict";
    env.ddg_spice_sun_rise_set = function(api_result){

        if (api_result.info == 'No matches' || api_result.locations.length == 0) {
            return Spice.failed('sun_rise_set');
        }

        var location = api_result.locations[0];

        if (location.astronomy.objects.length < 1){
            return Spice.failed('sun_rise_set');
        }

        if (location.astronomy.objects[0].events.length < 2) {
            return Spice.failed('sun_rise_set');
        }

        var sunrise_time = '';
        var sunset_time = '';

        for (var i = location.astronomy.objects[0].events.length - 1; i >= 0; i--) {
            var hour = location.astronomy.objects[0].events[i].hour;
            var minute = ('0' + location.astronomy.objects[0].events[i].minute).slice(-2);

            if (location.astronomy.objects[0].events[i].type == 'rise') {
                sunrise_time = hour + ':' + minute;
            } else if (location.astronomy.objects[0].events[i].type == 'set') {
                sunset_time = (hour - 12) + ':' + minute;
            }
        };

        if (sunrise_time == '' || sunset_time == '') {
            return Spice.failed('sun_rise_set');
        }

        Spice.add({
            id: "sun_rise_set",
            name: "sun_rise_set",
            data: {
                location: location.geo.name,
                country: location.geo.country.name,
                sunrise_time: sunrise_time + ' AM',
                sunset_time: sunset_time + ' PM'
            },
            meta: {
                sourceName: "timeanddate.com",
                sourceUrl: 'http://www.timeanddate.com/worldclock/results.html?query=' + location.geo.name
            },
            templates: {
                group: 'base',
                options:{
                    content: Spice.sun_rise_set.content,
                    moreAt: true
                }
            }
        });
    };
}(this));
