/*jshint esversion: 6 */
// @ts-check

/**
 * CS 559 Demos for in-class use
 * 
 * ET1: the simplest Euler Toy - just give 1 spinable object
 *
 * Students are welcome to experiment with these demonstrations.
 *
 * The code was written to have a quick demo to show in class, it was
 * not designed to be good to read.
 */

// note that this file doesn't actually use THREE! 
// all the THREE stuff is in et-helpers
import {
  makeCheckbox,
  makeBoxDiv,
  makeFlexDiv,
  makeButton
} from "../libs/CS559/inputHelpers.js";
import { spinnableObject, degToRad, doEuler, etScene, sliders } from "./et-helpers.js";

let et = etScene("div1");

// 4 sets of axes
let objLeft = spinnableObject();

// add to the scene (we'll use the top level obj for the rotation)
et.scene.add(objLeft);

let div = makeFlexDiv(et.div);
let divL = makeBoxDiv({ width: 250, padding: 10 }, div);

// we need to define the control variables - they need to be available to draw
// even though they aren't defined until later (when we have draw)
let x1,y1,z1,s1;

/**
 * this draws the objects - given the current state of the sliders
 */
 function draw() {
    // because this might get called in setup, make sure things are set up
    if (x1) {
        let x1a = degToRad(Number(x1.value()));
        let y1a = degToRad(Number(y1.value()));
        let z1a = degToRad(Number(z1.value()));
        doEuler(objLeft, s1.value, [x1a, y1a, z1a]);

    et.renderer.render(et.scene, et.camera);
    }
}

[x1, y1, z1, s1] = sliders("", divL, draw);

// draw to get started
draw();