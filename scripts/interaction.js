window.addEventListener('mousedown', mouseDown);
window.addEventListener('mouseup', mouseUp);
window.addEventListener('mousemove', mouseMove);

var prevX, prevY, origX, origY;
var drag = false;
function mouseDown(e) {
    let obj = pickObj();

    origX = prevX = e.pageX;
    origY = prevY = e.pageY;
    if(e.which == 1) {
        drag = true;
        rotate = true;
    }
    if(e.which == 3) {
        drag = true;
    }
    e.preventDefault();
    return false;
}

function mouseUp() {
    if(rotate) {
        rotate = false;
    }

    if(drag) {
        drag = false;
    }
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

function pickObj() {
}