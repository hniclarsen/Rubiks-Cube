window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);
window.addEventListener('mousemove', mouseMove);

var prevX, prevY;
var drag = false;
function mouseDown(e) {
    let pixels = Array.from(getPixel(e, state.canvas, state.gl));
    let obj = pickObj(pixels);

    prevX = e.pageX;
    prevY = e.pageY;
    if(e.which == 3) {
        drag = true;
    }
    e.preventDefault();
    return false;
}

function mouseUp() {
    drag = false;
}


function mouseMove(e) {
    if(drag) {
        yRot += e.pageX-prevX;
        xRot += e.pageY-prevY;
        prevX = e.pageX;
        prevY = e.pageY;
    }
    e.preventDefault();
}

function canvasCoord(e, canvas) {
    let x = e.clientX;
    let y = e.clientY;
    let rect = e.target.getBoundingClientRect();
    x = x - rect.left;
    y = y.bottom - y;
    return { x:x, y:y };
}

function getPixel(e, canvas, gl) {
    let p = canvasCoord(e, canvas);
    let pixels = new Uint8Array(4);
    gl.readPixels(p.x, p.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    return pixels;
}

function pickObj(pixels) {
    pixels = pixels.map(function(n) { return n/255});
    return state.rCube.cubes.find(function(obj) {
        return pixels.length == obj.aColor.length &&
            pixels.every(function(s, t) {
                return s == obj.aColor[i];
            });
    });
}