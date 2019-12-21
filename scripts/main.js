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

function initCanvasDimensions() {
    let defaultWidth = 640;
    let defaultHeight = 480;
    let bounds = 0.97;

    state.canvas.width = window.innerWidth*bounds;
    state.canvas.height = window.innerHeight*(bounds-0.02);

    if(state.canvas.width < defaultWidth) state.canvas.width = defaultWidth;
    if(state.canvas.height < defaultHeight) state.canvas.width = defaultHeight;
}

function initCanvas() {
    state.canvas = document.getElementById('canvas');

    initCanvasDimensions();

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
    for(let i = 0; i < Math.pow(state.rCube.dimensions,3); ++i) {
        cubeGeometry = new Cube(state.gl);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.positionBuffer);
        state.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeGeometry.positionBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.colorBuffer);
        state.gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeGeometry.colorBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.textureBuffer);
        state.gl.vertexAttribPointer(shaderProgram.texCoordAttribute, cubeGeometry.textureBuffer.itemSize, state.gl.FLOAT, false, 0, 0);
        state.gl.bindBuffer(state.gl.ARRAY_BUFFER, cubeGeometry.normalBuffer);
        state.gl.vertexAttribPointer(shaderProgram.normalAttribute, cubeGeometry.normalBuffer.itemSize, state.gl.FLOAT, false, 0, 0);

        cubeGeometry.num         = i;
        cubeGeometry.orientation = {x:0, y:0, z:0};
        cubeGeometry.position    = {x:0, y:0, z:0};

        state.rCube.cubes[i] = cubeGeometry;
    }
}

var xRot = 35, yRot = 45, zRot = 0;
function drawScene() {
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

    if(0) {      
    } else {
        for(let cube in state.rCube.matrices.top) {
            drawCube(state.rCube.matrices.top[cube]);
        }
        for(let cube in state.rCube.matrices.middle) {
            drawCube(state.rCube.matrices.middle[cube]);
        }
        for(let cube in state.rCube.matrices.bottom) {
            drawCube(state.rCube.matrices.bottom[cube]);
        }
    }

    requestAnimationFrame(drawScene);
}

function drawCube(cube) {
    let adjOrgin = 1.75;
    let spacing  = 2.0;

    let tempMatrix = cube.modelMatrix;
    mat4.identity(tempMatrix);
    mat4.multiply(mvMatrix, tempMatrix, tempMatrix);

    if(!tempMatrix) return;

    mat4.translate(tempMatrix, [
        cube.position.x *  spacing - adjOrgin,
        cube.position.y *  spacing - adjOrgin,
        cube.position.z * -spacing + adjOrgin
    ]);
    mat4.rotate(
        tempMatrix,
        cube.orientation.y/180.0*3.1415,
        [0, 1, 0]
    );
    mat4.rotate(
        tempMatrix,
        cube.orientation.x/180.0*3.1415,
        [1, 0, 0]
    );
    mat4.rotate(
        tempMatrix,
        cube.orientation.z/180.0*3.1415,
        [0, 0, 1]
    );

    state.gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, tempMatrix);
    state.gl.drawElements(state.gl.TRIANGLES,
        cube.vertexIndices.numItems,
        state.gl.UNSIGNED_SHORT,
        0
    );
}

function initRotationMatrices() {
    let x = 0, y = 0, z = 0;
    let max = state.rCube.dimensions-1;
    for(let cube in state.rCube.cubes) {
        addRotationalMatrix(state.rCube.cubes[cube], x, y, z);

        if(x < state.rCube.dimensions) ++x;
        if(x >= state.rCube.dimensions) {
            x = 0;
            z = z>=state.rCube.dimensions ? 0 : ++z;
        }
        if(z >= state.rCube.dimensions) {
            z = 0;
            y = y>=state.rCube.dimensions ? 0 : ++y;
        }
    }
}

