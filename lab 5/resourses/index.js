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
    gl.enable(gl.DEPTH_TEST);

    let vsSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;
    attribute vec3 a_normal;
    uniform mat4 u_perspective;
    uniform mat4 u_camera;
    varying vec3 v_normal;
    varying vec4 v_color;

    void main()
    {
        mat4 projectionMatrix = u_perspective * u_camera;
        gl_Position = projectionMatrix * a_position;

        v_normal = a_normal;
        v_color = a_color;
    }
    `;

    const fsSource = `
    precision mediump float;

    uniform vec3 u_light;
    varying vec4 v_color;
    varying vec3 v_normal;

    void main()
    {
        vec3 normal = normalize(v_normal);
        float light = dot(normal, u_light);
        gl_FragColor = v_color;
        gl_FragColor.rgb *= light;
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

    let normalBuffer = gl.createBuffer();
    setNormals(gl, normalBuffer);

    let aPosition = gl.getAttribLocation(program, "a_position");
    let aNormal = gl.getAttribLocation(program, "a_normal");
    let aColor = gl.getAttribLocation(program, "a_color");

    let uPerspective = gl.getUniformLocation(program, "u_perspective");
    let uCamera = gl.getUniformLocation(program, "u_camera");
    let uLight = gl.getUniformLocation(program, "u_light");

    let cameraInfo = {
        position: [250, 100, 100],
        target: [0, 0, 0],
        up: [0, 1, 0],
    };

    let lightInfo = {
        x: 0.3,
        y: 0.6,
        z: 0.9,
    };

    drawScene();

    document.getElementById('increaseX').addEventListener('mouseup', function () {
        if (lightInfo.x < 1) {
            lightInfo.x += 0.1;
            console.log('Increased X: ', lightInfo.x);
            drawScene();
        } else {
            console.log('Cannot increase, lightInfo.x is already at maximum');
        }
    });

    document.getElementById('decreaseX').addEventListener('mouseup', function () {
        if (lightInfo.x >= 0) {
            lightInfo.x -= 0.1;
            console.log('Decreased X: ', lightInfo.x);
            drawScene();
        } else {
            console.log('Cannot decrease, lightInfo.x is already at minimum');
        }
    });

    document.getElementById('increaseY').addEventListener('mouseup', function () {
        if (lightInfo.y < 1) {
            lightInfo.y += 0.1;
            console.log('Increased Y: ', lightInfo.y);
            drawScene();
        } else {
            console.log('Cannot increase, lightInfo.y is already at maximum');
        }
    });

    document.getElementById('decreaseY').addEventListener('mouseup', function () {
        if (lightInfo.y >= 0) {
            lightInfo.y -= 0.1;
            console.log('Decreased Y: ', lightInfo.y);
            drawScene();
        } else {
            console.log('Cannot decrease, lightInfo.y is already at minimum');
        }
    });

    document.getElementById('increaseZ').addEventListener('mouseup', function () {
        if (lightInfo.z < 1) {
            lightInfo.z += 0.1;
            console.log('Increased Z: ', lightInfo.z);
            drawScene();
        } else {
            console.log('Cannot increase, lightInfo.z is already at maximum');
        }
    });

    document.getElementById('decreaseZ').addEventListener('mouseup', function () {
        if (lightInfo.z >= 0) {
            lightInfo.z -= 0.1;
            drawScene();
            console.log('Decreased Z: ', lightInfo.z);
        } else {
            console.log('Cannot decrease, lightInfo.z is already at minimum');
        }
    });

    function drawScene() {
        gl.useProgram(program);

        gl.enableVertexAttribArray(aPosition);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(aNormal);
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);

        gl.enableVertexAttribArray(aColor);
        gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
        gl.vertexAttribPointer(aColor, 3, gl.UNSIGNED_BYTE, true, 0, 0);

        gl.uniformMatrix4fv(uPerspective, false, perspective(gl.canvas.clientWidth, gl.canvas.clientHeight));
        gl.uniformMatrix4fv(uCamera, false, invers(setCamera(cameraInfo.position, cameraInfo.target, cameraInfo.up)));
        gl.uniform3fv(uLight, normalize([lightInfo.x, lightInfo.y, lightInfo.z]));

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    }

})

