import * as THREE from "three";

import Environment from "./Environment";
import Floor from "./Floor.js";
import Fox from "./Fox.js";
import Tentacle from "./Tentacle.js";

export default class World {
  constructor(experience) {
    // ...

    this.experience = experience;
    this.resources = this.experience.resources;

    // Wait for resources
    this.resources.on("ready", () => {
      // Setup

      // this.floor = new Floor(this.experience);
      // this.fox = new Fox(this.experience);
      this.tentacle = new Tentacle(this.experience);
      this.environment = new Environment(this.experience);
    });
    this.scene = this.experience.scene;

    // Test mesh
    // const testMesh = new THREE.Mesh(
    //   new THREE.BoxGeometry(1, 1, 1),
    //   new THREE.MeshStandardMaterial()
    // );
    // this.scene.add(testMesh);
  }

  update() {
    if (this.tentacle) this.tentacle.update();
  }
}
