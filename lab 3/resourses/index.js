window.addEventListener("DOMContentLoaded", function () {

    const canvas = document.querySelector("#glcanvas");
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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // vertex shader program
    let vsSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;

    void main()
    {
        gl_Position = u_matrix * a_position;
        v_color = a_color;
    }
    `;

    // fragment shader program
    const fsSource = `
    precision mediump float;
    varying vec4 v_color;

    void main()
    {
        gl_FragColor = v_color;
    }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(program);

    let posBuffer = gl.createBuffer();
    setGeometry(gl, posBuffer);

    let colBuffer = gl.createBuffer();
    setColor(gl, colBuffer);

    let aPosition = gl.getAttribLocation(program, "a_position");
    let aColor = gl.getAttribLocation(program, "a_color");
    let uMatrix = gl.getUniformLocation(program, "u_matrix");

    gl.enableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    
    gl.enableVertexAttribArray(aColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.vertexAttribPointer(aColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);
    
    let objectInfo = {
        shift: {
            x: -250,
            y: 0,
            z: -450,
        },
        rotate: {
            x: 90,
            y: 30,
            z: 300,
        },
    };

    let move = 0;

    drawScene();

    function drawScene() {
        move += 0.1;

        objectInfo.shift.x += 10 * Math.sin(move);
        objectInfo.shift.y += 10 * Math.cos(move);

        objectInfo.rotate.x += 1;
   
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let matrix = m4.perspective(aspect);

        matrix = m4.translate(matrix, objectInfo.shift.x, objectInfo.shift.y, objectInfo.shift.z);
        matrix = m4.xRotate(matrix, degToRad(objectInfo.rotate.x));
        matrix = m4.yRotate(matrix, degToRad(objectInfo.rotate.y));
        matrix = m4.zRotate(matrix, degToRad(objectInfo.rotate.z));

        gl.uniformMatrix4fv(uMatrix, false, matrix);

        gl.drawArrays(gl.TRIANGLES, 0, 6*6);

        setTimeout(window.requestAnimationFrame, 30, drawScene);
        
    }
});


function setGeometry(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        150,    150,    150,
         50,    150,    150,
         50,     50,    150,
        150,    150,    150,
        150,     50,    150,
         50,     50,    150,

         50,    150,    150,
         50,    150,     50,
         50,     50,     50,
         50,    150,    150,
         50,     50,    150,
         50,     50,     50,

        150,    150,    150,
        150,     50,    150,
        150,     50,     50,
        150,    150,    150,
        150,    150,     50,
        150,     50,     50,

        150,    150,    150,
         50,    150,    150,
         50,    150,     50,
        150,    150,    150,
        150,    150,     50,
         50,    150,     50,

        150,     50,    150,
        150,     50,     50,
         50,     50,     50,
        150,     50,    150,
         50,     50,    150,
         50,     50,     50,

        150,    150,     50,
        150,     50,     50,
         50,     50,     50,
        150,    150,     50,
         50,    150,     50,
         50,     50,     50,
        ]), gl.STATIC_DRAW)
}

function setColor(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([
        255,      0,      0,
        255,      0,      0,
        255,      0,      0,
        255,      0,      0,
        255,      0,      0,
        255,      0,      0,

          0,    255,      0,
          0,    255,      0,
          0,    255,      0,
          0,    255,      0,
          0,    255,      0,
          0,    255,      0,

          0,      0,    255,
          0,      0,    255,
          0,      0,    255,
          0,      0,    255,
          0,      0,    255,
          0,      0,    255,

          0,    255,    255,
          0,    255,    255,
          0,    255,    255,
          0,    255,    255,
          0,    255,    255,
          0,    255,    255,

        255,      0,    255,
        255,      0,    255,
        255,      0,    255,
        255,      0,    255,
        255,      0,    255,
        255,      0,    255,

        255,    255,      0,
        255,    255,      0,
        255,    255,      0,
        255,    255,      0,
        255,    255,      0,
        255,    255,      0,
        ]), gl.STATIC_DRAW)
}

function degToRad(d) {
    return d * Math.PI / 180;
}

var m4 = {
    perspective: function(aspect, near=1, far=1000) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * degToRad(60));
        var rangeInv = 1.0 / (near-far);
        return [
            f / aspect, 0,                         0,  0,
                     0, f,                         0,  0,
                     0, 0,   (near + far) * rangeInv, -1,
                     0, 0, near * far * rangeInv * 2,  0,
          ];
    },
    translate: function(m, tx, ty, tz) {
        return m4.multiply(m, m4.translation(tx, ty, tz));
    },
    xRotate: function (m, angleInRadians) {
        return m4.multiply(m, m4.xRotation(angleInRadians));
    },
    yRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.yRotation(angleInRadians));
    },
    zRotate: function(m, angleInRadians) {
        return m4.multiply(m, m4.zRotation(angleInRadians));
    },
    xRotation: function(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        return [
            1,  0, 0, 0,
            0,  c, s, 0,
            0, -s, c, 0,
            0,  0, 0, 1,
        ];
    },
    yRotation: function(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        return [
            c, 0, -s, 0,
            0, 1,  0, 0,
            s, 0,  c, 0,
            0, 0,  0, 1,
        ];
    },
    zRotation: function(angleInRadians) {
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
        return [
             c, s, 0, 0,
            -s, c, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1,
        ];
    },
    multiply: function(a, b) {
        return [
            b[0] * a[0] + b[1] * a[4] + b[2] * a[8] + b[3] * a[12],
            b[0] * a[1] + b[1] * a[5] + b[2] * a[9] + b[3] * a[13],
            b[0] * a[2] + b[1] * a[6] + b[2] * a[10] + b[3] * a[14],
            b[0] * a[3] + b[1] * a[7] + b[2] * a[11] + b[3] * a[15],
            b[4] * a[0] + b[5] * a[4] + b[6] * a[8] + b[7] * a[12],
            b[4] * a[1] + b[5] * a[5] + b[6] * a[9] + b[7] * a[13],
            b[4] * a[2] + b[5] * a[6] + b[6] * a[10] + b[7] * a[14],
            b[4] * a[3] + b[5] * a[7] + b[6] * a[11] + b[7] * a[15],
            b[8] * a[0] + b[9] * a[4] + b[10] * a[8] + b[11] * a[12],
            b[8] * a[1] + b[9] * a[5] + b[10] * a[9] + b[11] * a[13],
            b[8] * a[2] + b[9] * a[6] + b[10] * a[10] + b[11] * a[14],
            b[8] * a[3] + b[9] * a[7] + b[10] * a[11] + b[11] * a[15],
            b[12] * a[0] + b[13] * a[4] + b[14] * a[8] + b[15] * a[12],
            b[12] * a[1] + b[13] * a[5] + b[14] * a[9] + b[15] * a[13],
            b[12] * a[2] + b[13] * a[6] + b[14] * a[10] + b[15] * a[14],
            b[12] * a[3] + b[13] * a[7] + b[14] * a[11] + b[15] * a[15],
        ];
    },
    translation: function(tx, ty, tz) {
        return [
             1,  0,  0, 0,
             0,  1,  0, 0,
             0,  0,  1, 0,
            tx, ty, tz, 1,
        ];
    },
};

