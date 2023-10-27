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

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    let programCrate = initGL_1(gl);
    let programLid = initGL_2(gl);

    let posBuffer = gl.createBuffer();
    let colCrateBuffer = gl.createBuffer();
    let colLidBuffer = gl.createBuffer();

    setGeometry(gl, posBuffer);
    setGeometry(gl, posBuffer);
    setColor(gl, colCrateBuffer);
    setColor(gl, colLidBuffer);

    let a_coordsCrate = gl.getAttribLocation(programCrate, "a_coords");
    let a_colorsCrate = gl.getAttribLocation(programCrate, "a_colors");
    let u_PerspectiveCrate = gl.getUniformLocation(programCrate, "u_Perspective");
    let u_TranslateCrate = gl.getUniformLocation(programCrate, "u_Trans");
    let u_RotXCrate = gl.getUniformLocation(programCrate, "u_RotX");
    let u_RotYCrate = gl.getUniformLocation(programCrate, "u_RotY");
    let u_RotZCrate = gl.getUniformLocation(programCrate, "u_RotZ");

    let a_coordsLid = gl.getAttribLocation(programLid, "a_coords");
    let a_colorsLid = gl.getAttribLocation(programLid, "a_colors");
    let u_PerspectiveLid = gl.getUniformLocation(programLid, "u_Perspective");
    let u_TranslateLid = gl.getUniformLocation(programLid, "u_Trans");
    let u_ScaleLid = gl.getUniformLocation(programLid, "u_Scale");
    let u_RotXLid = gl.getUniformLocation(programLid, "u_RotX");
    let u_RotYLid = gl.getUniformLocation(programLid, "u_RotY");
    let u_RotZLid = gl.getUniformLocation(programLid, "u_RotZ");

    let crateData = {
        shift: {
            x: 0,
            y: -80,
            z: -400,
        },
        rotate: {
            x: 0,
            y: 0,
            z: 0,
        },
    };

    let lidData = {
        shift: {
            x: 0,
            y: 0,
            z: -400,
        },
        rotate: {
            x: 0,
            y: 0,
            z: 0,
        },
        scale: {
            x: 1,
            y: 0.03,
            z: 1,
        },
    };

    let сrateAngle = 120;
    let lidAngle = 30;
    const speedCrate = 1.5;
    const speedLid = 1.5;

    draw_scene(crateData, lidData, сrateAngle, lidAngle);

    document.addEventListener('keydown', function (e) {
        if (e.key == "ArrowLeft") {
            сrateAngle -= speedCrate;
        }
        if (e.key == "ArrowRight") {
            сrateAngle += speedCrate;
        }
        if (сrateAngle < 0) {
            сrateAngle = 360
        }
        if (сrateAngle > 360) {
            сrateAngle = 0
        }
        if (e.key == "ArrowUp") {
            lidAngle += speedLid;
        }
        if (e.key == "ArrowDown") {
            lidAngle -= speedLid;
        }
        if (lidAngle < 0) {
            lidAngle = 0;
        }
        if (lidAngle > 270) {
            lidAngle = 270;
        }

        draw_scene(crateData, lidData, сrateAngle, lidAngle);
    });

    function draw_crate() {
        gl.useProgram(programCrate);

        gl.enableVertexAttribArray(a_coordsCrate);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(a_coordsCrate, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(a_colorsCrate);
        gl.bindBuffer(gl.ARRAY_BUFFER, colCrateBuffer);
        gl.vertexAttribPointer(a_colorsCrate, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        gl.uniformMatrix4fv(u_PerspectiveCrate, false, perspective(gl.canvas.clientWidth, gl.canvas.clientHeight));
        gl.uniformMatrix4fv(u_TranslateCrate, false, translate(crateData.shift.x, crateData.shift.y, crateData.shift.z));
        gl.uniformMatrix4fv(u_RotXCrate, false, rotate_X(crateData.rotate.x));
        gl.uniformMatrix4fv(u_RotYCrate, false, rotate_Y(crateData.rotate.y));
        gl.uniformMatrix4fv(u_RotZCrate, false, rotate_Z(crateData.rotate.z));

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    }

    function draw_lid() {
        gl.useProgram(programLid);

        gl.enableVertexAttribArray(a_coordsLid);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(a_coordsLid, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(a_colorsLid);
        gl.bindBuffer(gl.ARRAY_BUFFER, colLidBuffer);
        gl.vertexAttribPointer(a_colorsLid, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        gl.uniformMatrix4fv(u_PerspectiveLid, false, perspective(gl.canvas.clientWidth, gl.canvas.clientHeight));
        gl.uniformMatrix4fv(u_TranslateLid, false, translate(lidData.shift.x, lidData.shift.y, lidData.shift.z));
        gl.uniformMatrix4fv(u_ScaleLid, false, scale(lidData.scale.x, lidData.scale.y, lidData.scale.z));
        gl.uniformMatrix4fv(u_RotXLid, false, rotate_X(lidData.rotate.x));
        gl.uniformMatrix4fv(u_RotYLid, false, rotate_Y(lidData.rotate.y));
        gl.uniformMatrix4fv(u_RotZLid, false, rotate_Z(lidData.rotate.z));

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6)
    }

    function draw_scene(crateInfo, lidInfo, degY, degZ) {
        crateInfo.rotate.y = degY;
        lidInfo.rotate.y = degY;
        lidInfo.rotate.z = degZ;
        lidInfo.shift.y = Math.sin(degToRad(degZ)) - 29.5;

        draw_crate();
        draw_lid();
    }
});

function initGL_1(gl) {
    let vsSource = `
    attribute vec4 a_coords;
    attribute vec4 a_colors;
    uniform mat4 u_Perspective;
    uniform mat4 u_Trans;
    uniform mat4 u_RotX;
    uniform mat4 u_RotY;
    uniform mat4 u_RotZ;
    varying vec4 v_color;

    void main()
    {
        mat4 P = u_Perspective * u_Trans;
        mat4 M = u_RotX * u_RotY * u_RotZ;
        mat4 MP = P * M;
        gl_Position = MP * a_coords;
        v_color = a_colors;
    }
    `;

    let fsSource = `
    precision mediump float;
    varying vec4 v_color;

    void main()
    {
        gl_FragColor = v_color;
    }
    `;

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

function initGL_2(gl) {
    let vsSource = `
    attribute vec4 a_coords;
    attribute vec4 a_colors;
    uniform mat4 u_Perspective;
    uniform mat4 u_Trans;
    uniform mat4 u_Scale;
    uniform mat4 u_RotX;
    uniform mat4 u_RotY;
    uniform mat4 u_RotZ;
    varying vec4 v_color;

    void main()
    {
        mat4 P = u_Perspective * u_Trans;
        mat4 M = u_RotX * u_RotY * u_RotZ * u_Scale;
        mat4 MP = P * M;
        gl_Position = MP * a_coords;
        v_color = a_colors;
    }
    `;

    let fsSource = `
    precision mediump float;
    varying vec4 v_color;

    void main()
    {
        gl_FragColor = v_color;
    }
    `;

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

function perspective(width, height, near = 1, far = 1000, deg = 60) {
    let f = Math.tan(Math.PI * 0.5 - 0.5 * degToRad(deg));
    let rangeInv = 1.0 / (near - far);
    let aspect = width / height;
    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0,
    ];
}

function translate(tx, ty, tz) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1,
    ];
}

