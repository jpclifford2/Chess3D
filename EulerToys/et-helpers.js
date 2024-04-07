/*jshint esversion: 6 */
// @ts-check

/* helper functions for the Euler Toys Demos 
 *
 * warning: this is not meant to be easy code to read!
 */

import * as T from "../libs/CS559-Three/build/three.module.js";
// it's better if we don't have camera controls
// import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";
import {
    makeSelect,
    LabelSlider
  } from "../libs/CS559/inputHelpers.js";

// the object that we spin
export function spinnableObject() {
    let group = new T.Group();
    let frame = new T.AxesHelper(1);
    group.add(frame);
  
    let cube = new T.BoxGeometry(0.5, 0.5, 0.5);
    let c0 = new T.Mesh(cube, new T.MeshStandardMaterial({ color: "white" }));
    group.add(c0);
    let cx = new T.Mesh(cube, new T.MeshStandardMaterial({ color: "red" }));
    cx.position.x = 1;
    group.add(cx);
    let cy = new T.Mesh(cube, new T.MeshStandardMaterial({ color: "green" }));
    cy.position.y = 1;
    group.add(cy);
    let cz = new T.Mesh(cube, new T.MeshStandardMaterial({ color: "blue" }));
    cz.position.z = 1;
    group.add(cz);
  
    return group;
  }
  
// always useful utility
export  function degToRad(degrees) {
    return (degrees * Math.PI) / 180;
}

/**
 * Apply euler angles to an object - in a given order
 * 
 * @param {T.Object3D} obj 
 * @param {string} order 
 * @param {Array<Number>} angles 
 * @param {boolean} [noReset]
 */
export function doEuler(obj, order, angles, noReset) {
    if (!noReset) {
        obj.rotation.set(0, 0, 0);
    }
    for (let i = 0; i < 3; i++) {
        if (order[i] == "X") obj.rotateX(angles[i]);
        else if (order[i] == "Y") obj.rotateY(angles[i]);
        else if (order[i] == "Z") obj.rotateZ(angles[i]);
        else throw `Unknown Rotation axis ${i} of ${order}`;
    }
}

/**
 * 
 * @param {string} divname 
 * @returns
 */
export function etScene(divname) {
    let toyDiv = document.getElementById(divname);

    let renderer = new T.WebGLRenderer();
    renderer.setSize(600, 400);
    toyDiv.appendChild(renderer.domElement);

    let scene = new T.Scene();
    let camera = new T.PerspectiveCamera(
      18,
      renderer.domElement.width / renderer.domElement.height,
      1,
      1000
    );
  
    camera.position.z = 20;
    camera.position.y = 10;
    camera.position.x = 0;
    camera.lookAt(0, 0, 0);
  
    // since we're animating, add OrbitControls
    // these confuse things, and break the demos - so remove them
    // let controls = new OrbitControls(camera, renderer.domElement);
  
    scene.add(new T.AmbientLight("white", 0.2));
    let pointLight = new T.PointLight("white", 1, 0, 0);
    pointLight.position.set(20, 10, 15);
    scene.add(pointLight);
  
    let dirLight = new T.DirectionalLight("white", 1);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);
  
    // make a ground plane
    let groundBox = new T.BoxGeometry(12, 0.1, 12);
    let groundMesh = new T.Mesh(
      groundBox,
      new T.MeshStandardMaterial({ color: 0x888888 })
    );
    // put the top of the box at the ground level (0)
    groundMesh.position.y = -3;
    scene.add(groundMesh);
  
    // to keep track of the world
    let axWorld = new T.AxesHelper();
    scene.add(axWorld);

    // put the world axes with the ground plane
    axWorld.position.y = -2.49;

    return {
        scene: scene,
        renderer: renderer,
        div: toyDiv,
        camera: camera
    };
}


/**
 * Make a set of sliders for the euler angles - also includes the order selector
 *
 * @param {String} str
 * @param {HTMLElement} el
 * @param {any} draw
 * @returns {Array}
 */
 export function sliders(str, el, draw) {
    // make sliders
    let x1 = new LabelSlider("X" + str, { width: 200, min: -180, max: 180, step: 10, oninput: draw} );
    el.appendChild(x1.div);

    let y1 = new LabelSlider("Y" + str, { width: 200, min: -180, max: 180, step: 10, oninput: draw });
    el.appendChild(y1.div);

    let z1 = new LabelSlider("Z" + str, { width: 200, min: -180, max: 180, step: 10, oninput: draw });
    el.appendChild(z1.div);

    let button = document.createElement("button");
    button.innerHTML = "Zero";
    el.appendChild(button);
    button.onclick = function() {
        x1.set(0);
        y1.set(0);
        z1.set(0);
        draw();
    };

    /* If the selector changes, make sure to change the slider names */
    let selector = makeSelect(["XYZ", "ZYX", "ZYZ", "ZXY", "ZXZ"], el);
    selector.onchange = function() {
        x1.label.innerText = selector.value[0] + str;
        y1.label.innerText = selector.value[1] + str;
        z1.label.innerText = selector.value[2] + str;    
        draw();
    };

    return [x1, y1, z1, selector];
}

export function slidersAx(str, el, draw) {
    // make sliders
    let x1 = new LabelSlider("X" + str, { width: 200, min: -1, max: 1, oninput: draw} );
    el.appendChild(x1.div);

    let y1 = new LabelSlider("Y" + str, { width: 200, min: -1, max: 1, oninput: draw });
    el.appendChild(y1.div);

    let z1 = new LabelSlider("Z" + str, { width: 200, min: -1, max: 1, oninput: draw });
    el.appendChild(z1.div);

    let t1 = new LabelSlider("theta" + str, { width: 200, min: -180, max: 180, step: 10, oninput: draw });
    el.appendChild(t1.div);

    let button = document.createElement("button");
    button.innerHTML = "Zero";
    el.appendChild(button);
    function zero() {
        x1.set(0);
        y1.set(0);
        z1.set(1);
        t1.set(0);
        draw();
    };
    button.onclick = zero;
    zero();

    return [x1, y1, z1, t1];
}
