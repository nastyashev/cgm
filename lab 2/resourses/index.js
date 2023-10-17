window.addEventListener("DOMContentLoaded", function () {

    const canvas = document.querySelector("#glcanvas");
    const gl = canvas.getContext("webgl");

    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        console.log(gl);
        return;
    }

    if (!canvas) {
        console.log("Не існує документа");
        console.log(canvas);
        return;
    }

    let rect = canvas.getBoundingClientRect();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, rect.width, rect.height);

    // vertex shader program
    const vsSource = `
        attribute vec2 a_position;
        attribute vec3 a_color;
        varying vec3 v_color;

        void main()
        {
            gl_Position = vec4(a_position, 0.0, 1.0);
            gl_PointSize = 5.0;
            v_color = a_color;
        }
    `;

    // fragment shader program
    const fsSource = `
        precision mediump float;
        varying vec3 v_color;

        void main()
        {
            gl_FragColor = vec4(v_color, 1.0);
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

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    let a_Position = gl.getAttribLocation(program, "a_position");
    let a_Color = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(a_Position);
    gl.enableVertexAttribArray(a_Color);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 20, 0);
    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, 20, 8);


    let color = [0.0, 0.0, 0.0, 1.0];
    let mode_btn = "point";
    let points_arr = [];
    let triangles_arr = [];
    let tempTriangle = [];
    let circles_arr = [];
    let radius_centre = false;
    let x_radius;
    let y_radius;
    const numSegments = 100;

    // buttons
    let btn_clear = document.getElementById("btn_clear");
    let inp_color = document.getElementById("inp_color");
    let btn_point = document.getElementById("btn_point");
    let btn_triangle = document.getElementById("btn_triangle");
    let btn_circle = document.getElementById("btn_circle");


    btn_point.addEventListener("mouseup", function () {
        mode_btn = "point";
        btn_triangle.removeAttribute("disabled");
        btn_circle.removeAttribute("disabled");
        btn_point.setAttribute("disabled", "disabled");
        gl.clear(gl.COLOR_BUFFER_BIT);
        points_arr = [];
        triangles_arr = [];
        circles_arr = [];
        tempTriangle = [];
        radius_centre = false;
    });

    btn_clear.addEventListener("mouseup", function () {
        gl.clear(gl.COLOR_BUFFER_BIT);
        points_arr = [];
        triangles_arr = [];
        circles_arr = [];
        tempTriangle = [];
        radius_centre = false;
    });

    inp_color.addEventListener("input", function () {
        color = []
        var selectedColor = inp_color.value;
        color.push(hexToRgb(selectedColor).r);
        color.push(hexToRgb(selectedColor).g);
        color.push(hexToRgb(selectedColor).b);
        color.push(1);
    });

    btn_triangle.addEventListener("mouseup", function () {
        mode_btn = "triangle";
        btn_point.removeAttribute("disabled");
        btn_circle.removeAttribute("disabled");
        btn_triangle.setAttribute("disabled", "disabled");
        gl.clear(gl.COLOR_BUFFER_BIT);
        points_arr = [];
        triangles_arr = [];
        circles_arr = [];
        tempTriangle = [];
        radius_centre = false;
    });

    btn_circle.addEventListener("mouseup", function () {
        mode_btn = "circle";
        btn_point.removeAttribute("disabled");
        btn_triangle.removeAttribute("disabled");
        btn_circle.setAttribute("disabled", "disabled");
        gl.clear(gl.COLOR_BUFFER_BIT);
        points_arr = [];
        triangles_arr = [];
        circles_arr = [];
        tempTriangle = [];
        radius_centre = false;
    });


    canvas.addEventListener("mousedown", function (e) {
        let x = e.clientX;
        let y = e.clientY;

        let x_width = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        let y_width = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

        if (mode_btn == "point") {
            gl.clear(gl.COLOR_BUFFER_BIT);
            points_arr.push(x_width, y_width, color[0], color[1], color[2]);

            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points_arr), gl.STATIC_DRAW);
            gl.drawArrays(gl.POINTS, 0, points_arr.length / 5);

            return;
        }

        if (mode_btn == "triangle") {
            tempTriangle.push(x_width, y_width, color[0], color[1], color[2]);

            if (tempTriangle.length >= 15) {
                for (let i = 0; i < tempTriangle.length; i++) {
                    triangles_arr.push(tempTriangle[i]);
                }
                tempTriangle = []
            }

            if (tempTriangle.length > 0) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tempTriangle), gl.STATIC_DRAW);
                gl.drawArrays(gl.POINTS, 0, tempTriangle.length / 5);
            }

            if (triangles_arr.length > 0) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles_arr), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLES, 0, triangles_arr.length / 5);
            }

            return;
        }

        if (mode_btn == "circle") {
            radius_centre = !radius_centre;

            if (radius_centre) {
                x_radius = x_width;
                y_radius = y_width;

                for (let i = 0; i < circles_arr.length; i++) {
                    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circles_arr[i]), gl.STATIC_DRAW);
                    gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 1);
                }

                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x_radius, y_radius, color[0], color[1], color[2]]), gl.STATIC_DRAW);
                gl.drawArrays(gl.POINTS, 0, 1);
            }

            let radius = Math.sqrt(Math.pow(x_radius - x_width, 2) + Math.pow(y_radius - y_width, 2));
            let vertices = [];

            for (let i = 0; i <= numSegments; i++) {
                let theta = (i / numSegments) * 2 * Math.PI;
                let x = radius * Math.cos(theta) + x_radius;
                let y = radius * Math.sin(theta) + y_radius;

                vertices.push(x, y, color[0], color[1], color[2]);
            }

            circles_arr.push(vertices);

            for (let i = 0; i < circles_arr.length; i++) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circles_arr[i]), gl.STATIC_DRAW);
                gl.drawArrays(gl.TRIANGLE_FAN, 0, numSegments + 1);
            }

            return;
        }

        else {
            console.log("ERROR: Unknown drawing type")
        }
    });
});


function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}
