uniform float uTime;
uniform float uProgress;

uniform sampler2D uTexture;
uniform vec4 uResolution;

uniform vec3 uDepthColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;

void main() {
	vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);
	float mixStrength = (vElevation - uColorOffset) * uColorMultiplier;
	
	vec4 color = mix(vec4(uDepthColor, 1.0), texture2D(uTexture, newUV), mixStrength );
	color.a = uProgress;
	// color.a = 1.0;

	gl_FragColor = color;
}