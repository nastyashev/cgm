window.addEventListener("DOMContentLoaded", function () {
    // Get the canvas element
    const canvas = document.querySelector("#glcanvas");
    // Get the WebGL context from the canvas
    const gl = canvas.getContext("webgl");
    // Get the extension for depth texture
    const ext = gl.getExtension("WEBGL_depth_texture");

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

    // If extension is not available, log an error and return
    if (!ext) {
        console.log("Extension doesn`t exist");
        console.log(ext);
        return;
    }

    // Create program
    const sceneInfo = initScene(gl);
    const shadowInfo = initShadow(gl);

    // Create buffers
    let posBuffer = gl.createBuffer();
    setGeometry(gl, posBuffer);
    let colBuffer = gl.createBuffer();
    setColor(gl, colBuffer);
    let normalBuffer = gl.createBuffer();
    setNormals(gl, normalBuffer);

    // Create texture
    const depthTexture = gl.createTexture();
    const depthTextureSize = 512;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, depthTextureSize, depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create framebuffer
    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    // Set the camera position
    let cameraInfo = {
        position: [-200, 300, 500],
        target: [50, 100, 0],
        up: [0, 1, 0],
    };

    // Set the light position
    let lightInfo = {
        position: [200, 150, 250],
        target: [0, 50, 0],
        up: [0, 1, 0],
        angle: 150,
        shine: 100,
        bias: -0.005,
    };
    
    // Enable depth test
    gl.enable(gl.DEPTH_TEST);
    // Near things obscure far things
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    // Set clear color
    gl.viewport(0, 0, depthTextureSize, depthTextureSize);
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the shadow
    drawScene(
        shadowInfo,
        [
            {
                location: shadowInfo.uniform.uPerspective,
                value: (perspective(1, 1, lightInfo.angle)),
                type: "mat4",
            },
            {
                location: shadowInfo.uniform.uCamera,
                value: invers(setCamera(lightInfo.position, lightInfo.target, lightInfo.up)),
                type: "mat4",
            },
            {
                location: shadowInfo.uniform.uColor,
                value: [1.0, 0.0, 0.0, 1.0],
                type: "vec4",
            },
        ],
        [
            {
                normalize: false,
                location: shadowInfo.atribute.aPosition,
                buffer: posBuffer,
                offset: 0,
                stride: 0,
                size: 3,
                type: gl.FLOAT,
            },
        ],
        {
            mode: gl.TRIANGLES,
            first: 0,
            count: 3 * 2 * 6 + 3 * 2 * 6 + 3 * 2 * 6,
        },
        gl
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the scene
    drawScene(
        sceneInfo,
        [
            {
                location: sceneInfo.uniform.uTextureMatrix,
                value:
                    (multiply(
                        (multiply(
                            (multiply(
                                (translate(0.5, 0.5, 0.5)),
                                (scale(0.5, 0.5, 0.5))
                            )),
                            (perspective(1, 1, lightInfo.angle))
                        )),
                        invers(
                            setCamera(lightInfo.position, lightInfo.target, lightInfo.up)
                        )
                    )),
                type: "mat4",
            },
            {
                location: sceneInfo.uniform.uPerspective,
                value: (perspective(canvas.width, canvas.height)),
                type: "mat4",
            },
            {
                location: sceneInfo.uniform.uCamera,
                value: invers(setCamera(cameraInfo.position, cameraInfo.target, cameraInfo.up)),
                type: "mat4",
            },
            {
                location: sceneInfo.uniform.uLightWorldPosition,
                value: lightInfo.position,
                type: "vec3",
            },
            {
                location: sceneInfo.uniform.uViewWorldPosition,
                value: (setCamera(cameraInfo.position, cameraInfo.target, cameraInfo.up).slice(12, 15)),
                type: "vec3",
            },
            {
                location: sceneInfo.uniform.uLightDirection,
                value: (setCamera(lightInfo.position, lightInfo.target, lightInfo.up).slice(8, 11).map(x => -x)),
                type: "vec3",
            },
            {
                location: sceneInfo.uniform.uInnerLimit,
                value: Math.cos(degToRad(lightInfo.angle / 2 - 20)),
                type: "float",
            },
            {
                location: sceneInfo.uniform.uOuterLimit,
                value: Math.cos(degToRad(lightInfo.angle / 2)),
                type: "float",
            },
            {
                location: sceneInfo.uniform.uShininess,
                value: lightInfo.shine,
                type: "float",
            },
            {
                location: sceneInfo.uniform.uBias,
                value: lightInfo.bias,
                type: "float",
            },
            {
                location: sceneInfo.uniform.uProjectedTexture,
                value: depthTexture,
                type: "sampler2D",
            },
        ],
        [
            {
                normalize: false,
                location: sceneInfo.atribute.aPosition,
                buffer: posBuffer,
                offset: 0,
                stride: 0,
                size: 3,
                type: gl.FLOAT,
            },
            {
                normalize: false,
                location: sceneInfo.atribute.aNormal,
                buffer: normalBuffer,
                offset: 0,
                stride: 0,
                size: 3,
                type: gl.FLOAT,
            },
            {
                normalize: true,
                location: sceneInfo.atribute.aColor,
                buffer: colBuffer,
                offset: 0,
                stride: 0,
                size: 3,
                type: gl.UNSIGNED_BYTE,
            },
        ],
        {
            mode: gl.TRIANGLES,
            first: 0,
            count: 3 * 2 * 6 + 3 * 2 * 6 + 3 * 2 * 6,
        },
        gl
    );

    // set timeout
    this.setTimeout(() => {
        this.location.reload();
    }, 500);
});

/**
 * Draws the scene
 * @param {Object} programInfo - Program info
 * @param {Array} uniformSetter - Uniform setter
 * @param {Array} atributeSetter - Atribute setter
 * @param {Object} drawSeting - Draw seting
 */
function drawScene(programInfo, uniformSetter, atributeSetter, drawSeting, gl) {
    gl.useProgram(programInfo.program);

    for (let i = 0; i < uniformSetter.length; i++) {
        let uniform = uniformSetter[i];
        switch (uniform.type) {
            case "mat4":
                gl.uniformMatrix4fv(uniform.location, false, uniform.value);
                break;
            case "vec3":
                gl.uniform3fv(uniform.location, uniform.value);
                break;
            case "vec4":
                gl.uniform4fv(uniform.location, uniform.value);
                break;
            case "float":
                gl.uniform1f(uniform.location, uniform.value);
                break;
            case "sampler2D":
                gl.uniform1i(uniform.location, uniform.value);
                break;
            default:
                console.log("Uniform type error");
                console.log(uniform);
                break;
        }
    }

    for (let i = 0; i < atributeSetter.length; i++) {
        let atribute = atributeSetter[i];
        gl.bindBuffer(gl.ARRAY_BUFFER, atribute.buffer);
        gl.enableVertexAttribArray(atribute.location);
        gl.vertexAttribPointer(atribute.location, atribute.size, atribute.type, atribute.normalize, atribute.stride, atribute.offset);
    }

    gl.drawArrays(drawSeting.mode, drawSeting.first, drawSeting.count);
}

/**
 * initializes the scene
 * @param {Object} gl - WebGL context
 * @returns {Object} - Program info
*/
function initScene(gl) {
    // Vertex shader program
    let vsSource = `
    attribute vec4 a_position;
    attribute vec4 a_color;

    attribute vec3 a_normal;

    uniform mat4 u_textureMatrix;
    uniform mat4 u_perspective;
    uniform mat4 u_camera;

    uniform vec3 u_lightWorldPosition;
    uniform vec3 u_viewWorldPosition;

    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec3 v_normal;

    varying vec4 v_projectedTexcoord;
    varying vec4 v_color;

    void main()
    {
        mat4 projectionMatrix = u_perspective * u_camera;
        gl_Position = projectionMatrix * a_position;

        v_projectedTexcoord = u_textureMatrix * a_position;

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

    uniform sampler2D u_projectedTexture;

    uniform vec3 u_lightDirection;

    uniform float u_innerLimit;
    uniform float u_outerLimit;
    uniform float u_shininess;
    uniform float u_bias;

    varying vec4 v_projectedTexcoord;
    varying vec4 v_color;

    varying vec3 v_surfaceToLight;
    varying vec3 v_surfaceToView;
    varying vec3 v_normal;

    void main()
    {
        vec3 normal = normalize(v_normal);

        vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
        vec3 surfaceToViewDirection = normalize(v_surfaceToView);
        vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);

        float dotFromDirection = dot(surfaceToLightDirection, -u_lightDirection);
        float limitRange = u_innerLimit - u_outerLimit;
        float inLight = clamp((dotFromDirection - u_outerLimit) / limitRange, 0.1, 1.0);
        float light = inLight * dot(normal, surfaceToLightDirection);
        float specular = inLight * pow(dot(normal, halfVector), u_shininess);

        vec3 projectedTexcoord = v_projectedTexcoord.xyz / v_projectedTexcoord.w;
        float currentDepth = projectedTexcoord.z + u_bias;

        bool inRange =
        projectedTexcoord.x >= 0.0 &&
        projectedTexcoord.x <= 1.0 &&
        projectedTexcoord.y >= 0.0 &&
        projectedTexcoord.y <= 1.0;

        float projectedDepth = texture2D(u_projectedTexture, projectedTexcoord.xy).r;
        float shadowLight = (inRange && projectedDepth <= currentDepth) ? 0.5 : 1.0;

        gl_FragColor = vec4(v_color.rgb * light * shadowLight + specular * shadowLight, v_color.a);
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

    return {
        program: program,
        atribute: {
            aPosition: gl.getAttribLocation(program, "a_position"),
            aNormal: gl.getAttribLocation(program, "a_normal"),
            aColor: gl.getAttribLocation(program, "a_color"),
        },
        uniform: {
            uLightWorldPosition: gl.getUniformLocation(program, "u_lightWorldPosition"),
            uViewWorldPosition: gl.getUniformLocation(program, "u_viewWorldPosition"),
            uProjectedTexture: gl.getUniformLocation(program, "u_projectedTexture"),
            uLightDirection: gl.getUniformLocation(program, "u_lightDirection"),
            uTextureMatrix: gl.getUniformLocation(program, "u_textureMatrix"),
            uPerspective: gl.getUniformLocation(program, "u_perspective"),
            uInnerLimit: gl.getUniformLocation(program, "u_innerLimit"),
            uOuterLimit: gl.getUniformLocation(program, "u_outerLimit"),
            uShininess: gl.getUniformLocation(program, "u_shininess"),
            uCamera: gl.getUniformLocation(program, "u_camera"),
            uBias: gl.getUniformLocation(program, "u_bias"),
        }
    };
}

/**
 * Initializes the shadow
 * @param {Object} gl - WebGL context
 * @returns {Object} - Program info
 */
function initShadow(gl) {
    // Vertex shader program
    let vsSource = `
    attribute vec4 a_position;

    uniform mat4 u_perspective;
    uniform mat4 u_camera;

    void main() {
        mat4 projectionMatrix = u_perspective * u_camera;
        gl_Position = projectionMatrix * a_position;
    }
    `;

    // Fragment shader program
    const fsSource = `
    precision mediump float;

    uniform vec4 u_color;

    void main() {
        gl_FragColor = u_color;
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

    return {
        program: program,
        atribute: {
            aPosition: gl.getAttribLocation(program, "a_position"),
        },
        uniform: {
            uPerspective: gl.getUniformLocation(program, "u_perspective"),
            uCamera: gl.getUniformLocation(program, "u_camera"),
            uColor: gl.getUniformLocation(program, "u_color"),
        }
    };
}

/**
 * Sets the geometry to be drawn
 * @param {Object} gl - WebGL context
 * @param {Object} posBuffer - Buffer for the position
 */
function setGeometry(gl, posBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        // Floor
        1000, 0, 1000,
        -1000, -5, 1000,
        1000, -5, 1000,
        1000, 0, 1000,
        -1000, -5, 1000,
        -1000, 0, 1000,

        1000, 0, -1000,
        -1000, -5, -1000,
        1000, -5, -1000,
        1000, 0, -1000,
        -1000, -5, -1000,
        -1000, 0, -1000,

        1000, 0, 1000,
        -1000, 0, -1000,
        -1000, 0, 1000,
        1000, 0, 1000,
        -1000, 0, -1000,
        1000, 0, -1000,

        1000, -5, 1000,
        -1000, -5, -1000,
        -1000, -5, 1000,
        1000, -5, 1000,
        -1000, -5, -1000,
        1000, -5, -1000,

        1000, 0, 1000,
        1000, -5, -1000,
        1000, -5, 1000,
        1000, 0, 1000,
        1000, -5, -1000,
        1000, 0, -1000,

        -1000, 0, 1000,
        -1000, -5, -1000,
        -1000, -5, 1000,
        -1000, 0, 1000,
        -1000, -5, -1000,
        -1000, 0, -1000,

        // Cube 1
        50, 200, 50,
        -50, 0, 50,
        50, 0, 50,
        50, 200, 50,
        -50, 0, 50,
        -50, 200, 50,

        50, 200, -50,
        -50, 0, -50,
        50, 0, -50,
        50, 200, -50,
        -50, 0, -50,
        -50, 200, -50,

        50, 200, 50,
        -50, 200, -50,
        -50, 200, 50,
        50, 200, 50,
        -50, 200, -50,
        50, 200, -50,

        50, 0, 50,
        -50, 0, -50,
        -50, 0, 50,
        50, 0, 50,
        -50, 0, -50,
        50, 0, -50,

        50, 200, 50,
        50, 0, -50,
        50, 0, 50,
        50, 200, 50,
        50, 0, -50,
        50, 200, -50,

        -50, 200, 50,
        -50, 0, -50,
        -50, 0, 50,
        -50, 200, 50,
        -50, 0, -50,
        -50, 200, -50,

        // Cube 2
        200, 50, 70,
        150, 0, 70,
        200, 0, 70,
        200, 50, 70,
        150, 0, 70,
        150, 50, 70,

        200, 50, 20,
        150, 0, 20,
        200, 0, 20,
        200, 50, 20,
        150, 0, 20,
        150, 50, 20,

        200, 50, 70,
        150, 50, 20,
        150, 50, 70,
        200, 50, 70,
        150, 50, 20,
        200, 50, 20,

        200, 0, 70,
        150, 0, 20,
        150, 0, 70,
        200, 0, 70,
        150, 0, 20,
        200, 0, 20,

        200, 50, 70,
        200, 0, 20,
        200, 0, 70,
        200, 50, 70,
        200, 0, 20,
        200, 50, 20,

        150, 50, 70,
        150, 0, 20,
        150, 0, 70,
        150, 50, 70,
        150, 0, 20,
        150, 50, 20,
    ]), gl.STATIC_DRAW)
}

