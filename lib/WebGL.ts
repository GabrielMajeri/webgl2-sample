export type Context = WebGL2RenderingContext;

export abstract class WebGLResource {
	protected readonly ctx: Context;

	constructor(ctx: Context) {
		this.ctx = ctx;
	}

	abstract dispose(): void;
}

export class Shader extends WebGLResource {
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

	dispose() {
		this.ctx.deleteShader(this.shader);
	}
}


export class ShaderProgram extends WebGLResource {
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

			this.dispose();

			throw new Error(`Failed to link shader program: ${log}`);
		}
	}

	use() {
		this.ctx.useProgram(this.program);
	}

	dispose() {
		this.ctx.deleteProgram(this.program);
	}
}

export function createProgram(ctx: Context, shaders: Iterable<Shader>): ShaderProgram {
	const program = new ShaderProgram(ctx);

	for (const shader of shaders) {
		program.attach(shader);
	}

	program.link();

	for (const shader of shaders) {
		shader.dispose();
	}

	return program;
}

export class Buffer extends WebGLResource {
	readonly buffer: WebGLBuffer;

	constructor(ctx: Context) {
		super(ctx);
		this.buffer = ctx.createBuffer();
	}

	/// Binds buffer to a given target.
	bind(target: number) {
		this.ctx.bindBuffer(target, this.buffer);
	}

	/// Unbinds a given target.
	unbind(target: number) {
		this.ctx.bindBuffer(target, null);
	}

	dispose() {
		this.ctx.deleteBuffer(this.buffer);
	}
}
