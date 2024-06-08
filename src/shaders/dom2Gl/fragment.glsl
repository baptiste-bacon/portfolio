uniform float uProgress;

uniform sampler2D uTexture;
uniform vec4 uResolution;

uniform vec3 uDepthColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying vec2 vUv;
varying float vElevation;
varying float vNoiseAmp;

void main() {
	vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);
	float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;

	vec4 image = texture2D(uTexture, newUV);
	vec4 depthColor = vec4(uDepthColor, 1.0);
	// float elevation = vElevation;
	// float finalMask = smoothstep( 1. * vNoiseAmp, 1.25 * vNoiseAmp, elevation);

	vec4 color = mix(image, depthColor, mixStrength);

	color.a = uProgress;
	// color.a = 1.0;

	gl_FragColor = color;
}
