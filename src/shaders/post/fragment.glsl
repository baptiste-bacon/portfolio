uniform float uTime;
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform int uType;

	// #define HASHSCALE3 vec3(.1031, .1030, .0973)
vec2 hash2d(vec2 p) {
	vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
	p3 += dot(p3, p3.yzx + 19.19);
	return fract((p3.xx + p3.yz) * p3.zy);
}

void main() {
	vec2 newUV = vUv;
	vec4 color = vec4(1., 0., 0., 1.);

	if(uType == 0) {
		color = texture2D(tDiffuse, vUv);
	}

	gl_FragColor = color;
}