function setGeometry(gl, posBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        50, 50, 50,
        -50, -50, 50,
        50, -50, 50,
        50, 50, 50,
        -50, -50, 50,
        -50, 50, 50,

        50, 50, -50,
        -50, -50, -50,
        50, -50, -50,
        50, 50, -50,
        -50, -50, -50,
        -50, 50, -50,

        50, 50, 50,
        -50, 50, -50,
        -50, 50, 50,
        50, 50, 50,
        -50, 50, -50,
        50, 50, -50,

        50, -50, 50,
        -50, -50, -50,
        -50, -50, 50,
        50, -50, 50,
        -50, -50, -50,
        50, -50, -50,

        50, 50, 50,
        50, -50, -50,
        50, -50, 50,
        50, 50, 50,
        50, -50, -50,
        50, 50, -50,

        -50, 50, 50,
        -50, -50, -50,
        -50, -50, 50,
        -50, 50, 50,
        -50, -50, -50,
        -50, 50, -50,
    ]), gl.STATIC_DRAW)
}

function setColor(gl, colBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
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

function setNormals(gl, normalBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,

        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,
        0, 0, -1,

        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,
        1, 0, 0,

        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
        -1, 0, 0,
    ]), gl.STATIC_DRAW)
}

function setCamera(cameraPosition, target, up) {
    let zAxis = normalize(sub(cameraPosition, target));
    let xAxis = normalize(cross(up, zAxis));
    let yAxis = normalize(cross(zAxis, xAxis));

    xAxis.push(0);
    yAxis.push(0);
    zAxis.push(0);
    cameraPosition.push(1);

    let result = new Array();
    result = result.concat(xAxis);
    result = result.concat(yAxis);
    result = result.concat(zAxis);
    result = result.concat(cameraPosition);
    return result;
}

function normalize(v) {
    let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    if (length == 0) {
        throw new Error("Normalize error");
    }
    let result = new Array();
    result.push(v[0] / length);
    result.push(v[1] / length);
    result.push(v[2] / length);
    return result;
}

function sub(v1, v2) {
    let result = new Array();
    result.push(v1[0] - v2[0]);
    result.push(v1[1] - v2[1]);
    result.push(v1[2] - v2[2]);
    return result;
}

function cross(v1, v2) {
    let result = new Array();
    result.push(v1[1] * v2[2] - v1[2] * v2[1]);
    result.push(v1[2] * v2[0] - v1[0] * v2[2]);
    result.push(v1[0] * v2[1] - v1[1] * v2[0]);
    return result;
}