function rotate_X(deg) {
    let angleInRadians = degToRad(deg);
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);
    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
}

function rotate_Y(deg) {
    let angleInRadians = degToRad(deg);
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);
    return [
        c, 0, -s, 0,
        0, 1, 0, 0,
        s, 0, c, 0,
        0, 0, 0, 1,
    ];
}

function rotate_Z(deg) {
    let angleInRadians = degToRad(deg);
    let c = Math.cos(angleInRadians);
    let s = Math.sin(angleInRadians);
    return [
        1, 0, 0, 0,
        0, c, s, 0,
        0, -s, c, 0,
        0, 0, 0, 1,
    ];
}

function degToRad(d) {
    return d * Math.PI / 180;
}

function scale(sx, sy, sz) {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    ];
}

function setGeometry(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        50, 50, 0,
        -50, -50, 0,
        50, -50, 0,
        50, 50, 0,
        -50, -50, 0,
        -50, 50, 0,

        50, 50, -100,
        -50, -50, -100,
        50, -50, -100,
        50, 50, -100,
        -50, -50, -100,
        -50, 50, -100,

        50, 50, 0,
        -50, 50, -100,
        -50, 50, 0,
        50, 50, 0,
        -50, 50, -100,
        50, 50, -100,

        50, -50, 0,
        -50, -50, -100,
        -50, -50, 0,
        50, -50, 0,
        -50, -50, -100,
        50, -50, -100,

        50, 50, 0,
        50, -50, -100,
        50, -50, 0,
        50, 50, 0,
        50, -50, -100,
        50, 50, -100,

        -50, 50, 0,
        -50, -50, -100,
        -50, -50, 0,
        -50, 50, 0,
        -50, -50, -100,
        -50, 50, -100,
    ]), gl.STATIC_DRAW)
}

function setColor(gl, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(generateRandomColorsArray()), gl.STATIC_DRAW)
}

function generateRandomColorsArray() {
    let arr = [];
    let rand = {
        r: 0,
        g: 0,
        b: 0,
    };
    for (let i = 0; i < 6; i++) {
        rand.r = Math.floor(Math.random() * 255);
        rand.g = Math.floor(Math.random() * 255);
        rand.b = Math.floor(Math.random() * 255);
        for (let k = 0; k < 6; k++) {
            arr.push(rand.r, rand.g, rand.b)
        }
    }
    return arr;
}
