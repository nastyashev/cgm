window.addEventListener("DOMContentLoaded", function () {
    let canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        console.log(gl);
        return;
    }

    if (!canvas) {
        console.log("Document doesn`t exist");
        console.log(canvas);
        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const vsSource = `
        uniform mat4 uModelMatrix;
        attribute vec4 a_position;
        attribute vec3 a_color;
        varying vec3 vColor;
        void main() {
            gl_Position = uModelMatrix * a_position;
            vColor = a_color;
        }
    `;

    const fsSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    let posBuffer = gl.createBuffer();
    setGeometry(gl, posBuffer);

    let colBuffer = gl.createBuffer();
    setColor(gl, colBuffer);

    let aPosition = gl.getAttribLocation(program, "a_position");
    let aColor = gl.getAttribLocation(program, "a_color");
    let uMatrix = gl.getUniformLocation(program, "uModelMatrix");

    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(aColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.vertexAttribPointer(aColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);

    let rotation = 0;

    drawScene();

    function drawScene() {
        rotation += 0.05;

        const rotationMatrix = [
            0.5, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            Math.cos(rotation) * 0.3, Math.sin(rotation) * 0.3, 0, 1,
        ];

        gl.uniformMatrix4fv(uMatrix, false, rotationMatrix);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6 * 4);

        window.requestAnimationFrame(drawScene);
    }
})

function setGeometry(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -0.5, 0.4, 0.0,
        -0.5, -0.2, 0.0,
        -0.3, -0.2, 0.0,
        -0.3, -0.2, 0.0,
        -0.3, 0.4, 0.0,
        -0.5, 0.4, 0.0,

        -0.1, 0.4, 0.0,
        -0.1, -0.2, 0.0,
        0.1, -0.2, 0.0,
        0.1, -0.2, 0.0,
        0.1, 0.4, 0.0,
        -0.1, 0.4, 0.0,

        0.3, 0.4, 0.0,
        0.3, -0.2, 0.0,
        0.5, -0.2, 0.0,
        0.5, -0.2, 0.0,
        0.5, 0.4, 0.0,
        0.3, 0.4, 0.0,

        -0.5, -0.2, 0.0,
        -0.5, -0.4, 0.0,
        0.5, -0.4, 0.0,
        0.5, -0.4, 0.0,
        0.5, -0.2, 0.0,
        -0.5, -0.2, 0.0,
    ]), gl.STATIC_DRAW)
}

function setColor(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([
        255, 0, 0,
        255, 0, 0,
        255, 0, 0,
        255, 0, 0,
        255, 0, 0,
        255, 0, 0,

        0, 255, 0,
        0, 255, 0,
        0, 255, 0,
        0, 255, 0,
        0, 255, 0,
        0, 255, 0,

        0, 0, 255,
        0, 0, 255,
        0, 0, 255,
        0, 0, 255,
        0, 0, 255,
        0, 0, 255,

        0, 255, 255,
        0, 255, 255,
        0, 255, 255,
        0, 255, 255,
        0, 255, 255,
        0, 255, 255,
    ]), gl.STATIC_DRAW)
}