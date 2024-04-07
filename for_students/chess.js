/*
Jake Clifford
CS559
Chess!
*/

// @ts-check

import * as T from "../libs/CS559-Three/build/three.module.js";
import { OBJLoader } from "../libs/CS559-Three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "../libs/CS559-Three/examples/jsm/controls/OrbitControls.js";

let renderer = new T.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("div1").appendChild(renderer.domElement);

//Setup Camera
let scene = new T.Scene();
let camera = new T.PerspectiveCamera();
camera.position.z = 12;
camera.position.y = 5;
camera.position.x = 15;

//Add Orbital Controls
let controls = new OrbitControls(camera, renderer.domElement);

scene.add(new T.AmbientLight("white", .75));
let point = new T.PointLight("white", 1, 0, 0);
point.position.set(20, 10, 15);
scene.add(point);

//Global Variables
let currentlySelectedMesh = null; // Currently Selected Piece
let currentTurn="white";

// @@Snippet:loader
let loader = new OBJLoader();


//Function to change the turn between white and black
function changeTurn(){
    if (currentTurn=="white"){
        currentTurn="black";
    }
    else{
        currentTurn="white";
    }
}

//Function to get a chess piece object given a mesh.  This is stored in the user configurable variables when the mesh is created.
function getPieceFromMesh(mesh) {
    if (mesh == null){
        return null;
    }
    return mesh.parent.userData.chessPiece;
}

//Chess Board - 8x8 array
const chessBoard = new Array(8).fill(null).map(() => new Array(8).fill(null));

//Adds a chess piece object to the board
function addToBoard(piece) {
    chessBoard[piece.currentPosition.x][piece.currentPosition.z] = piece; //Called when pieces are created
}

//Returns true if the board square has a piece with the same color as the piece passed in.
function spaceHasSameColorPiece(x,z,piece) {
    if ((chessBoard[x][z] != null) && (chessBoard[x][z].color == piece.color)){
        return true;
    }
    else {
        return false;
    }
}

//Returns true if the board square has a piece with the opposite color as the piece passed in.
function spaceHasOpposingColorPiece(x,z,piece) {
    if ((chessBoard[x][z] != null) && (chessBoard[x][z].color != piece.color)){
        return true;
    }
    else {
        return false;
    }
}

//Moves a piece on the board array and returns the piece that was captured if applicable.
//This does NOT update anything visually.
function movePieceOnBoard(oldX, oldZ, newX, newZ) {
    let piece = chessBoard[oldX][oldZ]; //piece to move
    chessBoard[oldX][oldZ] = null;
    let oldPiece = chessBoard[newX][newZ]; //Piece that is getting taken
    chessBoard[newX][newZ] = piece;
    return oldPiece;
}

//Attempts to move the piece. Returns true on success, otherwise false.
function movePiece(mesh,newX,newZ){
    //Get Piece Object
    let piece = getPieceFromMesh(mesh);

    //Check if Move Is Legal
    if (piece.canMove(newX,newZ) == false){
        return false;
    }
    
    //Update board matrix
    let oldPiece = movePieceOnBoard(piece.currentPosition.x,piece.currentPosition.z,newX,newZ);

    //Remove Captured Piece
    if (oldPiece != null){
        scene.remove(oldPiece.object3D);

        const index = chessPieceObjects.indexOf(oldPiece.object3D);
        if (index > -1) {
            chessPieceObjects.splice(index, 1);
        }
    }

    //Move Mesh
    moveMesh(mesh, newX, newZ);

    //Update Piece Object Position
    piece.currentPosition.x = newX;
    piece.currentPosition.z = newZ;

    //Unselect Mesh
    unselect(mesh);

    //Change Turn
    changeTurn();

    return true;
}

//Highlight a selected piece
function select(mesh){
    mesh.material.emissive.set(0xFFC0CB); // pink
    mesh.material.emissiveIntensity = 0.5;
    currentlySelectedMesh = mesh;
}

