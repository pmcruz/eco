var Company = function(name) {

    var name = name;
    var longName = null;
    var uniqueWorms = [];
    var pos;
    var particle = new Particle(1.0);
    var radius = 0;
    var radiusDraw = {r: 0};
    var radiusDrawMax = 50;
    var attractionForce = new ConstantForce();
    var collisionIterator = 0;
    var collisionDuration = 60;
    var wormOnTheHouse = null;
    var isHover = false;
    var isSelected = false;
    var isVisited = false;

    this.setup = function(behaviors) {
        radius = sqrt(100 * uniqueWorms.length / PI);
        radiusDraw.r = 2;
        particle.setRadius(radiusDraw.r);
        particle.setMass(3);
        var ang = random() * PI * 2;
        var xi = sk.width / 2 + cos(ang) * sim.companiesRadius;
        var yi = sk.height / 2 + sin(ang) * sim.companiesRadius;
        pos = new Vector(xi, yi);
        particle.moveTo(pos);
        pos = particle.pos;

        particle.behaviours.push.apply(particle.behaviours, behaviors);
        particle.behaviours.push(attractionForce);
        /*makes them grow*/
        this.unselect();
        
        /* setups long name */
        if(companiesLongNames.hasOwnProperty(name)){
            longName = companiesLongNames[name];
        }
    };

    this.update = function() {
        //da particula para o centro
        var force = new Vector(sk.width / 2, sk.height / 2).sub(particle.pos);
        var mag = force.mag();
        force.norm();

        var forceRot = new Vector(-force.y, force.x);
        forceRot.scale(sim.rotationalSpeed);
        if (mag < sim.companiesRadius) {
            force.scale(-1);
            mag = sim.companiesRadius - mag;
        } else {
            mag = mag - sim.companiesRadius;
        }
        mag = 10 * Math.sqrt(mag);
        force.scale(mag);

        if (isSelected) {
            force.set(0, 0);
            var vel = new Vector(sk.width / 2, sk.height / 2).sub(particle.pos);
            vel.scale(2);
            particle.vel.set(vel.x, vel.y);
        } else {
            if (isVisited)
                forceRot.scale(-1);
            force.add(forceRot);
        }

        attractionForce.force.set(force.x, force.y);
        
        if (isHover || isSelected) {
            particle.setMass(100);
        } else {
            particle.setMass(3);
        }
        particle.setRadius(radiusDraw.r);
    };

    this.drawText = function() {
        sk.fillStyle = "black";
        sk.textAlign = "center";
        sk.textBaseline = "middle";
        sk.font = "normal 12px Lato";
        utils.wrapText(sk, name, pos.x, pos.y, radiusDrawMax * 2, 15);
    };

    this.drawShape = function() {
        if (collisionIterator > 0) {
            collisionIterator--;
            /* draws echoes */
            if (collisionIterator > 50) {
                sk.beginPath();
                sk.arc(pos.x, pos.y, radiusDraw.r + (collisionDuration - collisionIterator), 0, TWO_PI);
                sk.fillStyle = wormOnTheHouse.getTransparentColor();
                sk.fill();
            }
        } 

        /* main shape */
        if (isHover || isSelected) {
            var dir = new Vector(2, 0);
            sk.save();
            sk.translate(pos.x, pos.y);
            sk.rotate(-sk.millis / 1000);
            sk.fillStyle = "#EEE";
            sk.beginPath();
            sk.arc(dir.x, dir.y, radiusDraw.r - 1, 0, TWO_PI);
            sk.fill();

            sk.rotate(-sk.millis / 150);
            sk.fillStyle = "#CCC";
            sk.beginPath();
            sk.arc(dir.x, dir.y, radiusDraw.r - 1, 0, TWO_PI);
            sk.fill();

            sk.fillStyle = "white";
            sk.beginPath();
            sk.arc(0, 0, radiusDraw.r - 1, 0, TWO_PI);
            sk.fill();
            sk.restore();
        }

        var ar = radiusDraw.r - 1;
        var img = isVisited ? sim.imageCircleVisited : sim.imageCircle;
        sk.drawImage(img, pos.x - ar, pos.y - ar, ar * 2, ar * 2);

        if (isHover || isSelected) {
            if (radiusDraw.r > radiusDrawMax * 0.9)
                this.drawText();
        }
    };

    this.collide = function(wormOnTheHouse_) {
        wormOnTheHouse = wormOnTheHouse_;
        collisionIterator = collisionDuration;
    };

    this.testMouseOver = function(mouse) {
        if (mouse.distSq(pos) <= radiusDraw.r * radiusDraw.r) {
            if (!isHover) {
                expandRadius();
            }
            isHover = true;
        } else {
            if (isHover && !isSelected) {
                 collapseRadius();
            }
            isHover = false;
        }
        return isHover;
    };

    this.isMouseOver = function(mouse) {
        return mouse.distSq(pos) <= radiusDraw.r * radiusDraw.r;
    };

    function expandRadius() {
        var tweenRadius = new TWEEN.Tween(radiusDraw)
                .to({r: radiusDrawMax}, 600)
                .easing(TWEEN.Easing.Quadratic.Out);
        tweenRadius.start();
    }

    function collapseRadius() {
        var tweenRadius = new TWEEN.Tween(radiusDraw)
                .to({r: radius}, 600)
                .easing(TWEEN.Easing.Quadratic.Out);
        tweenRadius.start();
    }

    this.getRadius = function() {
        return radiusDraw.r;
    };

    this.getX = function() {
        return pos.x;
    };

    this.getY = function() {
        return pos.y;
    };

    this.getUniqueWorms = function() {
        return uniqueWorms.slice(0);
    };

    this.addUniqueWorm = function(worm) {
        if (uniqueWorms.indexOf(worm) === -1)
            uniqueWorms.push(worm);
    };

    this.isCollisionInEffect = function() {
        if (collisionIterator > 0)
            return true;
        else
            return false;
    };

    this.getParticle = function() {
        return particle;
    };

    this.select = function() {
        isVisited = true;
        if (!isSelected) {
            if (radiusDraw.r !== radiusDrawMax) {
                expandRadius();
            }
            isSelected = true;
        } else {
            this.unselect();
        }
    };


    this.unselect = function() {
        lockOnCenter = false;
        isSelected = false;
        var tweenRadius = new TWEEN.Tween(radiusDraw)
                .to({r: radius}, 1000)
                .easing(TWEEN.Easing.Quadratic.Out);
        tweenRadius.start();
    };

    this.isSelected = function() {
        return isSelected;
    };

    this.setHover = function(hover) {
        if (hover) {
            expandRadius();
        } else {
            collapseRadius();
        }
        isHover = hover;
    };

    this.vanish = function(callback) {
        var cc = this;
        var tweenRadius = new TWEEN.Tween(radiusDraw)
                .to({r: 2}, 1000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(function() {
                    callback(cc);
                });
        tweenRadius.start();
    };

    this.getName = function() {
        return name;
    };
    
    this.hasLongName = function(){
        return longName !== null;
    };
    
    this.getLongName = function(){
        return longName;
    };
};









