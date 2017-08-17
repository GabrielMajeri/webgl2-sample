#version 300 es

// TODO: investigate using different precisions.
precision mediump float;

in vec2 texCoords;

uniform sampler2D colorMap;

out vec4 color;

void main() {
	color = texture(colorMap, texCoords);
}
