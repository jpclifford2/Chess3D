/*jshint esversion: 6 */
// @ts-check

/**
 * CS 559 Demos for in-class use
 * 
 * ET2: the simple Euler Toy - just give 1 spinable object
 *  but 2 sets of controls
 *
 * Students are welcome to experiment with these demonstrations.
 *
 * The code was written to have a quick demo to show in class, it was
 * not designed to be good to read.
 */

import * as T from "../libs/CS559-Three/build/three.module.js";
import {
  makeHead,
  makeBoxDiv,
  makeFlexDiv
} from "../libs/CS559/inputHelpers.js";
import { spinnableObject, degToRad, doEuler, etScene, sliders } from "./et-helpers.js";

let et = etScene("div1");

// 4 sets of axes
let objLeft = spinnableObject();

// add to the scene (we'll use the top level obj for the rotation)
et.scene.add(objLeft);

makeHead("Euler Angles 1 followed by Euler Angles 2",et.div);

let div = makeFlexDiv(et.div);
let divL = makeBoxDiv({ width: 250, padding: 10 }, div);
let divR = makeBoxDiv({ width: 250, padding: 10 }, div);

// we need to define the control variables - they need to be available to draw
// even though they aren't defined until later (when we have draw)
let x1,y1,z1,s1,x2,y2,z2,s2;

/**
 * this draws the objects - given the current state of the sliders
 */
 function draw() {
    // because this might get called in setup, make sure things are set up
    if (x1 && x2) {
        let x1a = degToRad(Number(x1.value()));
        let y1a = degToRad(Number(y1.value()));
        let z1a = degToRad(Number(z1.value()));
        doEuler(objLeft, s1.value, [x1a, y1a, z1a]);
        let x2a = degToRad(Number(x2.value()));
        let y2a = degToRad(Number(y2.value()));
        let z2a = degToRad(Number(z2.value()));
        doEuler(objLeft, s1.value, [x2a, y2a, z2a], true);

    et.renderer.render(et.scene, et.camera);
    }
}

[x1, y1, z1, s1] = sliders("1", divL, draw);
[x2, y2, z2, s2] = sliders("2", divR, draw);

// draw to get started
draw();