function addRotationalMatrix(cube, x, y, z) {
    let matrices = state.rCube.matrices;

    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;

    if     (y==0) matrices.bottom [matrices.bottom.length ] = cube;
    else if(y==1) matrices.middle [matrices.middle.length ] = cube;
    else if(y==2) matrices.top    [matrices.top.length    ] = cube;
    if     (x==0) matrices.rleft  [matrices.rleft.length  ] = cube;
    else if(x==1) matrices.rcenter[matrices.rcenter.length] = cube;
    else if(x==2) matrices.rright [matrices.rright.length ] = cube;
    if     (z==0) matrices.lright [matrices.lright.length ] = cube;
    else if(z==1) matrices.lcenter[matrices.lcenter.length] = cube;
    else if(z==2) matrices.lleft  [matrices.lleft.length  ] = cube;
}

var rotate = false;
var mRotX = mRotY = mRotZ = 0;
function drawRotation(matrix) {
    
}

function rotateMatrix(matrix, steps, direction) {
    let LEFT = 'left', RIGHT = 'right';
    let rotation = steps*90;
    let rotationX = 0, rotationY = 0, rotationZ = 0;
    let max = state.rCube.dimensions-1;
    let shift = steps*max;
    let newArray = [];

    switch(matrix) {
        case state.rCube.matrices.bottom:
            rotationY = rotation;
            break;
        case state.rCube.matrices.middle:
            rotationY = rotation;
            break;
        case state.rCube.matrices.top:
            rotationY = rotation;
            break;
        case state.rCube.matrices.rright:
            rotationX = rotation;
            break;
        case state.rCube.matrices.rcenter:
            rotationX = rotation;
            break;
        case state.rCube.matrices.rleft:
            rotationX = rotation;
            break;
        case state.rCube.matrices.lleft:
            rotationZ = -rotation;
            break;
        case state.rCube.matrices.lcenter:
            rotationZ = -rotation;
            break;
        case state.rCube.matrices.lright:
            rotationZ = -rotation;
            break;
    }

    for(let cube in matrix) {
        let newCube;
        if(direction==RIGHT) {
            if(rotationZ) {
                if(cube < state.rCube.dimensions) newCube = matrix[(cube+cube*2+matrix.length+4-shift)%matrix.length];
                else if(cube < state.rCube.dimensions*2) newCube = matrix[(cube+cube*2-1+matrix.length+4-shift)%matrix.length];
                else newCube = matrix[(cube+cube*2-2+matrix.length+4-shift)%matrix.length];
            } else {
                if(cube < state.rCube.dimensions) newCube = matrix[(cube-cube*4+matrix.length+8-shift)%matrix.length];
                else if(cube < state.rCube.dimensions*2) newCube = matrix[(cube-cube*4+matrix.length+9-shift)%matrix.length];
                else newCube = matrix[(cube-cube*4+matrix.length*2+10-shift)%matrix.length];
            }

            if(newCube.orientation.y) {
                newCube.orientation.x -= rotationZ;
                newCube.orientation.y += rotationY;
                newCube.orientation.z += rotationX;    
            } else {
                newCube.orientation.x += rotationX;
                newCube.orientation.y += rotationY;
                newCube.orientation.z += rotationZ;
            }
        } else if(direction==LEFT) {
            if(rotationZ) {
                if(cube < state.rCube.dimensions) newCube = matrix[(cube-cube*4+matrix.length+8-shift)%matrix.length];
                else if(cube < state.rCube.dimensions*2) newCube = matrix[(cube-cube*4+matrix.length+9-shift)%matrix.length];
                else newCube = matrix[(cube-cube*4+matrix.length*2+10-shift)%matrix.length];
            } else {
                if(cube < state.rCube.dimensions) newCube = matrix[(cube+cube*2+matrix.length+4-shift)%matrix.length];
                else if(cube < state.rCube.dimensions*2) newCube = matrix[(cube+cube*2-1+matrix.length+4-shift)%matrix.length];
                else newCube = matrix[(cube+cube*2-2+matrix.length+4-shift)%matrix.length];
            }

            if(newCube.orientation.y) {
                newCube.orientation.x += rotationZ;
                newCube.orientation.y -= rotationY;
                newCube.orientation.z -= rotationX;    
            } else {
                newCube.orientation.x -= rotationX;
                newCube.orientation.y -= rotationY;
                newCube.orientation.z -= rotationZ;
            }
        } else return;

        if(rotationX) {
            if(newCube.position.z==0) { //front
                if(direction==LEFT)  {
                    newCube.position.z = newCube.position.y;
                    newCube.position.y = max;
                }
                else if(direction==RIGHT) {
                    newCube.position.z = max-newCube.position.y;
                    newCube.position.y = 0;
                }
            } else if(newCube.position.z==max) { //back
                if(direction==LEFT)  {
                    newCube.position.z = newCube.position.y;
                    newCube.position.y = 0;
                }
                else if(direction==RIGHT) {
                    newCube.position.z = max-newCube.position.y;
                    newCube.position.y = max;
                }
            } else if(newCube.position.y==max) { //top
                if(direction==LEFT)  {
                    newCube.position.y = max-newCube.position.z;
                    newCube.position.z = max;
                }
                else if(direction==RIGHT) {
                    newCube.position.y = newCube.position.z;
                    newCube.position.z = 0;
                }
            } else if(newCube.position.y==0) { //bottom
                if(direction==LEFT)  {
                    newCube.position.y = max-newCube.position.z;
                    newCube.position.z = 0;
                }
                else if(direction==RIGHT) {
                    newCube.position.y = newCube.position.z;
                    newCube.position.z = max;
                }
            }
        } else if(rotationY) {
            if(newCube.position.z==0) { //front
                if(direction==LEFT)  {
                    newCube.position.z = max-newCube.position.x;
                    newCube.position.x = 0;
                }
                else if(direction==RIGHT) {
                    newCube.position.z = newCube.position.x;
                    newCube.position.x = max;
                }
            } else if(newCube.position.z==max) { //back
                if(direction==LEFT)  {
                    newCube.position.z = max-newCube.position.x;
                    newCube.position.x = max;
                }
                else if(direction==RIGHT) {
                    newCube.position.z = newCube.position.x;
                    newCube.position.x = 0;
                }
            } else if(newCube.position.x==0) { //left
                if(direction==LEFT)  {
                    newCube.position.x = max-newCube.position.z;
                    newCube.position.z = max;
                }
                else if(direction==RIGHT) {
                    newCube.position.x = max-newCube.position.z;
                    newCube.position.z = 0;
                }
            } else if(newCube.position.x==max) { //right
                if(direction==LEFT)  {
                    newCube.position.x = newCube.position.z;
                    newCube.position.z = 0;
                }
                else if(direction==RIGHT) {
                    newCube.position.x = max-newCube.position.z;
                    newCube.position.z = max;
                }
            }
        } else if(rotationZ) {
            if(newCube.position.x==0) { //left
                if(direction==LEFT)  {
                    newCube.position.x = max-newCube.position.y;
                    newCube.position.y = 0;
                }
                else if(direction==RIGHT) {
                    newCube.position.x = newCube.position.y;
                    newCube.position.y = max;
                }
            } else if(newCube.position.x==max) { //right
                if(direction==LEFT)  {
                    newCube.position.x = max-newCube.position.y;
                    newCube.position.y = max;
                }
                else if(direction==RIGHT) {
                    newCube.position.x = newCube.position.y;
                    newCube.position.y = 0;
                }
            } else if(newCube.position.y==max) { //top
                if(direction==LEFT)  {
                    newCube.position.y = newCube.position.x;
                    newCube.position.x = 0;
                }
                else if(direction==RIGHT) {
                    newCube.position.y = max-newCube.position.x;
                    newCube.position.x = max;
                }
            } else if(newCube.position.y==0) { //bottom
                if(direction==LEFT)  {
                    newCube.position.y = newCube.position.x;
                    newCube.position.x = max;
                }
                else if(direction==RIGHT) {
                    newCube.position.y = max-newCube.position.x;
                    newCube.position.x = 0;
                }
            }
        } else return;
        
        newArray[cube] = newCube;
    }

    let i, j;
    max = state.rCube.dimensions;
    switch(matrix) {
        case state.rCube.matrices.bottom:
            state.rCube.matrices.bottom = matrix = newArray;

            i = j = 0;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.lright[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.lcenter[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.lleft[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.rleft[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.rcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.rright[j] = matrix[cube];
                    ++j;
                }

                i = (i<max-1) ? i+1 : 0;
            }

            break;
        case state.rCube.matrices.middle:
            state.rCube.matrices.middle = matrix = newArray;

            i = j = 3;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.lright[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.lcenter[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.lleft[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.rleft[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.rcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.rright[j] = matrix[cube];
                    ++j;
                }

                i = (i<max*2-1) ? i+1 : 3;
            }

            break;
        case state.rCube.matrices.top:
            state.rCube.matrices.top = matrix = newArray;

            i = j = 6;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.lright[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.lcenter[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.lleft[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.rleft[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.rcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.rright[j] = matrix[cube];
                    ++j;
                }

                i = (i<max*3-1) ? i+1 : 6;
            }

            break;
        case state.rCube.matrices.rright:
            state.rCube.matrices.rright = matrix = newArray;

            i = j = 2;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.bottom[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.middle[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.top[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.lright[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.lcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.lleft[j] = matrix[cube];
                    j+=3;
                }

                i = (i+3<max*3) ? i+3 : 2;
            }

            break;
        case state.rCube.matrices.rcenter:
            state.rCube.matrices.rcenter = matrix = newArray;

            i = j = 1;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.bottom[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.middle[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.top[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.lright[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.lcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.lleft[j] = matrix[cube];
                    j+=3;
                }

                i = (i+3<max*3) ? i+3 : 1;
            }

            break;
        case state.rCube.matrices.rleft:
            state.rCube.matrices.rleft = matrix = newArray;

            i = j = 0;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.bottom[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.middle[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.top[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.lright[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.lcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.lleft[j] = matrix[cube];
                    j+=3;
                }

                i = (i+3<max*3) ? i+3 : 0;
            }

            break;
        case state.rCube.matrices.lleft:
            state.rCube.matrices.lleft = matrix = newArray;

            i = 6;
            j = 2;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.bottom[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.middle[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.top[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.rleft[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.rcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.rright[j] = matrix[cube];
                    j+=3;
                }

                i = (i<max*3-1) ? i+1 : 6;
            }

            break;
        case state.rCube.matrices.lcenter:
            state.rCube.matrices.lcenter = matrix = newArray;

            i = 3;
            j = 1;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.bottom[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.middle[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.top[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.rleft[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.rcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.rright[j] = matrix[cube];
                    j+=3;
                }

                i = (i<max*2-1) ? i+1 : 3;
            }

            break;
        case state.rCube.matrices.lright:
            state.rCube.matrices.lright = matrix = newArray;

            i = j = 0;
            for(let cube in matrix) {
                if(cube<max) {
                    state.rCube.matrices.bottom[i] = matrix[cube];
                } else if(cube<max*2) {
                    state.rCube.matrices.middle[i] = matrix[cube];
                } else if(cube<max*3) {
                    state.rCube.matrices.top[i] = matrix[cube];
                }

                if(cube%3==0) {
                    state.rCube.matrices.rleft[j] = matrix[cube];
                } else if(cube%3==1) {
                    state.rCube.matrices.rcenter[j] = matrix[cube];
                } else if(cube%3==2) {
                    state.rCube.matrices.rright[j] = matrix[cube];
                    j+=3;
                }

                i = (i<max-1) ? i+1 : 0;
            }

            break;
    }

    return matrix;
}

var mvMatrix;
var pMatrix;
var state = {
    canvas: null,
    gl:     null,
    rCube: {
        cubes: [],
        dimensions: 3,
        matrices: {
            bottom:  [],
            middle:  [],
            top:     [],
            rleft:   [],
            rcenter: [],
            rright:  [],
            lleft:   [],
            lcenter: [],
            lright:  []
        }
    }
}
window.onload = function() {
    mvMatrix = mat4.create();
    pMatrix  = mat4.create();
    state.gl = initCanvas();

    initShaders();
    initTextures();
    initGeometry();
    initRotationMatrices();

    state.gl.clearColor(0.5, 0.5, 0.5, 1.0);
    state.gl.enable(state.gl.DEPTH_TEST);
    state.gl.enable(state.gl.BLEND);
    state.gl.blendFunc(state.gl.SRC_ALPHA, state.gl.ONE_MINUS_SRC_ALPHA);

    drawScene();
}