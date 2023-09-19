window.onload = function () {

    const canvas = document.querySelector("#glcanvas");
    // initialize the GL context
    const gl = canvas.getContext("webgl");
    // only continue if WebGL is available and working
    if (gl === null) {
        alert(
            "Unable to initialize WebGL. Your browser or machine may not supportit."
        );
        return;
    }
    // set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);

    // fragment shader program
    const fsSource = `
        precision mediump float;
        varying vec3 vColor;
        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

    // vertex shader program
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

    // shaders
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    // vertices coordinates and colors
    const vertices = [
        0.0, 0.5, 1.0, 0.0, 1.0,
        0.5, 0.0, 1.0, 1.0, 0.0,
        -0.5, 0.0, 0.0, 1.0, 1.0,

        0.0, -0.5, 1.0, 0.0, 1.0,
        0.5, 0.0, 1.0, 1.0, 0.0,
        -0.5, 0.0, 0.0, 1.0, 1.0,
    ];

    // buffer of vertices
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


    // shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // attributes
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const colorAttributeLocation = gl.getAttribLocation(program, "a_color");

    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 20, 8);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.enableVertexAttribArray(colorAttributeLocation);


    let rotation = 0;

    const animate = function () {
        rotation += 0.03;

        const rotationMatrix = [
            Math.cos(rotation), Math.sin(rotation), 0, 0,
            Math.sin(rotation), -Math.cos(rotation), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];

        const matrixLocation = gl.getUniformLocation(program, "uModelMatrix");

        gl.uniformMatrix4fv(matrixLocation, false, rotationMatrix);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        window.requestAnimationFrame(animate);
    };

    animate();

}