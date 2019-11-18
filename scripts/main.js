function initWebGLContext(canvas) {
    let ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if(!ctx) {
        alert("WebGL failed to initialize.")
        return;
    };

    ctx.viewportWidth = canvas.width;
    ctx.viewportHeight = canvas.height;
    
    return ctx;
}

function initCanvas() {
    let defaultWidth = 640;
    let defaultHeight = 480;
    let boundsX = 0.992;
    let boundsY = 0.98;
    let canvas = document.getElementById('canvas');

    canvas.width = window.innerWidth*boundsX;
    canvas.height = window.innerHeight*boundsY;

    if(canvas.width < defaultWidth) canvas.width = defaultWidth;
    if(canvas.height < defaultHeight) canvas.width = defaultHeight;

    let ctx = initWebGLContext(canvas);
    if(!ctx) return;
    return ctx;
}

function getShader(ctx, id) {
    let shaderScript = document.getElementById(id);
    if(!shaderScript) return;

    let shader;
    if(shaderScript.type == 'x-shader/x-fragment') shader = ctx.createShader(gl.FRAGMENT_SHADER);
    else if(shaderScript.type == 'x-shader/x-vertex') shader = ctx.createShader(gl.VERTEX_SHADER);
    else return;

    ctx.shaderSource(shader, shaderScript.textContent);
    ctx.compileShader(shader);

    if(!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        alert(ctx.getShaderInfoLog(shader));
        ctx.deleteShader(shader);
        return;
    }
    
    return shader;
}

function initShaders() {
    let fShader = getShader(gl, 'fshader');
    let vShader = getShader(gl, 'vshader');
    let shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, fShader);
    gl.attachShader(shaderProgram, vShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) alert("Shaders failed to initialize.");

    gl.useProgram(shaderProgram);
}

function initTextures() {
    
}

function initGeometry() {
    
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    requestAnimationFrame(draw);
}

var gl;
window.onload = function() {
    gl = initCanvas();

    initShaders();
    initTextures();
    initGeometry();

    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    draw();
}