uniform float uProgress;
uniform float uTime;
uniform sampler2D uTexture;
uniform vec4 uResolution;

uniform vec3 uDepthColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;
varying float vNoiseAmp;

vec4 c1 = vec4(0.176, 0., 0.216, 1.);

void main() {
	vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);
	vec4 depthColor = vec4(uDepthColor, 1.0);

	float elevation = vElevation;
	float mixStrength = clamp(elevation, 0. * vNoiseAmp, .5 * vNoiseAmp);
	mixStrength = smoothstep(.0 * vNoiseAmp, 1. * vNoiseAmp, mixStrength);

	vec4 image = texture2D(uTexture, newUV);
	vec4 color = mix(image, depthColor, mixStrength);

	color.a = uProgress;
	// color.a = 1.0;

	gl_FragColor = color;
}
