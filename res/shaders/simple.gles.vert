#version 300 es

layout (location = 0) in vec2 position;
layout (location = 1) in vec3 vertexColor;

out vec3 fragmentColor;

void main() {
	gl_Position = vec4(position, 0, 1);
	fragmentColor = vertexColor;
}
