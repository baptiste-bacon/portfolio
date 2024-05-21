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

vec3 cw = vec3(1.0);
vec3 c1 = vec3(0.176, 0., 0.216);
vec3 c2 = vec3(0.306, 0., 0.38);
vec3 c3 = vec3(0.435, 0., 0.541);
vec3 c4 = vec3(0.569, 0., 0.706);
vec3 c5 = vec3(0.698, 0., 0.867);
vec3 c6 = vec3(0.745, 0.149, 0.886);
vec3 c7 = vec3(0.788, 0.302, 0.906);
vec3 c8 = vec3(0.835, 0.451, 0.925);
vec3 c9 = vec3(0.878, 0.6, 0.945);

void main() {
    vec2 st = gl_FragCoord.xy / uRes.xy;

    float offx = st.x + st.y + uTime * .0001;
    float offy = st.y - uTime * .001;

    float n = noise(vec3(offx, offy, uTime * 0.00001) * 4.);
    n = smoothstep(n, 1., uProgress);

    // vec4 image1 = mix(vec4(0.80, 1.00, 0.11, 1), vec4(0.8784313725490196, 0.6, 0.9450980392156862, 1), n);
    vec4 image2 = vec4(0);
    float finalMask = smoothstep(0., 0.8, n);

    vec4 finalImage = mix(vec4(c1, 1.0), vec4(c6, 1.0), n);
    finalImage = mix(finalImage, vec4(cw, 1.0), n);
    
    finalImage = mix(finalImage, image2, finalMask);
    gl_FragColor = finalImage;
}