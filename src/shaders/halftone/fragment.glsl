#include ../includes/ambientLight.glsl
#include ../includes/directionalLight.glsl

uniform vec3 uColor;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec3 vPosition;

uniform float uShadowRepetitions;
uniform vec3 uShadowColor;

uniform float uLightRepetitions;
uniform vec3 uLightColor;

vec3 halftone(
    vec3 color,
    float repetitions,
    vec3 direction,
    float low,
    float high,
    vec3 pointColor,
    vec3 normal
) {
    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv *= repetitions;
    uv = mod(uv, 1.0);

    // float point = distance(uv, vec2(0.5));
    // point = 1.0 - step(0.5 * intensity, point);
    
    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(intensity, point);

    // color = mix(color, pointColor, point);
    color = mix(color, pointColor, point);

    return mix(color, pointColor, point);
}

void main() {
    vec3 viewDirection = normalize(vPosition - cameraPosition);
    vec3 normal = normalize(vNormal);
    vec3 color = uColor;
    vec3 light = vec3(0.0);

    light += ambientLight(vec3(1.0), // Light color
    1.0        // Light intensity,
    );

    light += directionalLight(vec3(1.0, 1.0, 1.0), // Light color
    1.0,                 // Light intensity
    normal,              // Normal
    vec3(1.0, 1.0, 0.0), // Light position
    viewDirection,       // View direction
    1.0                  // Specular power
    );
    color *= light;

    float repetitions = 50.0;
    vec3 direction = vec3(0.0, -1.0, 0.0);
    float low = -0.8;
    float high = 1.5;
    vec3 pointColor = vec3(1.0, 0.0, 0.0);

    float intensity = dot(normal, direction);
    intensity = smoothstep(low, high, intensity);

    vec2 uv = gl_FragCoord.xy / uResolution.y;
    uv *= repetitions;
    uv = mod(uv, 1.0);

    float point = distance(uv, vec2(0.5));
    point = 1.0 - step(0.5 * intensity, point);
    // color = mix(color, pointColor, point);

    // Halftone
    color = halftone(color,                 // Input color
    uShadowRepetitions,    // Repetitions,                  // Repetitions
    vec3(0.0, -1.0, 0.0), // Direction
    -0.8,                 // Low
    1.5,                   // High
    uShadowColor,   // Point color
    normal                 // Normal
    );
    color = halftone(color,               // Input color
    uLightRepetitions,   // Repetitions
    vec3(1.0, 1.0, 0.0), // Direction
    0.5,                 // Low
    1.5,                 // High
    uLightColor,         // Point color
    normal               // Normal
    );

    // Final color
    gl_FragColor = vec4(color, 1.0);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}