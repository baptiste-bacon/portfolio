uniform float uScale;
uniform float uShift;

varying vec2 vUv;

void main() {
    vec3 pos = position;
    pos.y = pos.y + ((sin(uv.x * 3.1415926535897932384626433832795) * uShift * 0.015) * 0.125);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);

    vUv = uv;
}