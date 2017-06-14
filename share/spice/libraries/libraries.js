(function(env) {
    "use strict";
    var search_items = DDG.get_query().split(" ");

    var supported_package_managers = {
        alcatraz: "http://alcatraz.io/",
        atom: "https://atom.io/packages",
        bower: "https://bower.io/",
        cran: "https://cran.r-project.org",
        dart: "https://pub.dartlang.org/",
        dub: "https://code.dlang.org/download",
        elm: "http://elm-lang.org/",
        emacs: "https://www.gnu.org/software/emacs/",
        go: "https://golang.org/",
        groovy: "http://www.groovy-lang.org/",
        haxe: "https://haxe.org/",
        inqlude: "https://inqlude.org/",
        julia: "http://pkg.julialang.org/",
        meteor: "https://www.meteor.com/",
        nimble: "https://nim-lang.org/",
        nuget: "https://www.nuget.org/",
        shards: "https://crystal-shards-registry.herokuapp.com/",
        wordpress: "https://wordpress.org/",
    }

    var install_scripts = {
        bower: "$ bower install",
        cran: "install.packages('",
        elm: "$ elm-package install",
        haxe: "$ haxelib install",
        go: "$ go get",
        julia: "Pkg.add(\"",
        nimble: "$ nimble install",
        nuget: "PM> Install-Package",
        shards: "common_mark:\n\t\tgithub: ysbaddaden/crystal-cmark"
    }

    function getInstallScript(pkg_manager, pkg_name, pkg_version) {
        var index = pkg_manager.toLowerCase();

        if(index === "cran") {
            return install_scripts[index] + pkg_name + "')";
        } else if(index === "julia") {
            return install_scripts[index] + pkg_name + "\")";            
        } else if(index === "nuget") {
            return install_scripts[index] + " " + pkg_name + " -Version " + pkg_version;
        } else if(install_scripts[index] === undefined) {
            return false;
        } else {
            return install_scripts[index] + " " + pkg_name;
        }
    }

    env.ddg_spice_libraries = function(api_result) {
        
        if(!api_result) {
            return Spice.failed('libraries');
        }

        var tile_template =  {
            group: 'text',
            detail: false,
            item_detail: false,
            variants: {
                tile: 'basic1',
                tileTitle: '1line',
                tileFooter: '2line',
                tileSnippet: 'large'
            },
            options: {
                footer: Spice.libraries.footer,
                moreAt: true
            }
        }
        
        var text_template =  {
            group: 'text',
            options: {
                content: Spice.libraries.content,
                moreAt: true
            }
        }

        var template, signal;

        var query = DDG.get_query().split(" ");
        query = query[query.length-1];
        var pkgname = api_result[0].name;

        // determine which template to show and high/low signal
        if(api_result.length <= 1) {
            template = text_template;
            signal = "high";
        } else if(pkgname.toLowerCase() == query) {
            template = text_template;
            api_result = api_result[0];
            signal = "high";
        } else {
            template = tile_template;
            signal = "low";
        }

        Spice.add({
            id: 'libraries',
            name: 'Libraries',
            signal: signal,
            data: api_result,
            meta: {
                search_term: search_items,
                total: api_result.length,
                sourceName: 'libraries.io',   
            },
            templates: template,
            sort_fields: {
                rank: function(a, b) {
                    return a.rank > b.rank ? -1 : 1;
                }
            },
            sort_default: 'rank',
            normalize: function(item) {

                var infoboxData = [
                    { heading: 'Package information:' },
                ];

                // show the license if it exists
                if(item.latest_release_number !== undefined 
                    && item.latest_release_number !== "" 
                    && item.latest_release_number !== null) {

                    infoboxData.push({
                        label: "Version",
                        value: item.latest_release_number,
                    });
                }

                // show the license type if it exists
                if(item.normalized_licenses[0] !== undefined) {
                    infoboxData.push({
                        label: "License",
                        value: item.normalized_licenses[0],
                    });
                }

                // show stars if there is any
                if(item.stars > 0) {
                    infoboxData.push({
                        label: "Stars",
                        value: item.stars,
                    });
                }

                // show forks if there is any
                if(item.forks > 0) {
                    infoboxData.push({
                        label: "Forks",
                        value: item.forks,
                    });
                }

                var package_manager = item.platform;

                if (item.name && item.description) {
                    return {
                        title: item.name,
                        description: item.description,
                        install: getInstallScript(item.platform, item.name, item.latest_release_number),
                        url: item.package_manager_url,
                        stars: item.stars,
                        forks: item.forks,
                        latest_release: item.latest_release_number,
                        infoboxData: infoboxData.length > 1 ? infoboxData : undefined,
                        librariesIcon: DDG.get_asset_path('libraries',"icons/libraries.png"),
                        moreAtIcon: DDG.get_favicon_url(supported_package_managers[package_manager.toLowerCase()]),
                    }
                }
            }
        });
    };
}(this));