//Remove highlight from a selected piece
function unselect(mesh){
    mesh.material.emissive.set(0x000000);
    mesh.material.emissiveIntensity = 0.5;
    currentlySelectedMesh = null;
}

//Chess Piece Class
class ChessPiece {
    constructor(color, currentPosition, objectFileLocation) {
        this.color = color;
        this.currentPosition = currentPosition; // (x,z)
        this.objectFileLocation = objectFileLocation;

        // Initialize Three.js object property
        this.object3D = null;

        // Load textures & model
        const textureLoader = new T.TextureLoader();
        this.baseColorTexture = textureLoader.load('./objects/T_BlackandWhite_BaseColor.png');
        this.metallicTexture = textureLoader.load('./objects/T_BlackandWhite_Metallic.png');
        this.roughnessTexture = textureLoader.load('./objects/T_BlackandWhite_Roughness.png');
        
        // Directly assign within the loadModel call
        this.loadModel()
    }

    async loadModel() {
        const loader = new OBJLoader();
        try {
            const object = await loader.loadAsync(this.objectFileLocation);
            object.position.set(this.currentPosition.x, 0, this.currentPosition.z); //Set Position
            object.scale.set(0.15, 0.15, 0.15); //Set Scale
            object.traverse((child) => {
                if (child instanceof T.Mesh) {
                        // Apply textures
                        child.material = new T.MeshStandardMaterial({
                            map: this.baseColorTexture,
                            metalnessMap: this.metallicTexture,
                            roughnessMap: this.roughnessTexture
                        });
                }
            });

            //Define the chess object within the mesh.
            //This makes it possible to easily go from the mesh returned from ray casting to the chess piece object
            object.userData.chessPiece = this;

            // Check if the piece is a black knight and apply rotation
            if (this.color === 'black' && this instanceof Knight) {
                object.rotation.y = Math.PI; // Rotate 180 degrees around the y-axis
            }

            // Store the Three.js object in the class property
            this.object3D = object;

            // Add the object to the scene
            scene.add(object);
            chessPieceObjects.push(object);
            addToBoard(this);
            return object;
        } catch (error) {
            throw error;
        }
    }
}

