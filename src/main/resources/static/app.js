var app = (function () {

    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    class Polygon {
        constructor(points) {
            this.points = points;
        }
    }

    var stompClient = null;

    var sessionID = null;

    var TOPIC_POINT_ADDRESS = '/topic/newpoint';

    var TOPIC_POLYGON_ADDRESS = '/topic/newpolygon';

    var PUBLISH_ADDRESS = '/app/newpoint';

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };

    var addPolygonToCanvas = function (polygon) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        var points = polygon.points;
        ctx.fillStyle = '#FFBF00';
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (i in points) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    };


    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);

            //subscribe to TOPIC_POINT_ADDRESS when connections succeed
            stompClient.subscribe(TOPIC_POINT_ADDRESS + '.' + sessionID, function (eventbody) {
                var point = JSON.parse(eventbody.body);
                addPointToCanvas(point);
//                alert("Point (" + point.x + ',' + point.y + ')');
            });

            //subscribe to TOPIC_POLYGON_ADDRESS when connections succeed
            stompClient.subscribe(TOPIC_POLYGON_ADDRESS + '.' + sessionID, function (eventbody) {
                var polygon = JSON.parse(eventbody.body);
                addPolygonToCanvas(polygon);
            });
        });

    };
    

    var connect = function (session) {
        if (session === null || session == '') {
            alert('Invalid session id.');
            return;
        }
        sessionID = session;
        // websocket connection
        connectAndSubscribe();
        $('#connectBtn').prop('disabled', true);
        $('#sendBtn').prop('disabled', false);

    }

    var init = function () {
        var can = document.getElementById("canvas");
        $('#sendBtn').prop('disabled', true);

        canvas.addEventListener("mousedown", function (e) {
            point = getMousePosition(e);
            publishPoint(point.x, point.y);
        }, false);
    };

    var publishPoint = function (px, py) {
        var pt = new Point(px, py);
        if (sessionID === null) {
            alert('Not yet logged in.');
            return;
        }
        console.info("publishing point at " + pt);
        addPointToCanvas(pt);
        //publicar el evento
        stompClient.send(PUBLISH_ADDRESS + '.' + sessionID, {}, JSON.stringify(pt));
    };

    var disconnect = function () {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        setConnected(false);
        console.log("Disconnected");
    };

    return {
        init: init,
        publishPoint: publishPoint,
        disconnect: disconnect,
        connect: connect
    };

})();