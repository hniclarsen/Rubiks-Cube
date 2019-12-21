AUTHOR:    Heather N. Larsen
CLASS:     CS464 M/W 16:30-17:45 MST Fall 2019
PROJECT:   FINAL PROJECT

USER CONTROLS
  The entire Rubik's Cube can be rotated by depressing either the left or right mouse
  buttons and dragging across the screen.
  
  To manipulate the individual cubes on the Rubik's Cube, the user can choose between
  9 possible rotation paths, either left or right, by clicking on any of the 18 provided
  buttons below the canvas viewing the Rubik's Cube.

PROJECT REFLECTION
  Through this Final Project, I was able to exercise the culmination of skills I learned
  though taking the CS464 course. To demonstrate these skills, I have created an object
  consisting of 27 individually rendered cubes with buffer data pertaining to the vertices,
  position, color, texture, and normals of each cube. Together, these 27 cubes model a
  3x3x3 Rubik's Cube.
  
  In addition to modeling the Rubik's Cube, I have passed colors for each vertex through
  a buffer to the vertex shader as an attribute. These colors determine the color of each
  face of the cube, and I also use the information from the texture coordinates of the
  face of the cube to calculate the color of each fragment, drawing the face color in the
  center of the cube and surrounding it with a black border and adding directional lighting.
  In addition, I was able to simulate depth/different materials by adjusting the values
  used to calculate the specular highlights on the cube for each color.
  
  The project demonstrates user interaction and transformations by allowing the user to click 
  and drag the cube to analyze each side of the cube, and 18 buttons dedicated towards rotating 
  the individual sections of the cube.

FILE HIERARCHY
--
 \Rubiks Cube
    \libs (imports)
    --\glMatrix_util.js
    --\webgl-utils.js
    \scripts (JS files)
    --\cube.js (buffer information for cube object)
    --\interaction.js
    --\main.js
    \index.html (HTML page to view the Rubik's Cube/shader files)
    \rcube.css (styling for the rotation buttons)
    \README.txt (you are here)