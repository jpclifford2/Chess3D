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

import * as T from "../libs/CS559-Three/build/three.module.js";
import {
  makeCheckbox,
  makeBoxDiv,
  makeFlexDiv,
  makeButton
} from "../libs/CS559/inputHelpers.js";
import { spinnableObject, degToRad, doEuler, etScene, sliders, slidersAx } from "./et-helpers.js";
import { GrObject, paramObjFromParam } from "../libs/CS559-Framework/GrObject.js";
import { GrGroup } from "../libs/CS559-Framework/SimpleObjects.js";
import { AutoUI } from "../libs/CS559-Framework/AutoUI.js";
import { GrWorld } from "../libs/CS559-Framework/GrWorld.js";


let et = etScene("div1");

// 4 sets of axes
let objLeft = spinnableObject();
objLeft.position.x -= 2;
// add to the scene (we'll use the top level obj for the rotation)
et.scene.add(objLeft);


// the right object
let objRight = spinnableObject();
objRight.position.x +=2;
et.scene.add(objRight);


// the axis of rotation 
let axis = new T.CylinderGeometry(.1,.1,4);
let axisObj = new T.Mesh(axis,new T.MeshBasicMaterial({color:"yellow"}));
axisObj.rotation.x = Math.PI/2;     // point along Z
// put it in a group so we can orient the Z in the right way
let axisOG = new T.Group();
axisOG.add(axisObj);

et.scene.add(axisOG);
axisOG.position.x += 2;

// the controls
let div = makeFlexDiv(et.div);
let divL = makeBoxDiv({ width: 250, padding: 10 }, div);
let divR = makeBoxDiv({ width: 250, padding: 10 }, div);


// we need to define the control variables - they need to be available to draw
// even though they aren't defined until later (when we have draw)
let x1,y1,z1,s1;
let x2,y2,z2,t2;

/**
 * this draws the objects - given the current state of the sliders
 */
let myvec = new T.Vector3();
 function draw() {
    // because this might get called in setup, make sure things are set up
    if (x1 && x2) {
        let x1a = degToRad(Number(x1.value()));
        let y1a = degToRad(Number(y1.value()));
        let z1a = degToRad(Number(z1.value()));
        doEuler(objLeft, s1.value, [x1a, y1a, z1a]);
    
        let x2a = Number(x2.value());
        let y2a = Number(y2.value());
        let z2a = Number(z2.value());
        let t2a = degToRad(Number(t2.value()));

        myvec.set(x2a,y2a,z2a);
        myvec.normalize();
        objRight.setRotationFromAxisAngle(myvec,t2a);

        axisOG.lookAt(2+myvec.x,myvec.y,myvec.z);

        et.renderer.render(et.scene, et.camera);
    }
}

[x1, y1, z1, s1] = sliders("1", divL, draw);
[x2, y2, z2, t2] = slidersAx("2", divR, draw);

// draw to get started
draw();