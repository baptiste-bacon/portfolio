uniform float uProgress;
uniform float uTime;
uniform vec2 uRes;

varying vec2 vUv;

float mod289(float x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 perm(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

float noise(vec3 p) {
    vec3 a = floor(p);
    vec3 d = p - a;
    d = d * d * (3.0 - 2.0 * d);

    vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
    vec4 k1 = perm(b.xyxy);
    vec4 k2 = perm(k1.xyxy + b.zzww);

    vec4 c = k2 + a.zzzz;
    vec4 k3 = perm(c);
    vec4 k4 = perm(c + 1.0);

    vec4 o1 = fract(k3 * (1.0 / 41.0));
    vec4 o2 = fract(k4 * (1.0 / 41.0));

    vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
    vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

    return o4.y * d.y + o4.x * (1.0 - d.y);
}

void main() {
    vec2 st = gl_FragCoord.xy / uRes.xy;

    // float offx = vUv.x + sin(vUv.y + uTime * .1);
    // float offy = vUv.y - uTime * 0.1 - cos(uTime * .001) * .01;

    float n = noise(vec3(st.x * 4. - uTime * 0.0001, st.y * 4., uTime * 0.0001) * 1.);
    n = smoothstep(n, 1., uProgress);

    float finalMask = smoothstep(0., 0.8, n);

    vec4 image1 = mix(vec4(0, 0, 0, 1), vec4(0.8784313725490196, 0.6, 0.9450980392156862, 1), n);
    vec4 image2 = vec4(0);
    vec4 finalImage = mix(image1, image2, finalMask);

    gl_FragColor = finalImage;

    // gl_FragColor = vec4(0.0, 0.0, 0.0, uProgress);
}