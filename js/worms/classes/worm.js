var Worm = function(wa) {
    var globalWorm = wa;
    var pos;
    var particle = new Particle(1.0);
    var currentPosition;
    var uniqueCompanies;
    var positionIndex = 0;
    var trail = [];
    var trailSize = 10;
    var center;
    var globalParty;

    var positions = [];

    var color;
    var colorDark;
    var colorTransparent;

    var wagglingCompanyIterator = 0;
    var wagglingCompanyDuration = 0;
    var wagglingCompanyDurationMinimum = 60;
    var wagglingVelocity = 100;

    var silhouette;

    var isHighlighted = false;
    var isMouseAttracted = false;

    function createSilhouette() {
        var silh = [];
        for (var i = 0; i < trailSize; i++) {
            var vv = (i - 1) / map(min(uniqueCompanies.length, 20), 1, 20, 1, 3);
            var mag = (sin(vv) + 0) * 2.5 + 0.5;
            silh.push(mag);
        }
        return silh;
    }

    function setColor() {
        if(globalWorm.governments.length === 0){
            console.log(wa.name);
        }
        globalParty = globalWorm.governments[globalWorm.governments.length - 1].party;
        switch (globalParty) {
            case "PSD":
                color = new Color("#e8811a");
                break;
            case "PS":
                color = new Color("#ff7cb6");
                break;
            case "CDS":
                color = new Color("#0093dd");
                break;
            default:
                color = new Color("#777");
        }
        colorDark = new Color(color.hslString()).darken(0.2);
        colorTransparent = new Color(color.hslString()).clearer(0.8);
    }

    function updateTrail() {
        trail.shift();
        trail.push(new Vector(particle.pos.x, particle.pos.y));
    }

    function stepWorm(thiself) {
        var outerDir = new Vector(pos.x - center.x, pos.y - center.y);
        var currentCompany = currentPosition.company;
        var currRadius = currentCompany.getRadius();
        var dir = new Vector(currentCompany.getX() - pos.x, currentCompany.getY() - pos.y);

        if (wagglingCompanyIterator > 0)
            wagglingCompanyIterator--;

        var dist = dir.mag();
        if (isMouseAttracted) {
            var attractMouse = new Vector(sk._mouse().x, sk._mouse().y);
            attractMouse.sub(pos);
            attractMouse.norm();
            attractMouse.scale(150);
            particle.vel.set(attractMouse.x / 5 - attractMouse.y, attractMouse.y / 5 + attractMouse.x);
            return;
        }

        if (dist <= currRadius) {
            if (wagglingCompanyIterator > 0) {
                //if waggling around 
                dir.norm();
                dir.scale(currRadius * 2 + wagglingVelocity);
                particle.vel.set(-dir.y, dir.x);
                //if waggling zero, jumps to next
                return;
            } else {
                currentCompany.collide(thiself);
                nextPosition();
                wagglingCompanyIterator = wagglingCompanyDuration;
                /* sets minimum, we don't want zeros */
                dist = 10;
            }
        }
        var minimumVel = sim.wormsMinVel;
        var dir2 = new Vector(dir.y, -dir.x);
        if (outerDir.dot(dir2) < 0) {
            dir2.scale(-1);
        }
        var limit = Math.min(dist + minimumVel, sim.wormsVel);
        var factor = 1.0 / dist * limit;
        dir.scale(factor);
        dir2.scale(factor);

        if (!isMouseAttracted) {
            particle.vel.set(dir.x + dir2.x, dir.y + dir2.y);
        }
    }

    var spikesAngle = 0;
    var spikesVelocity = Math.random() * 0.5 + 0.1;

    function nextPosition() {
        if (positionIndex + 1 >= positions.length) {
            positionIndex = 0;
        } else {
            positionIndex++;
        }
        currentPosition = positions[positionIndex];
        setWagglingDuration();
        updateStateOutside();
    }

    function setWagglingDuration() {
        var dur = currentPosition.end - currentPosition.start + 1;
        wagglingCompanyDuration = dur * 10 + wagglingCompanyDurationMinimum;
    }

    function drawTrail() {
        var p0 = trail[0];
        var pl = trail[trail.length - 1];
        var vecs = [];

        sk.beginPath();
        sk.moveTo(p0.x, p0.y);
        for (var i = 1; i < trail.length - 1; i++) {
            var p = trail[i];
            var pv = trail[i - 1];
            var dir = new Vector(p.x - pv.x, p.y - pv.y);
            dir.norm();
            //perpendicular
            dir.set(-dir.y, dir.x);

            dir.scale(silhouette[i]);
            vecs.push(dir);
            sk.lineTo(p.x + dir.x, p.y + dir.y);
        }
        sk.lineTo(pl.x, pl.y);

        for (var i = trail.length - 2; i >= 1; i--) {
            var p = trail[i];
            var dir = vecs[i - 1];
            sk.lineTo(p.x - dir.x, p.y - dir.y);
        }
        sk.lineTo(p0.x, p0.y);
        sk.fillStyle = color.rgbString();
        sk.fill();

        sk.strokeStyle = color.rgbString();
        sk.lineWidth = 1;
        sk.beginPath();

        /* draw spikes */
        //defines which points
        var pts = [2, 3, 4];
        //sets spikes velocity
        spikesAngle += spikesVelocity;
        if (spikesAngle > Math.PI)
            spikesAngle = 0;
        var spikeMagnitude = Math.sin(spikesAngle) + 1.2;
        //draw spikes

        function drawSpikes() {
            for (var j = 0; j < pts.length; j++) {
                var p = trail[pts[j]];
                var pp = trail[pts[j] - 1];
                var dir = vecs[pts[j] - 1];
                sk.moveTo(pp.x - dir.x * spikeMagnitude, pp.y - dir.y * spikeMagnitude);
                sk.lineTo(p.x, p.y);
                sk.lineTo(pp.x + dir.x * spikeMagnitude, pp.y + dir.y * spikeMagnitude);
            }
        }
        drawSpikes();
        sk.stroke();

        function drawAntennas() {
            sk.lineWidth = 0.5;
            var p = trail[trail.length - 1];
            //magic 4 para não oscilar muito
            var pp = trail[trail.length - 4];
            var ppx = trail[trail.length - 2];
            var dir = new Vector(p.x - pp.x, p.y - pp.y);
            dir.norm();
            dir.scale(10);
            sk.save();
            sk.beginPath();
            sk.translate(ppx.x, ppx.y);
            sk.rotate(0.5);
            sk.moveTo(dir.x, dir.y);
            sk.lineTo(0, 0);
            sk.rotate(-1);
            sk.lineTo(dir.x, dir.y);
            sk.stroke();
            sk.restore();

        }
        drawAntennas();
    }

    this.setup = function() {
        particle.setMass(1);
        var iang = random(TWO_PI);
        var veci = new Vector(sin(iang), cos(iang));
        veci.scale(650);
        pos = new Vector(sk.width / 2 + random(-500, 500), random(-100, -300));
        particle.moveTo(pos);
        pos = particle.pos;
        //setup companies:
        var uniqueCompanies_ = globalWorm.companies.map(function(company) {
            return companiesHash[company.name];
        });
        /* remove duplicate entries */
        uniqueCompanies = uniqueCompanies_.filter(function(com, pos) {
            return uniqueCompanies_.indexOf(com) === pos;
        });
        currentPosition = positions[positionIndex];
        /* init trail array */
        for (var i = 0; i < trailSize; i++) {
            trail.push(pos);
        }
        particle.setRadius(1);
        setColor();
        center = new Vector(sk.width / 2, sk.height / 2);

        silhouette = createSilhouette();
        setWagglingDuration();
    };

    this.update = function() {
        stepWorm(this);
        updateTrail();
    };

    this.drawShape = function() {
        if (isHighlighted) {
            this.drawHighlighted();
        }
        drawTrail();

    };

    var highlightedRadius = {r: 50};

    this.drawHighlighted = function() {
        var pl = trail[trail.length / 2];
        sk.strokeStyle = this.getColor();
        sk.lineWidth = 2;
        sk.beginPath();
        sk.arc(pl.x, pl.y, highlightedRadius.r, 0, TWO_PI);
        sk.stroke();
    };

    this.drawHighlightedText = function(v) {
        sk.fillStyle = this.getColor();
        sk.textAlign = "left";
        sk.textBaseline = "bottom";
        sk.font = "normal 10pt Lato";
        utils.wrapText(sk, this.getName(), v.x + 10, v.y, 100, 15);
    };

    this.drawNearby = function(v) {
        var cWormPos = this.getAvgPos();
        sk.lineWidth = 0.5;
        sk.strokeStyle = "black";
        sk.beginPath();
        sk.moveTo(v.x, v.y);
        sk.lineTo(cWormPos.x, cWormPos.y);
        sk.stroke();
        this.drawHighlightedText(v);
    };

    this.addPosition = function(company, start, end, desc) {
        var position = {
            company: company,
            start: start,
            end: end,
            desc: desc
        };
        position.id = positions.length;
        positions.push(position);
    };

    this.getName = function() {
        return globalWorm.name;
    };

    this.getColor = function() {
        return color.rgbaString();
    };

    this.getTransparentColor = function() {
        return colorTransparent.rgbaString();
    };

    this.getDarkerColor = function() {
        return colorDark.rgbaString();
    };

    this.getUniqueCompanies = function() {
        return uniqueCompanies.slice(0);
    };

    this.getParticle = function() {
        return particle;
    };

    this.getLatestParty = function() {
        return globalWorm.governments[globalWorm.governments.length - 1].party;
    };

    this.getDistSq = function(v) {
        return pos.distSq(v);
    };

    this.getAvgPos = function() {
        var p = trail[trailSize / 2];
        return new Vector(p.x, p.y);
    };

    this.highlight = function() {
        highlightedRadius.r = 150;
        var tweenRadius = new TWEEN.Tween(highlightedRadius)
                .to({r: 50}, 600)
                .easing(TWEEN.Easing.Quadratic.Out);
        tweenRadius.start();
        isHighlighted = true;
    };

    this.disableHighlight = function() {
        isHighlighted = false;
    };


    this.getPositionsForCompany = function(cp) {
        return positions.filter(function(pos) {
            return pos.company === cp;
        });
    };

    this.getPositions = function() {
        return positions.slice(0);
    };

    this.getGovernments = function() {
        return globalWorm.governments.slice(0);
    };

    this.setMouseAttracted = function(bol) {
        isMouseAttracted = bol;
    };

    function updateStateOutside() {
        $("#dpoliticos .cargo .t").removeClass("actual PSD PS CDS OUTRO");
        var actual = $("#dpoliticos .wp" + currentPosition.id + " .t");
        var party = utils.getOutro(globalParty);
        actual.addClass("actual " + party);
    }
};






