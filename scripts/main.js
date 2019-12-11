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
    let bounds = 0.97;

    state.canvas = document.getElementById('canvas');
    state.canvas.width = window.innerWidth*bounds;
    state.canvas.height = window.innerHeight*bounds;

    if(state.canvas.width < defaultWidth) state.canvas.width = defaultWidth;
    if(state.canvas.height < defaultHeight) state.canvas.width = defaultHeight;

    let ctx = initWebGLContext(state.canvas);
    if(!ctx) return;
    return ctx;
}

function getShader(ctx, id) {
    let shaderScript = document.getElementById(id);
    if(!shaderScript) return;

    let shader;
    if(shaderScript.type == 'x-shader/x-fragment') shader = ctx.createShader(state.gl.FRAGMENT_SHADER);
    else if(shaderScript.type == 'x-shader/x-vertex') shader = ctx.createShader(state.gl.VERTEX_SHADER);
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

var shaderProgram;
function initShaders() {
    let fShader = getShader(state.gl, 'fshader');
    let vShader = getShader(state.gl, 'vshader');
    
    shaderProgram = state.gl.createProgram();

    state.gl.attachShader(shaderProgram, fShader);
    state.gl.attachShader(shaderProgram, vShader);
    state.gl.linkProgram(shaderProgram);

    if(!state.gl.getProgramParameter(shaderProgram, state.gl.LINK_STATUS)) alert("Shaders failed to initialize.");

    state.gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = state.gl.getAttribLocation(shaderProgram, "aVertexPosition");
    state.gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = state.gl.getAttribLocation(shaderProgram, "aVertexColor");
    state.gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.texCoordAttribute = state.gl.getAttribLocation(shaderProgram, "aTexCoord");
    state.gl.enableVertexAttribArray(shaderProgram.texCoordAttribute);
    shaderProgram.normalAttribute = state.gl.getAttribLocation(shaderProgram, "aNormal");
    state.gl.enableVertexAttribArray(shaderProgram.normalAttribute);

    shaderProgram.pMatrixUniform = state.gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = state.gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

function initTextures() {
    
}

var cubeGeometry;
var vertexPositionBuffer;
var vertexTextureCoordBuffer;
var vertexIndicesBuffer;
function initGeometry() {
    for(let i = 0; i < state.rCube.dimensions[0]*state.rCube.dimensions[1]*state.rCube.dimensions[2]; ++i) {
        cubeGeometry = new Cube(state.gl);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.positionBuffer);
        state.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeGeometry.positionBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.colorBuffer);
        state.gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeGeometry.colorBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.textureBuffer);
        state.gl.vertexAttribPointer(shaderProgram.texCoordAttribute, cubeGeometry.textureBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.normalBuffer);
        state.gl.vertexAttribPointer(shaderProgram.normalAttribute, cubeGeometry.normalBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.rCube.cubes[i] = cubeGeometry;
    }
}

var xRot = 35, yRot = 45, zRot = 0;
function draw() {
    state.gl.viewport(0, 0, state.gl.viewportWidth, state.gl.viewportHeight);
    state.gl.clear(state.gl.COLOR_BUFFER_BIT | state.gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, state.gl.viewportWidth/state.gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [0.0,0.0,-5.0]);
    
    mat4.rotate(mvMatrix, xRot/180.0*3.1415, [1, 0, 0]);
    mat4.rotate(mvMatrix, yRot/180.0*3.1415, [0, 1, 0]);
    mat4.rotate(mvMatrix, zRot/180.0*3.1415, [0, 0, 1]);

    state.gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    state.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

    mat4.scale(mvMatrix, [0.3,0.3,0.3]);

    let x = 0, y = 0, z = 0;
    for(let cube in state.rCube.cubes) {
        if(!rotationMatrixInit) addRotationalMatrix(cube, x, y, z);
        drawCube(cube, x, y, z);

        if(x < state.rCube.dimensions[0]) ++x;
        if(x >= state.rCube.dimensions[0]) { 
            x = 0; 
            y = y>=state.rCube.dimensions[1]?0:++y; 
        }
        if(y >= state.rCube.dimensions[1]) { 
            y = 0; 
            z = z>=state.rCube.dimensions[2]?0:++z; 
        } 
    }

    requestAnimationFrame(draw);
}

function drawCube(cube, x, y, z) {
    let adjOrgin = 1.75;
    let spacing  = 2.0;
    
    let tempMatrix = mat4.create();
    mat4.identity(tempMatrix);
    mat4.multiply(mvMatrix, tempMatrix, tempMatrix);

    if(!tempMatrix) return;

    mat4.translate(tempMatrix, 
        [x*spacing-adjOrgin, y*spacing-adjOrgin, z*-spacing+adjOrgin]
    );
    
    state.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, tempMatrix);
    state.gl.drawElements(state.gl.TRIANGLES, 
        state.rCube.cubes[cube].vertexIndices.numItems, 
        state.gl.UNSIGNED_SHORT, 
        0
    );
}

var rotationMatrixInit = false;
function addRotationalMatrix(cube, x, y, z) {
    let matrices = state.rCube.matrices;
    if(cube >= state.rCube.cubes.length-1) {
        rotationMatrixInit = true;
    }
    if     (y==0) matrices.bottom.arr[matrices.bottom.arr.length] = cube;
    else if(y==1) matrices.middle.arr[matrices.middle.arr.length] = cube;
    else if(y==2) matrices.top.arr[matrices.top.arr.length]       = cube;
    if     (x==0) matrices.left.arr[matrices.left.arr.length]     = cube;
    else if(x==1) matrices.center.arr[matrices.center.arr.length] = cube;
    else if(x==2) matrices.right.arr[matrices.right.arr.length]   = cube;
}

var mvMatrix;
var pMatrix;
var state = {
    canvas: null,
    gl: null,
    rCube: {
        cubes: [],
        dimensions: [3,3,3],
        matrices: {
            bottom: { arr: [], matrix: null, isRotate: false },
            middle: { arr: [], matrix: null, isRotate: false },
            top:    { arr: [], matrix: null, isRotate: false },
            left:   { arr: [], matrix: null, isRotate: false },
            center: { arr: [], matrix: null, isRotate: false },
            right:  { arr: [], matrix: null, isRotate: false }
        },
        state: null
    }
}
window.onload = function() {
    mvMatrix = mat4.create();
    pMatrix = mat4.create();
    state.gl = initCanvas();

    initShaders();
    initTextures();
    initGeometry();

    state.gl.clearColor(0.5, 0.5, 0.5, 1.0);
    state.gl.enable(state.gl.DEPTH_TEST);
    state.gl.enable(state.gl.BLEND);
    state.gl.blendFunc(state.gl.SRC_ALPHA, state.gl.ONE_MINUS_SRC_ALPHA);

    draw();
}