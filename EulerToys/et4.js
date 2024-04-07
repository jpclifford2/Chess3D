/*jshint esversion: 6 */
// @ts-check

/**
 * CS 559 Demos for in-class use
 * 
 * Euler Toy 4: Bad interpolation
 *
 * Students are welcome to experiment with these demonstrations.
 *
 * The code was written to have a quick demo to show in class, it was
 * not designed to be good to read.
 */

import * as T from "../libs/CS559-Three/build/three.module.js";
import { RunCanvas } from "../libs/CS559/runCanvas.js";
import {
  makeCheckbox,
  makeBoxDiv,
  makeFlexDiv,
  makeButton,
  makeHead
} from "../libs/CS559/inputHelpers.js";
import { spinnableObject, degToRad, doEuler, etScene, sliders } from "./et-helpers.js";

let et = etScene("div1");
makeHead("Euler Interpolation Demo", et.div);

// runCanvas = needs to be defined first - then we add the function
let rc = new RunCanvas(et.renderer.domElement, undefined);
rc.setupSlider(0, 1, 0.02);
rc.setValue(0);


// 4 sets of axes
let objLeft = spinnableObject();
let objRight = spinnableObject();
let objCenter = spinnableObject();

// move them to an appropriate place
objLeft.position.x = -3;
objRight.position.x = 3;

// add to the scene (we'll use the top level obj for the rotation)
et.scene.add(objLeft);
et.scene.add(objRight);
et.scene.add(objCenter);

// to keep track of the world
let axWorld = new T.AxesHelper();
et.scene.add(axWorld);

// put the world axes with the ground plane
axWorld.position.y = -2.49;

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
        doEuler(objRight, s2.value, [x2a, y2a, z2a]);

        // this is for the center object - only interpolate if
        // the parameters are the same
        let u = Number(rc.value);
        objCenter.rotation.set(0, 0, 0);
        if (s1.value == s2.value) {
            doEuler(objCenter, s1.value, [
            (1-u) * x1a + u * x2a,
            (1-u) * y1a + u * y2a,
            (1-u) * z1a + u * z2a
            ]);
        }
    }
    et.renderer.render(et.scene, et.camera);
}
rc.drawFunc = draw;

[x1, y1, z1, s1] = sliders("1", divL, draw);
[x2, y2, z2, s2] = sliders("2", divR, draw);

// the "bad interpolation button to the bad interpolation demo"
let badInterp = makeButton("Bad Interp", et.div);
badInterp.onclick = function() {
    x1.set(-180);
    x2.set(180);
    y1.set(-140);
    y2.set(-140);
    z1.set(180);
    z2.set(-180);
};

// draw to get started
draw();