type Context = WebGL2RenderingContext;

abstract class WebGLResource {
	protected readonly ctx: Context;

	constructor(ctx: Context) {
		this.ctx = ctx;
	}

	abstract destroy(): void;
}

class Shader extends WebGLResource {
	readonly shader: WebGLShader;

	constructor(ctx: Context, type: number, source: string) {
		super(ctx);

		const shader = ctx.createShader(type);

		ctx.shaderSource(shader, source);

		ctx.compileShader(shader);

		const success = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);

		if (!success) {
			const log = ctx.getShaderInfoLog(shader);

			ctx.deleteShader(shader);

			throw Error(`Failed to compile WebGL shader:\n${log}`);
		}

		this.shader = shader;
	}

	destroy() {
		this.ctx.deleteShader(this.shader);
	}
}

class ShaderProgram extends WebGLResource {
	readonly program: WebGLProgram;

	constructor(ctx: Context) {
		super(ctx);

		this.program = ctx.createProgram();
	}

	attach(shader: Shader) {
		this.ctx.attachShader(this.program, shader.shader);
	}

	link() {
		const ctx = this.ctx;

		ctx.linkProgram(this.program);

		const success = ctx.getProgramParameter(this.program, ctx.LINK_STATUS);

		if (!success) {
			const log = ctx.getProgramInfoLog(this.program);

			this.destroy();

			throw new Error(`Failed to link shader program: ${log}`);
		}
	}

	use() {
		this.ctx.useProgram(this.program);
	}

	destroy() {
		this.ctx.deleteProgram(this.program);
	}
}

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


	const program = new ShaderProgram(ctx);

	program.attach(vertShader);
	program.attach(fragShader);

	program.link();

	vertShader.destroy();
	fragShader.destroy();

	program.use();

	// TODO: class
	const buffer = ctx.createBuffer();
	ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);

	const positions = [
		-0.5, -0.5,
		0.5, -0.5,
		-0.5, 0.5,
		0.5, -0.5,
		0.5, 0.5,
		-0.5, 0.5,
	];

	ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(positions), ctx.STATIC_DRAW);

	const vao = ctx.createVertexArray();

	ctx.bindVertexArray(vao);

	ctx.enableVertexAttribArray(0);

	const size = 2;
	const type = ctx.FLOAT;
	const stride = 0;
	const offset = 0;

	ctx.vertexAttribPointer(0, size, type, false, stride, offset);

	requestAnimationFrame(() => render(ctx));

	program.destroy();
});

function render(gl: Context) {
	gl.clearColor(0, 0, 0, 1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.drawArrays(gl.TRIANGLES, 0, 6);

	requestAnimationFrame(() => render(gl));
}
