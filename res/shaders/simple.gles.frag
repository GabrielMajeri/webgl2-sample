#version 300 es

// TODO: investigate using different precisions.
precision mediump float;

out vec4 fragment_color;

void main() {
	fragment_color = vec4(0.1, 0.4, 0.9, 1);
}