//Move the mesh object (move the piece visually)
function moveMesh(mesh, newX, newZ) {
    let chessPiece = mesh.parent.userData.chessPiece;
    chessPiece.object3D.position.set(newX, 0, newZ);
}

    class Bishop extends ChessPiece {
        constructor(color, currentPosition) {
            if (color == "black"){
                super(color, currentPosition, './objects/SM_PieceBlackBishop.obj');
            }
            else{
                super(color, currentPosition, './objects/SM_PieceWhiteBishop.obj');
            }
        }
        canMove(x, z) {
            if (spaceHasSameColorPiece(x,z,this)) return false;
            
            //Up Right
            if (x > this.currentPosition.x && z > this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x + i <= 7) && (this.currentPosition.z + i <= 7)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x + i, this.currentPosition.z + i, this)) { //If any space in path has the same color piece, this move is illegal
                        return false;
                    }
                    if (x == this.currentPosition.x + i && z == this.currentPosition.z + i) { //If we reached the end it is a legal move
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x + i, this.currentPosition.z + i, this)) { //If any space other than the destination has the opposing color it is illegal
                        return false;
                    }

                    i++;
                }
                return false;
            }
        
            //Up Left
            if (x < this.currentPosition.x && z > this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x - i >= 0) && (this.currentPosition.z + i <= 7)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x - i, this.currentPosition.z + i, this)) {
                        return false;
                    }
                    if (x == this.currentPosition.x - i && z == this.currentPosition.z + i) {
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x - i, this.currentPosition.z + i, this)) {
                        return false;
                    }
                    i++;
                }
                return false;
            }
        
            //Down Left
            if (x < this.currentPosition.x && z < this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x - i >= 0) && (this.currentPosition.z - i >= 0)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x - i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    if (x == this.currentPosition.x - i && z == this.currentPosition.z - i) {
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x - i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    i++;
                }
                return false;
            }
        
            //Down Right
            if (x > this.currentPosition.x && z < this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x + i <= 7) && (this.currentPosition.z - i >= 0)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x + i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    if (x == this.currentPosition.x + i && z == this.currentPosition.z - i) {
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x + i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    i++;
                }
                return false;
            }
        
            return false;
        }
        
    }

    class Rook extends ChessPiece {
        constructor(color, currentPosition) {
            if (color == "black"){
                super(color, currentPosition, './objects/SM_PieceBlackRook.obj');
            }
            else{
                super(color, currentPosition, './objects/SM_PieceWhiteRook.obj');
            }
        }
        canMove(x,z){
            if (spaceHasSameColorPiece(x,z,this)) return false;

            if (!(this.currentPosition.x == x || this.currentPosition.z == z)){
                return false;
                
            }

            if (x > this.currentPosition.x){
                //X forward
                let i = this.currentPosition.x+1;
                while(i <= 7){
                    if (spaceHasSameColorPiece(i,z,this.color)){
                        return false;
                    }
                    if (i == x){
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(i,z,this.color)){
                        return false;
                    }
                    i++;
                }
            }

            if (x < this.currentPosition.x){
                //X backward
                let i = this.currentPosition.x-1;
                while(i >= 0){
                    if (spaceHasSameColorPiece(i,z,this.color)){
                        return false;
                    }
                    if (i == x){
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(i,z,this.color)){
                        return false;
                    }
                    i--;
                }
            }

            if (z > this.currentPosition.z){
                //Z forward
                let i = this.currentPosition.z+1;
                while(i <= 7){
                    if (spaceHasSameColorPiece(x,i,this.color)){
                        return false;
                    }
                    if (i == z){
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(x,i,this.color)){
                        return false;
                    }
                    i++;
                }
            }

            if (z < this.currentPosition.z){
                //Z backward
                let i = this.currentPosition.z-1;
                while(i >= 0){
                    if (spaceHasSameColorPiece(x,i,this.color)){
                        return false;
                    }
                    if (i == z){
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(x,i,this.color)){
                        return false;
                    }
                    i--;
                }
            }
            
            return false;
        }
    }

    class Knight extends ChessPiece {
        constructor(color, currentPosition) {
            if (color == "black"){
                super(color, currentPosition, './objects/SM_PieceBlackKnight.obj');
            }
            else{
                super(color, currentPosition, './objects/SM_PieceWhiteKnight.obj');
            }
        }
        canMove(x,z){
            if (spaceHasSameColorPiece(x,z,this)) return false;

            //Moves two spaces in one direction and one in the other
            if (((Math.abs(this.currentPosition.x-x) == 2) && (Math.abs(this.currentPosition.z-z) == 1)) || ((Math.abs(this.currentPosition.x-x) == 1) && (Math.abs(this.currentPosition.z-z) == 2))) {
                return true;
            }

            return false;
        }
    }

    class King extends ChessPiece {
        constructor(color, currentPosition) {
            if (color == "black"){
                super(color, currentPosition, './objects/SM_PieceBlackKing.obj');
            }
            else{
                super(color, currentPosition, './objects/SM_PieceWhiteKing.obj');
            }
        }
        canMove(x,z){
            if (spaceHasSameColorPiece(x,z,this)) return false;

            if((Math.abs(this.currentPosition.x-x) <= 1) && (Math.abs(this.currentPosition.z-z) <= 1)){
                return true;
            }

            return false;
        }
    }

    class Queen extends ChessPiece {
        constructor(color, currentPosition) {
            if (color == "black"){
                super(color, currentPosition, './objects/SM_PieceBlackQueen.obj');
            }
            else{
                super(color, currentPosition, './objects/SM_PieceWhiteQueen.obj');
            }
        }

        canMove(x,z){
            if (spaceHasSameColorPiece(x,z,this)) return false;

            //Horizontal/Vertical (Rook Moves)
            if ((this.currentPosition.x == x || this.currentPosition.z == z)){
                if (x > this.currentPosition.x){
                    //X forward
                    let i = this.currentPosition.x+1;
                    while(i <= 7){
                        if (spaceHasSameColorPiece(i,z,this.color)){
                            return false;
                        }
                        if (i == x){
                            return true;
                        }
                        if (spaceHasOpposingColorPiece(i,z,this.color)){
                            return false;
                        }
                        i++;
                    }
                }
    
                if (x < this.currentPosition.x){
                    //X backward
                    let i = this.currentPosition.x-1;
                    while(i >= 0){
                        if (spaceHasSameColorPiece(i,z,this.color)){
                            return false;
                        }
                        if (i == x){
                            return true;
                        }
                        if (spaceHasOpposingColorPiece(i,z,this.color)){
                            return false;
                        }
                        i--;
                    }
                }
    
                if (z > this.currentPosition.z){
                    //Z forward
                    let i = this.currentPosition.z+1;
                    while(i <= 7){
                        if (spaceHasSameColorPiece(x,i,this.color)){
                            return false;
                        }
                        if (i == z){
                            return true;
                        }
                        if (spaceHasOpposingColorPiece(x,i,this.color)){
                            return false;
                        }
                        i++;
                    }
                }
    
                if (z < this.currentPosition.z){
                    //Z backward
                    let i = this.currentPosition.z-1;
                    while(i >= 0){
                        if (spaceHasSameColorPiece(x,i,this.color)){
                            return false;
                        }
                        if (i == z){
                            return true;
                        }
                        if (spaceHasOpposingColorPiece(x,i,this.color)){
                            return false;
                        }
                        i--;
                    }
                }
            }

            //Diagonal (Bishop Moves)
            else{ 
                //Up Right
            if (x > this.currentPosition.x && z > this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x + i <= 7) && (this.currentPosition.z + i <= 7)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x + i, this.currentPosition.z + i, this)) { //If any space in path has the same color piece, this move is illegal
                        return false;
                    }
                    if (x == this.currentPosition.x + i && z == this.currentPosition.z + i) { //If we reached the end it is a legal move
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x + i, this.currentPosition.z + i, this)) { //If any space other than the destination has the opposing color it is illegal
                        return false;
                    }

                    i++;
                }
                return false;
            }
        
            //Up Left
            if (x < this.currentPosition.x && z > this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x - i >= 0) && (this.currentPosition.z + i <= 7)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x - i, this.currentPosition.z + i, this)) {
                        return false;
                    }
                    if (x == this.currentPosition.x - i && z == this.currentPosition.z + i) {
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x - i, this.currentPosition.z + i, this)) {
                        return false;
                    }
                    i++;
                }
                return false;
            }
        
            //Down Left
            if (x < this.currentPosition.x && z < this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x - i >= 0) && (this.currentPosition.z - i >= 0)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x - i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    if (x == this.currentPosition.x - i && z == this.currentPosition.z - i) {
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x - i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    i++;
                }
                return false;
            }
        
            //Down Right
            if (x > this.currentPosition.x && z < this.currentPosition.z) {
                let i = 1;
                while ((this.currentPosition.x + i <= 7) && (this.currentPosition.z - i >= 0)) {
                    if (spaceHasSameColorPiece(this.currentPosition.x + i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    if (x == this.currentPosition.x + i && z == this.currentPosition.z - i) {
                        return true;
                    }
                    if (spaceHasOpposingColorPiece(this.currentPosition.x + i, this.currentPosition.z - i, this)) {
                        return false;
                    }
                    i++;
                }
                return false;
            }
            }

            return false;
        }
    }

    class Pawn extends ChessPiece {
        constructor(color, currentPosition) {
            if (color == "black"){
                super(color, currentPosition, './objects/SM_PieceBlackPawn.obj');
            }
            else{
                super(color, currentPosition, './objects/SM_PieceWhitePawn.obj');
            }
        }

        canMove(x,z){
            if (spaceHasSameColorPiece(x,z,this)) return false;
            
            if (this.color == "white"){
                if ((!spaceHasOpposingColorPiece(x,z,this.color)) && x == this.currentPosition.x && z == this.currentPosition.z + 1){ //Move 1 space
                    return true;
                }
                if ((!spaceHasOpposingColorPiece(x,z-1,this.color)) && (!spaceHasOpposingColorPiece(x,z,this.color)) && x == this.currentPosition.x && z == 3 && this.currentPosition.z == 1 && spaceHasSameColorPiece(x,2,this.color)==false){ //Move 2 spaces
                    return true;
                }
                if (spaceHasOpposingColorPiece(x,z,this.color) && x == this.currentPosition.x + 1 && z == this.currentPosition.z + 1){ //Move Left Diagonal
                    return true;
                }
                if (spaceHasOpposingColorPiece(x,z,this.color) && x == this.currentPosition.x - 1 && z == this.currentPosition.z + 1){ //Move Right Diagonal
                    return true;
                }
            }
            else{ //black
                if ((!spaceHasOpposingColorPiece(x,z,this.color)) && x == this.currentPosition.x && z == this.currentPosition.z - 1){ //Move 1 space
                    return true;
                }
                if ((!spaceHasOpposingColorPiece(x,z+1,this.color)) && (!spaceHasOpposingColorPiece(x,z,this.color)) && x == this.currentPosition.x && z == 4 && this.currentPosition.z == 6 && spaceHasSameColorPiece(x,5,this.color)==false){ //Move 2 spaces
                    return true;
                }
                if (spaceHasOpposingColorPiece(x,z,this.color) && x == this.currentPosition.x + 1 && z == this.currentPosition.z - 1){ //Move Left Diagonal
                    return true;
                }
                if (spaceHasOpposingColorPiece(x,z,this.color) && x == this.currentPosition.x - 1 && z == this.currentPosition.z - 1){ //Move Right Diagonal
                    return true;
                }
            }

            return false;
        }
    }
    
    // Add White Pieces
    const whiteRook1 = new Rook('white', {x: 0, z: 0});
    const whiteKnight1 = new Knight('white', {x: 1, z: 0});
    const whiteBishop1 = new Bishop('white', {x: 2, z: 0});
    const whiteQueen = new Queen('white', {x: 3, z: 0});
    const whiteKing = new King('white', {x: 4, z: 0});
    const whiteBishop2 = new Bishop('white', {x: 5, z: 0});
    const whiteKnight2 = new Knight('white', {x: 6, z: 0});
    const whiteRook2 = new Rook('white', {x: 7, z: 0});
    // White Pawns
    for (let i = 0; i < 8; i++) {
        new Pawn('white', {x: i, z: 1});
    }

    // Add Black Pieces
    const blackRook1 = new Rook('black', {x: 0, z: 7});
    const blackKnight1 = new Knight('black', {x: 1, z: 7});
    const blackBishop1 = new Bishop('black', {x: 2, z: 7});
    const blackQueen = new Queen('black', {x: 3, z: 7});
    const blackKing = new King('black', {x: 4, z: 7});
    const blackBishop2 = new Bishop('black', {x: 5, z: 7});
    const blackKnight2 = new Knight('black', {x: 6, z: 7});
    const blackRook2 = new Rook('black', {x: 7, z: 7});
    // Black Pawns
    for (let i = 0; i < 8; i++) {
        new Pawn('black', {x: i, z: 6});
    }

    let chessPieceObjects = []; // This will be populated with chess piece mesh objects
    let chessSquareObjects = []; // This will be populated with board square mesh objects

    const boardLoader = new OBJLoader();
    const textureLoader = new T.TextureLoader();
    
    // Load the texture for the chess board
    const boardTexture = textureLoader.load('./objects/T_BlackandWhite_BaseColor.png');
    
    // Load board model
    boardLoader.load('./objects/SM_ChessBoard.obj', function(chessBoard) {
        // Apply the texture to each mesh part of the chess board
        chessBoard.traverse((child) => {
            if (child instanceof T.Mesh) {
                child.material = new T.MeshStandardMaterial({map: boardTexture, side: T.DoubleSide});
            }
        });
        
        chessBoard.position.set(-1.4, -.5, -1.4);
        chessBoard.scale.set(0.16, 0.15, 0.16);
        
        scene.add(chessBoard);
    }, undefined, function(error) {
        console.error('An error happened while loading the chess board:', error);
    });

    // Function to create a chessboard squares
    // This is necessary so that the ray casting can tell what coordinate on the board is being clicked
    function createAdjustedChessBoard() {
        const squareSize = 1; // Size of a square
        const squareHeight = 0.4; // Height of a square
        const colors = [0xFFFFFF,0x000000];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                // Create geometry for the square
                const geometry = new T.BoxGeometry(squareSize, squareHeight, squareSize);
                // Create material with alternating colors
                const material = new T.MeshStandardMaterial({color: colors[(row + col) % 2]});
                // Create mesh with geometry and material
                const square = new T.Mesh(geometry, material);
                // Adjust position so the center of the bottom-left square is at (0,0)
                // and it spans to (7,7) for the top-right square
                square.position.set(col, -squareHeight / 2, row); // Y is adjusted to align with the base plane
                
                square.userData.coordinates = { x: col, y: row };
                // Add the square to the scene
                scene.add(square);

                chessSquareObjects.push(square);
            }
        }
    }
    
    // Create and add the chessboard to the scene
    createAdjustedChessBoard();

    const raycaster = new T.Raycaster();
    const pointer = new T.Vector2();

    function performRaycasting() {
        // Update the raycaster to new camera position
        raycaster.setFromCamera(pointer, camera);

        let currentlySelectedPiece = getPieceFromMesh(currentlySelectedMesh);
        
        // Get objects intersecting the ray
        const pieces = raycaster.intersectObjects(chessPieceObjects, true);
        
        if (pieces.length > 0) { //Chess Piece
            // Obtain the first intersected object
            let target = pieces[0].object;

            if (currentlySelectedMesh == null){ //No previous piece was selected
                if (getPieceFromMesh(target).color == currentTurn){ //Selected appropriate piece
                    select(target);
                    return;
                }
                else{
                    return; //selected wrong color
                }
            }
            
            if(currentlySelectedMesh == target){ //picked itself
                unselect(target);
                return;
            }

            else{ //picked another piece
                if (getPieceFromMesh(target).color == getPieceFromMesh(target).currentlySelectedMesh){ //Same Color
                    //Select New Piece
                    unselect(currentlySelectedMesh);
                    select(target);
                    return;
                }
                else{ //Selected enemy piece
                    movePiece(currentlySelectedMesh,getPieceFromMesh(target).currentPosition.x,getPieceFromMesh(target).currentPosition.z);
                }
            }
        }
        else{ //May have intersected a square
            const squares = raycaster.intersectObjects(chessSquareObjects, true);
            if (squares.length > 0) {
                // Obtain the first intersected object
                let target = squares[0].object;
                let x = target.position.x;
                let z = target.position.z;
                
                if (currentlySelectedMesh !== null){ // Reset previously selected piece
                    movePiece(currentlySelectedMesh,x,z)
                }

            }
        }
    }
    
    //Rectangle for turns (Small indicator to let the player know which color is up)
    const rectangleGeometry = new T.BoxGeometry(0.25, 0.01, .5);
    const rectangleMaterial = new T.MeshStandardMaterial({ color: 0xffffff }); // Initial color white
    const rectangle = new T.Mesh(rectangleGeometry, rectangleMaterial);
    rectangle.position.set(8, 0, 3.5);
    scene.add(rectangle);

    function onPointerDown(event) {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;
    
        // Perform raycasting
        performRaycasting();

        if (currentTurn === "white") {
            rectangle.material.color.set(0xffffff); // White for White's turn
        } else {
            rectangle.material.color.set(0x000000); // Black for Black's turn
        }
    }
    
    window.addEventListener('pointerdown', onPointerDown);
    
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    
    animate();
    
    