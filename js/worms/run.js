function run() {

    var engine = {};

    engine.selectedCompanies = [];
    engine.selectedCompany = null;
    engine.selectedWorm = null;
    engine.selectedWorms = [];
    engine.isHoverController = false;

    engine.state = function() {
        var states = [];
        var index = 0;
        states.push(null);

        function display() {
            var obj = states[index];
            if (obj === null) {
                undisplay();
            } else if (obj instanceof Worm) {
                engine.selectWorm(obj);
                displayWorm();
            } else if (obj instanceof Company) {
                engine.selectCompany(obj);
                displayCompany();
            }
        }
        return {
            addState: function(object) {
                states.length = index + 1;
                if (states[index] !== object) {
                    states.push(object);
                    index++;
                    $("#barra #b_left").addClass("active");
                }
            },
            browseNextState: function() {
                if (index < states.length - 1) {
                    index++;
                    display();
                    $("#barra #b_left").addClass("active");
                }
                if (index === states.length - 1) {
                    $("#barra #b_right").removeClass("active");
                }
            },
            browsePreviousState: function() {
                if (index > 0) {
                    index--;
                    display();
                    $("#barra #b_right").addClass("active");
                }
                if (index === 0) {
                    $("#barra #b_left").removeClass("active");
                    /* makes sure that everything closes... */
                    undisplay();
                }
            }
        };
    }();

    engine.selectAll = function() {
        engine.clearSelection();

        /* if mobile, add fewer companies at startup */
        if (has("is-mobile")) {
            companies.forEach(function(c) {
                if (c.getUniqueWorms().length > 1)
                    engine.selectedCompanies.push(c);
            });
        } else {
            engine.selectedCompanies = companies.slice(0);
        }


        engine.selectedWorms = worms.slice(0);
        engine.updatePhysicsSetup();
    };

    engine.selectWorm = function(worm) {
    	_gaq.push(['_trackEvent', 'users', 'worm', worm.getName(), undefined, undefined]);
    	console.log(worm.getName());
        if (engine.selectedWorm !== null) {
            engine.selectedWorm.disableHighlight();
        }
        engine.selectedWorm = worm;
        if (engine.selectedCompany !== null) {
            engine.selectedCompany.unselect();
        }
        engine.selectedCompany = null;
        engine.selectedWorms.length = 0;
        engine.selectedWorms.push(worm);

        var selectedCompanies = [];
        worm.getUniqueCompanies().forEach(function(c) {
            if (selectedCompanies.indexOf(c) === -1) {
                selectedCompanies.push(c);
            }
        });
        selectedCompanies.forEach(function(c) {
            c.unselect();
            if (engine.selectedCompanies.indexOf(c) === -1) {
                //this is a new one! (so add it to the engine)
                engine.selectedCompanies.push(c);
            }
        });
        engine.selectedCompanies.forEach(function(c) {
            if (selectedCompanies.indexOf(c) === -1) {
                //set this to die!
                c.vanish(engine.removeCompany);
            }
        });

        engine.updatePhysicsSetup();
    };

    engine.selectCompany = function(company) {
    	_gaq.push(['_trackEvent', 'users', 'company', company.getName(), undefined, undefined]);
    	console.log(company.getName());
        if (engine.selectedWorm !== null) {
            engine.selectedWorm.disableHighlight();
            engine.selectedWorm = null;
        }

        engine.selectedCompany = company;
        company.select();
        var selectedCompanies = [];
        var selectedWorms = [];
        selectedCompanies.push(company);
        engine.selectedWorms.length = 0;
        company.getUniqueWorms().forEach(function(w) {
            if (selectedWorms.indexOf(w) === -1) {
                selectedWorms.push(w);
                engine.selectedWorms.push(w);
            }
            w.getUniqueCompanies().forEach(function(c) {
                if (selectedCompanies.indexOf(c) === -1) {
                    selectedCompanies.push(c);
                }
            });
        });

        selectedCompanies.forEach(function(c) {
            if (c !== company)
                c.unselect();
            if (engine.selectedCompanies.indexOf(c) === -1) {
                //this is a new one! (so add it to the engine)
                engine.selectedCompanies.push(c);
            }
        });
        engine.selectedCompanies.forEach(function(c) {
            if (selectedCompanies.indexOf(c) === -1) {
                //set this to die!
                c.vanish(engine.removeCompany);
            }
        });
        engine.updatePhysicsSetup();
    };

    engine.updatePhysicsSetup = function() {
        engine.physics.particles.length = 0;
        engine.collision.pool.length = 0;
        engine.selectedCompanies.forEach(function(c) {
            engine.physics.particles.push(c.getParticle());
            engine.collision.pool.push(c.getParticle());
        });
        engine.selectedWorms.forEach(function(w) {
            engine.physics.particles.push(w.getParticle());
        });
    };

    engine.removeCompany = function(company) {
        utils.removeFromArray(company, engine.selectedCompanies);
        utils.removeFromArray(company.getParticle(), engine.physics.particles);
        utils.removeFromArray(company.getParticle(), engine.collision.pool);
    };

    engine.clearSelection = function() {
        companies.forEach(function(c) {
            c.unselect();
        });
        engine.selectedCompany = null;
        if (engine.selectedWorm !== null) {
            engine.selectedWorm.disableHighlight();
        }
        engine.selectedWorm = null;
        engine.selectedCompanies.length = 0;
        engine.selectedWorms.length = 0;
        engine.updatePhysicsSetup();
    };

    /** related companies */
//    engine.getRelatedCompanies = function() {
//        return engine.selectedCompaniesConsolidated.filter(function(el) {
//            return el !== engine.selectedCompany;
//        });
//    };

    function displayWorm() {
        function left() {
            $("#container2 #containerleft").show();
            $("#container2 #containerright").show();
            var tempresa = $("#tempresa");
            tempresa.empty();
            tempresa.append($('<span class="u">' + engine.selectedWorm.getName() + '&nbsp;</span>'));
            tempresa.removeClass();
            tempresa.addClass(engine.selectedWorm.getLatestParty());
            tempresa.slideDown();
            $("#dempresasrelacionadas #leg-governos").show();
            $("#dempresasrelacionadas #leg-outrasempresas").hide();
            $("#dempresasrelacionadas").show();


            var el = $("#dempresa .content");
            var els = [];
            el.empty();

            var positions = engine.selectedWorm.getGovernments();
            positions.forEach(function(p) {
                var end = p.end > 2013 ? "&hellip;" : p.end;
                var dur;
                if (p.end - p.start === 0) {
                    dur = p.start;
                } else {
                    dur = p.start + "-" + end;
                }


                var pol = $("<div></div>");
                pol.append($('<p>' + dur + '</p>')
                        .addClass("datacargopolitico")
                        .append($("<span>&emsp;" + p.party + "</span>")
                                .addClass(p.party)))
                        .append($('<p>' + p.position + '</p>'))
                        .addClass("cargopolitico");
                pol.hide();
                el.append(pol);
                els.push(pol);
            });

            $("#dempresa").show();
            var i = -1;
            function fadeNext() {
                $(".nano").nanoScroller();
                i++;
                if (i >= els.length) {
                    return;
                }
                els[i].fadeIn(200, fadeNext);
            }
            fadeNext();
        }

        function right() {
            function showToolTip(pol, pos) {
                var tool = $("#container2 #tooltip");
                tool.empty();
                var top = pol.position().top;
                tool.css("top", 24 + 4 + top + "px");

                var end = pos.end > 2013 ? "&hellip;" : pos.end;
                if (pos.end - pos.start === 0) {
                    tool.append('<span class="dur">' + pos.start + "</span>");
                } else {
                    tool.append('<span class="dur">' + pos.start + "-" + end + "</span>");
                }
                tool.append('<span class="desc">' + pos.desc + "</span>");
                tool.show();
            }

            function hideToolTip() {
                var tool = $("#container2 #tooltip");
                tool.hide();
            }

            $("#tpoliticos #leg-parempresas").show();
            $("#tpoliticos #leg-politicos").hide();
            $("#tpoliticos").slideDown();

            var el = $("#dpoliticos .content");
            el.empty();
            var els = [];
            engine.selectedWorm.getPositions().forEach(function(pos) {
                var st = $('<span></span>');
                st.addClass("t");
                st.append(utils.stringCleaner(pos.company.getName()));

                var pol = $('<span></span>');
                pol.append(st);
                pol.append('<span class="middot"> &middot; </span>');
                pol.addClass("cargo");
                pol.addClass("wp" + pos.id);
                pol.hide();

                pol.hover(function() {
                    pos.company.setHover(true);
                    engine.isHoverController = true;
                }, function() {
                    pos.company.setHover(false);
                    engine.isHoverController = false;
                });
                pol.click(function() {
                    hideToolTip();
                    engine.isHoverController = false;
                    engine.selectCompany(pos.company);
                    engine.state.addState(pos.company);
                    displayCompany();
                });

                var end = pos.end > 2013 ? "&hellip;" : pos.end;
                var pol2 = $('<p>' + pos.desc + " " + pos.start + "-" + end + '</span>');
                pol2.addClass("info");
                pol.hover(function() {
                    showToolTip(pol, pos);
                }, function() {
                    hideToolTip();
                });

                el.append(pol);
                els.push(pol);
            });
            $("#dpoliticos").show();

            var i = -1;
            function fadeNext() {
                $(".nano").nanoScroller();
                i++;
                if (i >= els.length)
                    return;
                els[i].fadeIn(200, fadeNext);
            }
            fadeNext();
        }

        $("#tpoliticos").slideUp();
        $("#dempresasrelacionadas").slideUp();
        $("#container2 #tooltip").hide().empty();

        $("#tempresa").slideUp(400, function() {
            $("#dempresa").slideUp(400, function() {
                left();
            });
        });

        $("#dpoliticos").slideUp(400, function() {
            right();
        });
    }

    function undisplay() {
        $("#container2 #tooltip").hide().empty();
        $("#tempresa").slideUp();
        $("#dempresa").slideUp();
        $("#dempresasrelacionadas").slideUp();

        $("#tpoliticos").slideUp();
        $("#dpoliticos").slideUp(400, function() {
            engine.selectAll();
            $("#container2 #containerright").hide();
            $("#container2 #containerleft").hide();
        });
    }

    function displayCompany() {
        function left() {
            $("#container2 #containerleft").show();
            $("#container2 #containerright").show();
            var tempresa = $("#tempresa");
            tempresa.empty();
            tempresa.removeClass();
            var name = engine.selectedCompany.getName();
            if (engine.selectedCompany.hasLongName()) {
                name = name + '<br/><span class="u">' + engine.selectedCompany.getLongName() + '</span>';
                tempresa.append(name);
            } else {
                tempresa.append($('<span class="u">' + name + '</span>'));
            }

            tempresa.slideDown();
            $("#dempresasrelacionadas #leg-governos").hide();
            $("#dempresasrelacionadas #leg-outrasempresas").show();
            $("#dempresasrelacionadas").show();
        }

        function right() {
            function showTooltip(w, pol) {
                var tool = $("#container2 #tooltip");
                tool.empty();
                var top = pol.position().top;
                tool.css("top", 24 + 8 + top + "px");
                var poss = w.getPositionsForCompany(engine.selectedCompany);
                poss.forEach(function(pp) {
                    var end = pp.end > 2013 ? "&hellip;" : pp.end;
                    if (pp.end - pp.start === 0) {
                        tool.append('<span class="dur">' + pp.start + "</span>");
                    } else {
                        tool.append('<span class="dur">' + pp.start + "-" + end + "</span>");
                    }
                    tool.append('<span class="desc">' + pp.desc + "</span>");
                    tool.append("<br/>");
                });
                tool.show();
            }

            function hideTooltip() {
                var tool = $("#container2 #tooltip");
                tool.hide();
            }

            $("#tpoliticos #leg-parempresas").hide();
            $("#tpoliticos #leg-politicos").show();
            $("#tpoliticos").slideDown();

            var el = $("#dpoliticos .content");
            el.empty();
            var els = [];
            engine.selectedWorms.forEach(function(w) {
                var pol = $('<span>' + w.getName() + '</span>');
                pol.addClass("politico");
                pol.hide();
                pol.hover(function() {
                    showTooltip(w, pol);
                    w.highlight();
                    engine.isHoverController = true;
                }, function() {
                    hideTooltip();
                    w.disableHighlight();
                    engine.isHoverController = false;
                });
                pol.click(function() {
                    w.disableHighlight();
                    hideTooltip();
                    engine.selectWorm(w);
                    engine.state.addState(w);
                    displayWorm();
                    engine.isHoverController = false;
                });
                var party = w.getLatestParty();
                party = utils.getOutro(party);
                pol.addClass(party);
                el.append(pol);
                el.append("<br/>");
                els.push(pol);
            });
            $("#dpoliticos").show();
            var i = -1;
            function fadeNext() {
                $(".nano").nanoScroller();
                i++;
                if (i >= els.length) {
                    return;
                }
                els[i].fadeIn(200, fadeNext);
            }
            fadeNext();
        }
        $("#tpoliticos").slideUp();
        $("#dempresasrelacionadas").slideUp();
        $("#container2 #tooltip").hide().empty();
        $("#tempresa").slideUp(400, function() {
            $("#dempresa").slideUp(400, function() {
                left();
            });
        });
        $("#dpoliticos").slideUp(400, function() {
            right();

        });
    }

    var v_mouse;

    function setupAutocomplete() {
        /* creating structure for autocomplete */
        var autoProcura = [];
        companies.forEach(function(c) {
            autoProcura.push({value: c.getName(), data: c});
        });
        worms.forEach(function(w) {
            autoProcura.push({value: w.getName(), data: w});
        });

        $("#procura").focus(function() {
            $(this).val("").css("background-image", "none");
        });

        $("#procura").blur(function() {
            $(this).val("").css("background-image", "url('img/lupa.png')");
        });

        $('#procura').autocomplete({
            lookup: autoProcura,
            minChars: 2,
            onSelect: function(entry) {
                $("#procura").blur();
                if (entry.data instanceof Company) {
                    engine.selectCompany(entry.data);
                    engine.state.addState(entry.data);
                    displayCompany();
                } else if (entry.data instanceof Worm) {
                    engine.selectWorm(entry.data);
                    engine.state.addState(entry.data);
                    displayWorm();
                }
            },
            appendTo: $("#resultados"),
            beforeRender: function(container) {
                var h = container.outerHeight();
                $("#resultados").css("top", -h + "px");
            },
            triggerSelectOnValidInput: false,
            autoSelectFirst: true,
            width: 300
        });
    }

    sk._mouse = function() {
        if (sk.touches.length > 1)
            return sk.touches;
        else
            return sk.mouse;
    };

    sk.setup = function() {
        engine.physics = new Physics();
        engine.physics.timestep = 1.0 / 60;
        engine.physics.viscosity = 0.005;
        engine.physics.integrator = new ImprovedEuler();
        engine.collision = new Collision();
        engine.myBehaviours = [];
        engine.myBehaviours.push(engine.collision);

        companies.forEach(function(company) {
            company.setup(engine.myBehaviours);
        });
        worms.forEach(function(worm) {
            worm.setup();
        });
        engine.selectAll();
        v_mouse = new Vector(sk.width / 2, sk.height / 2);
        setupAutocomplete();

        /*little hack for the beginning */
        sk.mouse.x = sk.width / 2;
        sk.mouse.y = sk.height / 2;

        $('#ecocanvas').hover(function() {
            engine.isHoverController = false;
        }, function() {
            engine.isHoverController = true;
        });

        $("#nota").delay(10).slideDown(400).delay(4000).slideUp(400, function() {
            ready = true;
            $("#barra").delay(1000).show();
        });

        $("#barra #b_left").click(function() {
            clicker.addClick();
            if (clicker.getClick()) {
                engine.state.browsePreviousState();
            }
        });

        $("#barra #b_right").click(function() {
            clicker.addClick();
            if (clicker.getClick()) {
                engine.state.browseNextState();
            }
        });

        $("#barra #b_origin").click(function() {
            undisplay();
            engine.state.addState(null);
        });

        $("#barra #b_share").click(function() {
            $("#sobre").hide();
            $('html, body').animate({scrollTop: 700}, 400);
            $("#partilha").toggle(function(){

                    $(".fb-comments span, .fb-comments span iframe").css("width", "500px");
                    console.log("pin");


            });
            //$("#partilha").toggle();
            
        });

        $("#barra #b_info").click(function() {
            $("#partilha").hide();
            $('html, body').animate({scrollTop: 700}, 400);
            $("#sobre").toggle();
        });

        $("#sobre .fecha").click(function() {
            $("#sobre").hide();
            $('html, body').animate({scrollTop: 700}, 400);
        });

//        worms.forEach(function(w) {
//            console.log(w.getName() + ";" + w.getUniqueCompanies().length + ";" + w.getPositions().length);
//        });
    };



    /* MERGE THIS WITH MAIN DRAW CICLE  */
    var previousClosestWorm = null;
    function getClosestWorm(mouse, isOneCompanyOver) {
        var copy = engine.selectedWorms;
        var MIN_DIST = 55;
        var dist = MIN_DIST * MIN_DIST;
        var candidate = null;
        copy.forEach(function(w) {
            w.setMouseAttracted(false);
            var d = w.getDistSq(mouse);
            if (d < dist) {
                dist = d;
                candidate = w;
            }
        });
        if (isOneCompanyOver) {
            previousClosestWorm = null;
            return null;
        }

        if (candidate === null) {
            previousClosestWorm = null;
            return null;
        }

        if (previousClosestWorm === null) {
            candidate.setMouseAttracted(true);
            previousClosestWorm = candidate;
            return candidate;
        }

        if (previousClosestWorm !== candidate) {
            if (previousClosestWorm.getDistSq(mouse) < MIN_DIST * MIN_DIST) {
                previousClosestWorm.setMouseAttracted(true);
                return previousClosestWorm;
            }
        }
        previousClosestWorm = candidate;
        candidate.setMouseAttracted(true);
        return candidate;
    }

    var ready = false;
    var clicker = function() {
        var click = false;
        var locked = false;

        function unlock() {
            locked = false;
        }

        return {
            addClick: function() {
                if (!locked)
                    click = true;
            },
            getClick: function() {
                var c = click;
                if (click) {
                    //console.log("true");
                    click = false;
                    locked = true;
                    setTimeout(unlock, 600);
                }
                return c;
            }
        };
    }();

    sk.draw = function() {
        var click = clicker.getClick();
        var v = new Vector(sk._mouse().x, sk._mouse().y);

        var pdist = v.distSq(v_mouse);
        v_mouse = v;
        TWEEN.update();
        engine.physics.step();

        if (engine.isHoverController)
            v.set(sk.width / 2, sk.height / 2);
        var isOneCompanyOver = false;
        engine.selectedCompanies.forEach(function(company) {
            if (ready && !engine.isHoverController) {
                var isMouseOver = company.testMouseOver(v);
                if (isMouseOver) {
                    isOneCompanyOver = true;
                    if (click) {
                        if (company.isSelected()) {
                            undisplay();
                        } else {
                            engine.selectCompany(company);
                            engine.state.addState(company);
                            displayCompany();
                        }
                    }
                }
            }
            company.update();
            company.drawShape();
        });

        var cWorm = getClosestWorm(v, isOneCompanyOver);

        engine.selectedWorms.forEach(function(worm) {
            worm.update();
            worm.drawShape();
        });

        if (isOneCompanyOver && ready) {
            sk.container.style.cursor = 'pointer';
        } else if (ready) {
            if (!engine.isHoverController && cWorm !== null) {
                sk.container.style.cursor = 'pointer';
                if (engine.selectedWorm === null)
                    cWorm.drawNearby(v);
                if (click) {
                    engine.selectWorm(cWorm);
                    engine.state.addState(cWorm);
                    displayWorm();
                }
            } else {
                sk.container.style.cursor = 'default';
            }
        }

        if (pdist === 0) {
            if (sim.wormsVel < sim.wormsMaxVel) {
                sim.wormsVel += 1;
            }
        } else {
            sim.wormsVel = sim.wormsMedVel;
        }
    };


    sk.click = function(e) {
        clicker.addClick();
    };

    sk.touchend = function(e) {
        clicker.addClick();
    };

    sk.keyup = function(key) {
        nhom.make(key);
    };
}
