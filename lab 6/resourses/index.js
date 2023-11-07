window.addEventListener("DOMContentLoaded", function () {
    // Get the canvas element
    const canvas = document.querySelector("#glcanvas");
    // Get the WebGL context from the canvas
    const gl = canvas.getContext("webgl");

    // If WebGL context is not available, log an error and return
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        console.log(gl);
        return;
    }

    // If canvas is not available, log an error and return
    if (!canvas) {
        console.log("Document doesn`t exist");
        console.log(canvas);
        return;
    }

    // Set the viewport and clear the buffer
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Vertex shader program
    let vsSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;

    attribute vec3 a_normal;

    uniform mat4 u_perspective;
    uniform mat4 u_camera;

    uniform vec3 u_lightWorldPosition;
    uniform vec3 u_viewWorldPosition;

    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec3 v_normal;

    varying vec4 v_color;

    void main()
    {
        mat4 projectionMatrix = u_perspective * u_camera;
        gl_Position = projectionMatrix * a_position;

        v_normal = a_normal;

        vec3 surfaceWorldPosition = a_position.xyz;
        v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
        v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;

        v_color = a_color;
    }
    `;

    // Fragment shader program
    const fsSource = `
    precision mediump float;

    uniform float u_shininess;

    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec3 v_normal;

    varying vec4 v_color;

    void main()
    {
        vec3 normal = normalize(v_normal);

        vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
        vec3 surfaceToViewDirection = normalize(v_surfaceToView);
        vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

        float light = dot(normal, surfaceToLightDirection);
        float specular = 0.0;
        if (light > 0.0) {
          specular = pow(dot(normal, halfVector), u_shininess);
        }

        gl_FragColor = v_color;
        gl_FragColor.rgb *= light;
        gl_FragColor.rgb += specular;
    }
    `;

    // Initialize a shader program
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

    // Create buffers
    let posBuffer = gl.createBuffer();
    setGeometry(gl, posBuffer);
    let colBuffer = gl.createBuffer();
    setColor(gl, colBuffer);
    let normalBuffer = gl.createBuffer();
    setNormals(gl, normalBuffer);

    // Get the attribute and uniform locations
    let aPosition = gl.getAttribLocation(program, "a_position");
    let aNormal = gl.getAttribLocation(program, "a_normal");
    let aColor = gl.getAttribLocation(program, "a_color");

    let uPerspective = gl.getUniformLocation(program, "u_perspective");
    let uCamera = gl.getUniformLocation(program, "u_camera");
    let uLightWorldPosition = gl.getUniformLocation(program, "u_lightWorldPosition");
    let uViewWorldPosition = gl.getUniformLocation(program, "u_viewWorldPosition");
    let uShininess = gl.getUniformLocation(program, "u_shininess");

    // Set the camera position
    let cameraInfo = {
        position: [250, 100, 100],
        target: [0, 0, 0],
        up: [0, 1, 0],
    };

    // Set the light position
    let lightInfo = {
        position: [100, 90, -80],
        shininess: 2,
    };

    // Draw the scene
    drawScene();

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
        gl.uniform3fv(uLightWorldPosition, lightInfo.position);
        gl.uniform3fv(uViewWorldPosition, cameraInfo.position);
        gl.uniform1f(uShininess, lightInfo.shininess);

        gl.drawArrays(gl.TRIANGLES, 0, 6 * 6);
    }

});

/**
 * Sets the geometry to be drawn
 * @param {Object} gl - WebGL context
 * @param {Object} posBuffer - Buffer for the position
 */
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

/**
 * Sets the color to be drawn
 * @param {Object} gl - WebGL context
 * @param {Object} colBuffer - Buffer for the color
 */
function setColor(gl, colBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(generateRandomColorsArray()), gl.STATIC_DRAW)
}

/**
 * Generates random colors array
 * @returns {Array} - Array of random colors
 */
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

/**
 * Sets the normals to be drawn
 * @param {Object} gl - WebGL context
 * @param {Object} normalBuffer - Buffer for the normals
 */
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

/**
 * Sets the camera
 * @param {Array} cameraPosition - Camera position
 * @param {Array} target - Target position
 * @param {Array} up - Up vector
 * @returns {Array} - Camera matrix
 */
function setCamera(cameraPosition, target, up) {
    let zAxis = normalize(sub(cameraPosition, target));
    let xAxis = normalize(cross(up, zAxis));
    let yAxis = normalize(cross(zAxis, xAxis));

    let cameraPositionCopy = [];
    for (let i in cameraPosition) {
        cameraPositionCopy[i] = cameraPosition[i];
    }

    xAxis.push(0);
    yAxis.push(0);
    zAxis.push(0);
    cameraPositionCopy.push(1);

    let result = new Array();
    result = result.concat(xAxis);
    result = result.concat(yAxis);
    result = result.concat(zAxis);
    result = result.concat(cameraPositionCopy);
    return result;
}

/**
 * Normalizes the vector
 * @param {Array} v - Vector
 * @returns {Array} - Normalized vector
 */
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

/**
 * Subtracts two vectors
 * @param {Array} v1 - Vector 1
 * @param {Array} v2 - Vector 2
 * @returns {Array} - Subtracted vector
 */
function sub(v1, v2) {
    let result = new Array();
    result.push(v1[0] - v2[0]);
    result.push(v1[1] - v2[1]);
    result.push(v1[2] - v2[2]);
    return result;
}

/**
 * Calculates the cross product of two vectors
 * @param {Array} v1 - Vector 1
 * @param {Array} v2 - Vector 2
 * @returns {Array} - Cross product
 */
function cross(v1, v2) {
    let result = new Array();
    result.push(v1[1] * v2[2] - v1[2] * v2[1]);
    result.push(v1[2] * v2[0] - v1[0] * v2[2]);
    result.push(v1[0] * v2[1] - v1[1] * v2[0]);
    return result;
}

/**
 * Converts degrees to radians
 * @param {Number} d - Degrees
 * @returns {Number} - Radians
 */
function degToRad(d) {
    return d * Math.PI / 180;
}

/**
 * Creates a perspective matrix
 * @param {Number} width - Width
 * @param {Number} height - Height
 * @param {Number} near - Near
 * @param {Number} far - Far
 * @param {Number} deg - Degrees
 * @returns {Array} - Perspective matrix
 */
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

/**
 * Calculates the inverse matrix
 * @param {Array} matrix - Matrix
 * @returns {Array} - Inverse matrix
 */
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