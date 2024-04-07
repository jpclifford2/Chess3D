/*jshint esversion: 6 */
// @ts-check

/**
 * CS 559 Demos for in-class use
 *
 * Demo 3 - Gimball Lock
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
makeHead("Gimball Lock Demo", et.div);

// 4 sets of axes
let objLeft = spinnableObject();
let objRight = spinnableObject();

// move them to an appropriate place
objLeft.position.x = -2;
objRight.position.x = 2;

// add to the scene (we'll use the top level obj for the rotation)
et.scene.add(objLeft);
et.scene.add(objRight);

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
        if (matchZX.checked) {
            // we can't do the oninput - so remove it, and re-add it
            // we assume they are all the same
            const oninp = z2.oninput;
            z2.oninput=undefined; z2.set(x1.value()); z2.oninput=oninp;
            y2.oninput=undefined; y2.set(y1.value()); y2.oninput=oninp;
            x2.oninput=undefined; x2.set(z1.value()); x2.oninput=oninp;
          }

        let x1a = degToRad(Number(x1.value()));
        let y1a = degToRad(Number(y1.value()));
        let z1a = degToRad(Number(z1.value()));
        doEuler(objLeft, s1.value, [x1a, y1a, z1a]);

        let x2a = degToRad(Number(x2.value()));
        let y2a = degToRad(Number(y2.value()));
        let z2a = degToRad(Number(z2.value()));
        doEuler(objRight, s2.value, [x2a, y2a, z2a]);
    }
    et.renderer.render(et.scene, et.camera);
}

[x1, y1, z1, s1] = sliders("1", divL, draw);
[x2, y2, z2, s2] = sliders("2", divR, draw);

// gimball lock demo
let gb = document.createElement("button");
gb.innerHTML = "Gimbal Lock";
et.div.appendChild(gb);
gb.onclick = function() {
    x1.set(0);
    y1.set(90);
    z1.set(0);
    x2.set(0);
    y2.set(90);
    z2.set(0);
};

let matchZX = makeCheckbox("lock Z2 to X1", et.div);

// draw to get started
draw();