/**
 * Sets the color to be drawn
 * @param {Object} gl - WebGL context
 * @param {Object} colBuffer - Buffer for the color
 */
function setColor(gl, colBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, colBuffer);
    let arr = [
            // Floor
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,

            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,

            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,

            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,

            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,

            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,
            52, 102, 33,

            // Cube 1
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,

            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,

            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,

            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,

            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,

            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
            202, 111, 161,
    ];
    for (let i = 0; i < 3 * 6 * 6; i++) {
        arr.push(Math.floor(Math.random() * 255));
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(arr), gl.STATIC_DRAW);
}

/**
 * Sets the normals to be drawn
 * @param {Object} gl - WebGL context
 * @param {Object} normalBuffer - Buffer for the normals
 */
function setNormals(gl, normalBuffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        // Нормалі землі
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

        // Нормалі куба 1
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

        // Нормалі куба 2
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

/**
 * Multiplies two matrices
 * @param {Array} a - Matrix 1
 * @param {Array} b - Matrix 2
 * @returns {Array} - Multiplied matrix
*/
function multiply(a, b) {
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
}

/**
 * Translates the matrix
 * @param {Number} tx - X
 * @param {Number} ty - Y
 * @param {Number} tz - Z
 * @returns {Array} - Translated matrix
 */
function translate(tx, ty, tz) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        tx, ty, tz, 1,
    ];
}

/**
 * Scale the matrix
 * @param {Number} sx - X
 * @param {Number} sy - Y
 * @param {Number} sz - Z
 * @returns {Array} - Scaled matrix
*/
function scale(sx, sy, sz) {
    return [
        sx, 0, 0, 0,
        0, sy, 0, 0,
        0, 0, sz, 0,
        0, 0, 0, 1,
    ];
}