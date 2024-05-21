uniform sampler2D uTexture;
uniform vec4 uResolution;

uniform float uShift;
uniform float uScale;
uniform vec3 uColor;
uniform float uOpacity;

varying vec2 vUv;

void main() {
    // float angle = 1.55;
    vec2 newUV = (vUv - vec2(0.5)) * uResolution.zw + vec2(0.5);

    // vec2 p = (vUv - vec2(0.5, 0.5)) * (1.0 - uScale) + vec2(0.5, 0.5);
    // vec2 offset = shift / 4.0 * vec2(cos(angle), sin(angle));
    // vec4 cr = texture2D(uTexture, p + offset);
    // vec4 cga = texture2D(uTexture, p);
    // vec4 cb = texture2D(uTexture, p - offset);

    vec3 texture = texture2D(uTexture, newUV).rgb;
    gl_FragColor = vec4(texture, 1.);
}