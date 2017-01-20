(function (env) {
    "use strict";

    // Add a star beside the name if it's an official plugin.
    var contrib_re = /^grunt-contrib/i;

    function isOfficialPlugin(name) {
        return name.search(contrib_re) !== 1;
    }

    function officialPlugin(name) {
        return isOfficialPlugin(name) ? '*' : '';
    }

    env.ddg_spice_grunt = function(api_result) {

        if (!api_result || !api_result.results || api_result.total === 0) {
            return Spice.failed('grunt');
        }

        // Get the original query sans the trigger words.
        var script = $('[src*="/js/spice/grunt/"]')[0],
            source = $(script).attr("src"),
            query = source.match(/grunt\/([^\/]*)/)[1];

        Spice.add({
            id: "grunt",
            name: "Software",
            data: api_result.results,
            meta: {
                sourceName: 'Grunt',
                // We can't link to the actual query since filtering is all done on
                // the front-end as well.
                sourceUrl: 'http://gruntjs.com/plugins'
            },
            normalize: function(item) {
                var name = item.package.name;
                return {
                    // Remove the "grunt-" at the beginning of plugins.
                    // That's how they're displayed in http://gruntjs.com/plugins
                    title: officialPlugin(name) + ' ' + name.replace(grunt_re, ''),
                    subtitle: item.homepage[0] || ' ',
                    description: item.description[0],
                    url: 'https://www.npmjs.com/package/' + item.name
                };
            },
            templates: {
                group: 'text',
                detail: false,
                item_detail: false,
                variants: {
                    tileTitle: '1line',
                    tileFooter: '2line',
                    tileSnippet: 'small'
                },
                options: {
                    content: Spice.grunt.content,
                    moreAt: true,
                    footer: Spice.grunt.footer
                }
            }
        });
    };
}(this));
