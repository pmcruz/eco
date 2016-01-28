$(document).ready(function() {
    has.add("is-mobile", function() {
        return (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()));
    });
    $('html, body').animate({scrollTop: 0}, 100);
    $('.nano').nanoScroller();
    setupEnglishLanguage();
    obfuscate();
    start();
});

function start() {
    if (compatibility()) {
        setupData();

        runDemo();

        var canvas = $('#ecocanvas').get(0);
        sk = Sketch.create({
            container: canvas,
            interval: 2,
            fullscreen: false,
            width: sim.width,
            height: sim.height
        });

    }

    function processData(wormsJson) {
        /* uses associative arrays aka objects for easier matching */
        wormsJson.forEach(function(worm) {
            /* listing */
            /* check if parties are ok*/
            if (worm.governments === undefined) {
                console.log("Problemas em governos de " + worm.name);
            }
            worm.governments.forEach(function(gov) {
                if (gov.party === undefined || gov.party == '' || gov.party == ' ') {
                    console.log("Problemas em partido de " + worm.name);
                }
            });

            var newWorm = new Worm(worm);

            worms.push(newWorm);
            wormsHash[worm.name] = newWorm;
            worm.companies.forEach(function(company) {
                var companyName = company.name;
                if (companyName === undefined || companyName == '' || companyName == ' ') {
                    console.log("Nome indefinido: " + worm.name);
                }
                if (!companiesHash.hasOwnProperty(companyName)) {
                    var newCompany = new Company(companyName);
                    newCompany.addUniqueWorm(newWorm);
                    companiesHash[companyName] = newCompany;
                } else {
                    companiesHash[companyName].addUniqueWorm(newWorm);

                }
                if (!utils.isNumber(company.start + company.end) || company.end - company.start < 0)
                    console.log("Problemas em: " + company.name + "; " + worm.name);
                newWorm.addPosition(companiesHash[companyName], company.start, company.end, company.position);
            });

        });
        /* creates static array of companies */
        for (var company in companiesHash) {
            companies.push(companiesHash[company]);
        }
        console.log(companies.length + " companhias únicas.");
        console.log(worms.length + " políticos únicos.");
        companies.sort(function(a, b) {
            if (a.getName() > b.getName())
                return 1;
            if (a.getName() == b.getName())
                return 0;
            else
                return -1;
        });
        //companies.forEach(function(c){console.log(c.getName());});
       
    }

    function setupData() {
        sim.imageCircle.src = "img/circle.png";
        sim.imageCircleVisited.src = "img/visited_circle.png";
        preloadImages();

        /*setup long names*/
        $.ajax({
            async: true,
            global: false,
            url: "js/worms/data/grouping.json",
            dataType: "json",
            success: function(data) {
                data.companies.forEach(function(c) {
                    companiesLongNames[c.name] = c.long_name;
                });
                getjson();
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
            }
        });

        /* get the actual data */
        function getjson() {
            $.ajax({
                async: true,
                global: false,
                url: "js/worms/data/worms_12jan.json",
                dataType: "json",
                success: function(data) {
                    processData(data.worms);
                    $("#texplorar").css("color", "black");
                    $("#texplorar #status").hide();
                    $("#texplorar #erro").hide();
                    $("#texplorar #ready").show();
                    $("#bexplorar").show();
                    $("#bexplorar").click(function() {
                        $("#intro").slideUp(2000, function() {
                            $("#container2").show();
                            run();
                        });
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(jqXHR);
                    console.log(textStatus);
                }
            });
        }

    }

    function preloadImages() {
        function preload(imgs) {
            imgs.forEach(function(img) {
                new Image().src = img;
            });
        }
        preload([
            "img/visited_circle.png",
            "img/20px.png",
            "img/circle.png",
            "img/b_info_black.png",
            "img/b_info_gray.png",
            "img/b_left_black.png",
            "img/b_left_gray.png",
            "img/b_origin_black.png",
            "img/b_origin_gray.png",
            "img/b_right_black.png",
            "img/b_right_gray.png",
            "img/b_share_black.png",
            "img/b_share_gray.png",
            "img/20px.png",
            "img/b-0.png",
            "img/b-1.png",
            "img/c0.png",
            "img/c1.png"]);
    }
}

function compatibility() {
    if (!has("array-es5") || !has("canvas")) {
        $("#demo").hide();
        $("#texplorar #status").hide();
        $("#texplorar #erro").show();
        return false;
    }
    return true;
}

function obfuscate() {
    var em = "eco";
    em += "@";
    em += "pmcruz.com";
    $(".econmail").append('<a href="mailto:' + em + '">' + em + '</a>');
}

function setupEnglishLanguage() {
    /* brute force, attribute selectors work in IE9*/
    $("*").each(function() {
        if ($(this).attr("lang") == "en") {
            $(this).hide();
        }
    });
    $("#title-logo .english").click(function() {
        $(this).hide();
        $("#title-logo #en-warning").show();
        $("[lang='en']").each(function() {
            var lang = $(this);
            lang.parent().each(function() {
                lang.detach();
                $(this).empty().append(lang);
            });
        });
        $(":lang(en)").show();
    });
}

var nhom = new function() {
    var arr = [];
    this.make = function(e) {
        arr.push(String.fromCharCode(e.keyCode));
        if (arr.length > 5)
            arr.shift();
        if (arr.join("") == "LICIA") {
            anim();
        }
    };

    function anim() {
        $("html").addClass("nhomBody");
        var el = $("<div></div>")
                .addClass("nhom")
                .append("<p>nhom</p>")
                .append("<p>nhom</p>")
                .append("<p>nhom</p>");
        el.hide();
        $("#container2").append(el);
        el.fadeIn(3000);
    }
}();
