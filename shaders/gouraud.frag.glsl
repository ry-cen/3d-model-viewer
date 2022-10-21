#version 300 es
precision mediump float;

// Passed in from the vertex shader
in vec3 v_color;
in highp vec2 v_texture_coord;

uniform sampler2D u_texture_map;

// Final color
out vec4 out_color;

void main() {
    out_color = vec4(texture(u_texture_map, v_texture_coord).xyz * v_color, 1.0);
}
