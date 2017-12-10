# Flow-CS196.github.io
CS 196 Project - Flow

About Flow

  Flow spawned from a project we created for CS 196 at the University of Illinois Urbana-Champaign. Flow creates easy to follow, logical "flow" charts for novice developers. Simply drag and connect different types of boxes to create runnable flowcharts of JavaScript code. Files are saved locally to save a project for later use or editing. 

Different Types of Boxes

START - The start parallelogram signals the first block of a new file and cannot be deleted. When writing a new file, connect your second statement to the start parallelogram. The code inside the start parallelogram will be executed.

SIMPLE - The simple rectangle just runs the code inside it.

CONDITIONAL - The conditional diamond creates a conditional statement. If the condition is correct, the next box the flowchart will flow to is the one connected to the bottom of the conditional diamond. Else, the flowchart will flow to the box connected to the right of the conditional diamond.

INPUT - The input oval allows the user to enter any input that can be evaluated by the eval() function. For example, if an input oval contains k as its code, and you enter the input 7 when the running code reaches the input oval and asks for your input, then the statement eval("k = 7"); will run.

Saving and Loading

  Saving will save a project file with an assigned name locally on your computer. Use the load button to retrieve that file for editing or later use.
  
Scrolling

  The working area is bigger than it initially seems: It is infinite. You can scroll around by dragging the empty space, and create as much space as you need for your project.
  
Deleting

  If you press backspace while dragging a box, you will delete it. If you just want to remove connections you have made between boxes, right-click on the white circles that the connection lines start from or end at.
  
Things You Shouldn't Do

  Do not use the "$" or "this" as a variable.
  Do not declare your variables with "var", "let", or "const", as that would restrict the scope of your variables to the boxes they are declared in.
  
