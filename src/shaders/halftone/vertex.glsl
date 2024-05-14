varying vec3 vNormal;
varying vec3 vPosition;

#include <common>
#include <skinning_pars_vertex>

void main() {
    #include <skinbase_vertex>
    #include <begin_vertex>
    #include <beginnormal_vertex>
    #include <defaultnormal_vertex>
    #include <skinning_vertex>
    #include <project_vertex>

    // Position
    // vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    // gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // // Model normal
    // vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

    vec3 modelNormal = normalize(normalMatrix * normal);
    vec4 modelPosition = modelMatrix * vec4(vPosition, 1.0);

    gl_Position = projectionMatrix * mvPosition;

    // Varyings
    vNormal = modelNormal;
    vPosition = modelPosition.xyz;
}