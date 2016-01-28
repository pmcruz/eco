function runDemo() {
    var canvasDemo = $('#demo').get(0);
    var dsk = Sketch.create({
        container: canvasDemo,
        interval: 2,
        fullscreen: false,
        width: 1024,
        height: 200
    });

    var demoCompany;
    var demoWorm;
    dsk.setup = function() {
        demoCompany = new DemoCompany();
        demoWorm = new DemoWorm();
        demoWorm.setup();
    };

    dsk.draw = function() {
        demoCompany.drawShape();
        demoWorm.update();
        demoWorm.drawShape();
        
        var ww = 100;
        
        dsk.lineWidth = 1;
        dsk.strokeStyle = "#BBB";
        dsk.fillStyle = "#BBB";
        var vc = demoCompany.getPos();
        var vw = demoWorm.getPos();
        dsk.beginPath();
        dsk.moveTo(vc.x, vc.y);
        dsk.lineTo(dsk.width / 2 - ww, dsk.height / 2);
        dsk.moveTo(vw.x, vw.y);
        dsk.lineTo(dsk.width / 2 + ww, dsk.height / 2);
        dsk.stroke();
        dsk.beginPath(),
        dsk.arc(vc.x, vc.y, 2, 0, TWO_PI);
//        dsk.arc(dsk.width / 2 - ww, dsk.height / 2, 2, 0, TWO_PI);
//        //dsk.arc(vw.x, vw.y, 2, 0, TWO_PI);
//        dsk.arc(dsk.width / 2 + ww, dsk.height / 2, 2, 0, TWO_PI);
        dsk.fill();
        
//        dsk.fillStyle = "black";
//        dsk.font = "14px Lato";
//        dsk.textBaseline = "middle";
//        dsk.textAlign = "right";
//
//        dsk.fillText("e.g. empresa", dsk.width / 2 - ww - 10, dsk.height / 2);
//        dsk.textAlign = "left";
//        dsk.fillText("e.g. político", dsk.width / 2 + ww + 10, dsk.height / 2);
    };


    var DemoCompany = function() {
        var pos = new Vector(dsk.width / 2, dsk.height / 2);
        var radius = 40;
        this.drawShape = function() {
            var dir = new Vector(3, 0);
            dsk.save();
            dsk.translate(pos.x, pos.y);
            dsk.rotate(-dsk.millis / 600);
            dsk.fillStyle = "#EEE";
            dsk.beginPath();
            dsk.arc(dir.x, dir.y, radius, 0, TWO_PI);
            dsk.fill();

            dsk.rotate(-dsk.millis / 200);
            dsk.fillStyle = "#CCC";
            dsk.beginPath();
            dsk.arc(dir.x, dir.y, radius, 0, TWO_PI);
            dsk.fill();
            dsk.restore();

            dsk.fillStyle = "#DDD";
            dsk.beginPath();
            dsk.arc(pos.x, pos.y, radius, 0, TWO_PI);
            dsk.fill();
        };
        
        this.getPos = function(){
          return pos;  
        };
    };

    var DemoWorm = function() {
        var pos;
        var trail = [];
        var trailSize = 10;
        var center;
        var color;
        var silhouette;

        function createSilhouette() {
            var silh = [];
            for (var i = 0; i < trailSize; i++) {
                var vv = (i - 1) / 1.5;
                var mag = (sin(vv) + 0) * 2.5 + 0.5;
                silh.push(mag);
            }
            return silh;
        }

        function updateTrail() {
            trail.shift();
            trail.push(new Vector(pos.x, pos.y));
        }
        
        var aa = 0;
        function stepWorm() {
            var a = -dsk.millis / 500;
            aa+=random()/10;
            var dist = map(sin(aa), -1, 1, 45, 60);
            pos.x = dsk.width / 2 + dist * cos(a);
            pos.y = dsk.height / 2 + dist * sin(a);
        }

        var spikesAngle = 0;
        var spikesVelocity = random() * 0.5 + 0.1;

        function drawTrail() {
            var p0 = trail[0];
            var pl = trail[trail.length - 1];
            var vecs = [];

            dsk.beginPath();
            dsk.moveTo(p0.x, p0.y);
            for (var i = 1; i < trail.length - 1; i++) {
                var p = trail[i];
                var pv = trail[i - 1];
                var dir = new Vector(p.x - pv.x, p.y - pv.y);
                dir.norm();
                //perpendicular
                dir.set(-dir.y, dir.x);
                dir.scale(silhouette[i]);
                vecs.push(dir);
                dsk.lineTo(p.x + dir.x, p.y + dir.y);
            }
            dsk.lineTo(pl.x, pl.y);
            for (var i = trail.length - 2; i >= 1; i--) {
                var p = trail[i];
                var dir = vecs[i - 1];
                dsk.lineTo(p.x - dir.x, p.y - dir.y);
            }
            dsk.lineTo(p0.x, p0.y);
            dsk.fillStyle = color;
            dsk.fill();

            dsk.strokeStyle = color;
            dsk.lineWidth = 1;
            dsk.beginPath();

            /* draw spikes */
            var pts = [2, 3, 4];
            //sets spikes velocity
            spikesAngle += spikesVelocity;
            if (spikesAngle > PI)
                spikesAngle = 0;
            var spikeMagnitude = sin(spikesAngle) + 1.2;
            //draw spikes

            function drawSpikes() {
                for (var j = 0; j < pts.length; j++) {
                    var p = trail[pts[j]];
                    var pp = trail[pts[j] - 1];
                    var dir = vecs[pts[j] - 1];
                    dsk.moveTo(pp.x - dir.x * spikeMagnitude, pp.y - dir.y * spikeMagnitude);
                    dsk.lineTo(p.x, p.y);
                    dsk.lineTo(pp.x + dir.x * spikeMagnitude, pp.y + dir.y * spikeMagnitude);
                }
            }
            drawSpikes();
            dsk.stroke();

            function drawAntennas() {
                dsk.lineWidth = 0.5;
                var p = trail[trail.length - 1];
                var pp = trail[trail.length - 4];
                var ppx = trail[trail.length - 2];
                var dir = new Vector(p.x - pp.x, p.y - pp.y);
                dir.norm();
                dir.scale(10);
                dsk.save();
                dsk.translate(ppx.x, ppx.y);
                dsk.rotate(0.5);
                dsk.moveTo(dir.x, dir.y);
                dsk.lineTo(0, 0);
                dsk.rotate(-1);
                dsk.lineTo(dir.x, dir.y);
                dsk.restore();
                dsk.stroke();
            }
            drawAntennas();
        }

        this.setup = function() {
            pos = new Vector(dsk.width / 2 - 30, dsk.height / 2 - 30);
            /* init trail array */
            for (var i = 0; i < trailSize; i++) {
                trail.push(pos);
            }
            color = "#777";
            center = new Vector(dsk.width / 2, dsk.height / 2);
            silhouette = createSilhouette();

        };

        this.update = function() {
            stepWorm();
            updateTrail();
        };

        this.drawShape = function() {
            drawTrail();
        };
        
        this.getPos = function(){
            return trail[5];
        };

    };

}


