#version 300 es

// TODO: investigate using different precisions.
precision mediump float;

in vec3 fragmentColor;

out vec4 color;

void main() {
	color = vec4(fragmentColor, 1);
}