function degToRad(d) {
    return d * Math.PI / 180;
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

function invers(matrix) {
    let result = new Array();
    let det = matrix[0] * matrix[5] * matrix[10] * matrix[15] + matrix[0] * matrix[6] * matrix[11] * matrix[13] + matrix[0] * matrix[7] * matrix[9] * matrix[14] +
        matrix[1] * matrix[4] * matrix[11] * matrix[14] + matrix[1] * matrix[6] * matrix[8] * matrix[15] + matrix[1] * matrix[7] * matrix[10] * matrix[12] +
        matrix[2] * matrix[4] * matrix[9] * matrix[15] + matrix[2] * matrix[5] * matrix[11] * matrix[12] + matrix[2] * matrix[7] * matrix[8] * matrix[13] +
        matrix[3] * matrix[4] * matrix[10] * matrix[13] + matrix[3] * matrix[5] * matrix[8] * matrix[14] + matrix[3] * matrix[6] * matrix[9] * matrix[12] -
        matrix[0] * matrix[5] * matrix[11] * matrix[14] - matrix[0] * matrix[6] * matrix[9] * matrix[15] - matrix[0] * matrix[7] * matrix[10] * matrix[13] -
        matrix[1] * matrix[4] * matrix[10] * matrix[15] - matrix[1] * matrix[6] * matrix[11] * matrix[12] - matrix[1] * matrix[7] * matrix[8] * matrix[14] -
        matrix[2] * matrix[4] * matrix[11] * matrix[13] - matrix[2] * matrix[5] * matrix[8] * matrix[15] - matrix[2] * matrix[7] * matrix[9] * matrix[12] -
        matrix[3] * matrix[4] * matrix[9] * matrix[14] - matrix[3] * matrix[5] * matrix[10] * matrix[12] - matrix[3] * matrix[6] * matrix[8] * matrix[13];
    if (det == 0) {
        throw new Error("Inverse error");
    }
    result.push((matrix[5] * matrix[10] * matrix[15] + matrix[6] * matrix[11] * matrix[13] + matrix[7] * matrix[9] * matrix[14] - matrix[5] * matrix[11] * matrix[14] - matrix[6] * matrix[9] * matrix[15] - matrix[7] * matrix[10] * matrix[13]) / det);
    result.push((matrix[1] * matrix[11] * matrix[14] + matrix[2] * matrix[9] * matrix[15] + matrix[3] * matrix[10] * matrix[13] - matrix[1] * matrix[10] * matrix[15] - matrix[2] * matrix[11] * matrix[13] - matrix[3] * matrix[9] * matrix[14]) / det);
    result.push((matrix[1] * matrix[6] * matrix[15] + matrix[2] * matrix[7] * matrix[13] + matrix[3] * matrix[5] * matrix[14] - matrix[1] * matrix[7] * matrix[14] - matrix[2] * matrix[5] * matrix[15] - matrix[3] * matrix[6] * matrix[13]) / det);
    result.push((matrix[1] * matrix[7] * matrix[10] + matrix[2] * matrix[5] * matrix[11] + matrix[3] * matrix[6] * matrix[9] - matrix[1] * matrix[6] * matrix[11] - matrix[2] * matrix[7] * matrix[9] - matrix[3] * matrix[5] * matrix[10]) / det);
    result.push((matrix[4] * matrix[11] * matrix[14] + matrix[6] * matrix[8] * matrix[15] + matrix[7] * matrix[10] * matrix[12] - matrix[4] * matrix[10] * matrix[15] - matrix[6] * matrix[11] * matrix[12] - matrix[7] * matrix[8] * matrix[14]) / det);
    result.push((matrix[0] * matrix[10] * matrix[15] + matrix[2] * matrix[11] * matrix[12] + matrix[3] * matrix[8] * matrix[14] - matrix[0] * matrix[11] * matrix[14] - matrix[2] * matrix[8] * matrix[15] - matrix[3] * matrix[10] * matrix[12]) / det);
    result.push((matrix[0] * matrix[7] * matrix[14] + matrix[2] * matrix[4] * matrix[15] + matrix[3] * matrix[6] * matrix[12] - matrix[0] * matrix[6] * matrix[15] - matrix[2] * matrix[7] * matrix[12] - matrix[3] * matrix[4] * matrix[14]) / det);
    result.push((matrix[0] * matrix[6] * matrix[11] + matrix[2] * matrix[7] * matrix[8] + matrix[3] * matrix[4] * matrix[10] - matrix[0] * matrix[7] * matrix[10] - matrix[2] * matrix[4] * matrix[11] - matrix[3] * matrix[6] * matrix[8]) / det);
    result.push((matrix[4] * matrix[9] * matrix[15] + matrix[5] * matrix[11] * matrix[12] + matrix[7] * matrix[8] * matrix[13] - matrix[4] * matrix[11] * matrix[13] - matrix[5] * matrix[8] * matrix[15] - matrix[7] * matrix[9] * matrix[12]) / det);
    result.push((matrix[0] * matrix[11] * matrix[13] + matrix[1] * matrix[8] * matrix[15] + matrix[3] * matrix[9] * matrix[12] - matrix[0] * matrix[9] * matrix[15] - matrix[1] * matrix[11] * matrix[12] - matrix[3] * matrix[8] * matrix[13]) / det);
    result.push((matrix[0] * matrix[5] * matrix[15] + matrix[1] * matrix[7] * matrix[12] + matrix[3] * matrix[4] * matrix[13] - matrix[0] * matrix[7] * matrix[13] - matrix[1] * matrix[4] * matrix[15] - matrix[3] * matrix[5] * matrix[12]) / det);
    result.push((matrix[0] * matrix[7] * matrix[9] + matrix[1] * matrix[4] * matrix[11] + matrix[3] * matrix[5] * matrix[8] - matrix[0] * matrix[5] * matrix[11] - matrix[1] * matrix[7] * matrix[8] - matrix[3] * matrix[4] * matrix[9]) / det);
    result.push((matrix[4] * matrix[10] * matrix[13] + matrix[5] * matrix[8] * matrix[14] + matrix[6] * matrix[9] * matrix[12] - matrix[4] * matrix[9] * matrix[14] - matrix[5] * matrix[10] * matrix[12] - matrix[6] * matrix[8] * matrix[13]) / det);
    result.push((matrix[0] * matrix[9] * matrix[14] + matrix[1] * matrix[10] * matrix[12] + matrix[2] * matrix[8] * matrix[13] - matrix[0] * matrix[10] * matrix[13] - matrix[1] * matrix[8] * matrix[14] - matrix[2] * matrix[9] * matrix[12]) / det);
    result.push((matrix[0] * matrix[6] * matrix[13] + matrix[1] * matrix[4] * matrix[14] + matrix[2] * matrix[5] * matrix[12] - matrix[0] * matrix[5] * matrix[14] - matrix[1] * matrix[6] * matrix[12] - matrix[2] * matrix[4] * matrix[13]) / det);
    result.push((matrix[0] * matrix[5] * matrix[10] + matrix[1] * matrix[6] * matrix[8] + matrix[2] * matrix[4] * matrix[9] - matrix[0] * matrix[6] * matrix[9] - matrix[1] * matrix[4] * matrix[10] - matrix[2] * matrix[5] * matrix[8]) / det);
    return result;
}


