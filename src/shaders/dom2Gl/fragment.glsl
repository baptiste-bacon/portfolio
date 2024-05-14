uniform float uTime;
uniform float uProgress;
uniform sampler2D uTexture1;
uniform vec4 uResolution;
uniform vec3 uDepthColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;

void main() {
	vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);
	float mixStrength = (vElevation - uColorOffset) * uColorMultiplier;
	
	vec4 color = mix(vec4(uDepthColor, 1.0), texture2D(uTexture1, newUV), mixStrength );

	color.a = uProgress;
	gl_FragColor = color;
	// gl_FragColor = vec4(vElevation, vElevation, vElevation, 1.0);
}