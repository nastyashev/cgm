window.onload = function () {

    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    let rect = canvas.getBoundingClientRect();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, rect.width, rect.height);

    // vertex shader program
    const vsSource = `
        attribute vec4 a_Position;
        void main()
        {
            gl_Position = a_Position;
            gl_PointSize = 5.0;
        }
    `;

    // fragment shader program
    const fsSource = `
        precision mediump float;
        uniform vec4 a_FragColor;
        void main()
        {
            gl_FragColor = a_FragColor;
        }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vsSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fsSource);
    gl.compileShader(fragmentShader);

    // shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);



    // // Get the storage location of a_Position
    var a_Position = gl.getAttribLocation(program, 'a_Position');

    let a_FragColor = gl.getUniformLocation(program, 'a_FragColor');

    let color = [1.0, 1.0, 1.0, 1.0]
    let pointColor = []

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function (ev) {
        click(ev, gl, canvas, a_Position);
    };


    // buttons
    let btn_clear = document.getElementById("btn_clear");
    let inp_color = document.getElementById("inp_color");

    btn_clear.addEventListener("mouseup", function () {
        gl.clear(gl.COLOR_BUFFER_BIT);
        g_points = [];
        pointColor = [];
    });


    inp_color.addEventListener("input", function () {
        color = []
        var selectedColor = inp_color.value;
        color.push(hexToRgb(selectedColor).r)
        color.push(hexToRgb(selectedColor).g)
        color.push(hexToRgb(selectedColor).b)
        color.push(1)
    });


    var g_points = []; // The array for the position of a mouse press
    function click(ev, gl, canvas, a_Position) {
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - rect.width / 2) / (rect.width / 2);
        y = (rect.height / 2 - (y - rect.top)) / (rect.height / 2);
        // Store the coordinates to g_points array
        g_points.push(x);
        g_points.push(y);

        pointColor.push(color[0])
        pointColor.push(color[1])
        pointColor.push(color[2])
        pointColor.push(color[3])

        // Clear <canvas>
        gl.clear(gl.COLOR_BUFFER_BIT);

        var len = g_points.length;
        for (var i = 0; i < len; i += 2) {
            // Pass the position of a point to a_Position variable
            gl.vertexAttrib3f(a_Position, g_points[i], g_points[i + 1], 0.0);

            gl.uniform4fv(a_FragColor, [pointColor[i * 2], pointColor[i * 2 + 1], pointColor[i * 2 + 2], pointColor[i * 2 + 3]]);

            // Draw
            gl.drawArrays(gl.POINTS, 0, 1);
        }
    }

}


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}





