import { Context, Shader, createProgram, Buffer } from "./lib/WebGL.js";

window.addEventListener("load", async () => {
	const canvas = <HTMLCanvasElement> document.getElementById("canvas");

	const [width, height] = [1366, 768];

	canvas.width = width;
	canvas.height = height;

	console.log(`Canvas dimensions: ${width}x${height}`);

	const ctx = canvas.getContext("webgl2");

	if (ctx === null) {
		// TODO: display an error message to the user in some way.
		console.log("WebGL2 is not supported.");
		return;
	}

	console.log(`Version: ${ctx.getParameter(ctx.VERSION)}`);

	const resizeViewport = () => {
		ctx.viewport(0, 0, canvas.width, canvas.height);
	};

	// Initial viewport resize.
	resizeViewport();

	canvas.addEventListener("resize", resizeViewport);

	function loadTextAsync(url: string): Promise<string> {
		return new Promise(
			(resolve, reject) => {
				const req = new XMLHttpRequest();
				req.open("GET", url, true);

				req.onreadystatechange = () => {
					if (req.readyState < 4)
						return;

					if(req.status !== 200) {
						reject(`Failed to load ${url}.`);
					}

					resolve(req.responseText);
				};

				req.send();
			}
		);
	}

	const vertShaderSource = await loadTextAsync("res/shaders/simple.gles.vert");
	const vertShader = new Shader(ctx, ctx.VERTEX_SHADER, vertShaderSource);

	const fragShaderSource = await loadTextAsync("res/shaders/simple.gles.frag");
	const fragShader = new Shader(ctx, ctx.FRAGMENT_SHADER, fragShaderSource);

	const program = createProgram(ctx, [vertShader, fragShader]);

	program.use();

	// TODO: class
	const positionBuffer = new Buffer(ctx);

	positionBuffer.bind(ctx.ARRAY_BUFFER);
	{
		const vertexData = [
			// Lower left
			-0.5, -0.5,
			// Lower right
			0.5, -0.5,
			// Upper left
			-0.5, 0.5,
			// Upper right
			0.5, 0.5,
		];

		ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(vertexData), ctx.STATIC_DRAW);
	}

	const colorBuffer = new Buffer(ctx);

	colorBuffer.bind(ctx.ARRAY_BUFFER);
	{
		const colorData = [
			255, 0, 0,
			0, 255, 0,
			0, 0, 255,
			255, 255, 0,
		];

		ctx.bufferData(ctx.ARRAY_BUFFER, new Uint8Array(colorData), ctx.STATIC_DRAW);
	}

	const indexBuffer = new Buffer(ctx);

	indexBuffer.bind(ctx.ELEMENT_ARRAY_BUFFER);
	{
		const indices = [
			0, 1, 2,
			1, 3, 2
		];

		ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), ctx.STATIC_DRAW);
	}

	// TODO: class
	const vao = ctx.createVertexArray();

	ctx.bindVertexArray(vao);
	{
		indexBuffer.bind(ctx.ELEMENT_ARRAY_BUFFER);

		{
			ctx.enableVertexAttribArray(0);
			const size = 2;
			const type = ctx.FLOAT;
			const stride = 0;
			const offset = 0;

			positionBuffer.bind(ctx.ARRAY_BUFFER);
			ctx.vertexAttribPointer(0, size, type, false, stride, offset);
		}

		{
			ctx.enableVertexAttribArray(1);

			const size = 3;
			const type = ctx.UNSIGNED_BYTE;
			const stride = 0;
			const offset = 0;

			colorBuffer.bind(ctx.ARRAY_BUFFER);
			ctx.vertexAttribPointer(1, size, type, true, stride, offset);
		}
	}


	requestAnimationFrame(() => render(ctx));

	program.dispose();
});

function render(gl: Context) {
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);

	requestAnimationFrame(() => render(gl));
}
