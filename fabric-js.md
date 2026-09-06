# Fabric.js Complete Course: Basic to Advanced

This course teaches Fabric.js like you are building a real design editor, whiteboard, poster maker, image editor, or diagram tool.

Fabric.js is a JavaScript library built on top of the HTML5 Canvas API. Native canvas is pixel-based: you draw pixels, and the canvas does not remember the rectangle, image, or text you drew. Fabric.js adds an object model. A rectangle becomes a real object. You can move it, rotate it, scale it, serialize it, export it, select it, group it, clone it, style it, and edit it.

This guide uses modern Fabric.js style:

```ts
import { Canvas, Rect, Circle, FabricText } from 'fabric';
```

Do not start new projects with old v5 style like this:

```ts
import { fabric } from 'fabric';
```

As of May 18, 2026, the latest Fabric.js release shown on GitHub is `7.3.1`. Fabric v6 was a large TypeScript rewrite and Fabric v7 changed the default object origin to `center`. That origin change is important and appears many times in this tutorial.

Official references:

- Fabric.js docs: https://fabricjs.com/docs
- Installation: https://fabricjs.com/docs/getting-started/installing/
- Core concepts: https://fabricjs.com/docs/core-concepts/
- Events: https://fabricjs.com/docs/events/
- Custom properties: https://fabricjs.com/docs/using-custom-properties/
- Object caching: https://fabricjs.com/docs/fabric-object-caching/
- Transformations: https://fabricjs.com/docs/transformations/
- v6 upgrade guide: https://fabricjs.com/docs/upgrading/upgrading-to-fabric-60/
- v7 upgrade guide: https://fabricjs.com/docs/upgrading/upgrading-to-fabric-70/
- GitHub releases: https://github.com/fabricjs/fabric.js/releases

---

## Table of Contents

1. What Fabric.js Is
2. Required JavaScript Knowledge
3. Setup
4. Your First Fabric App
5. Canvas Types: `StaticCanvas` vs `Canvas`
6. Object Mental Model
7. Coordinates, Origins, Size, Scale, and Rotation
8. Basic Shapes
9. Object Styling
10. Rendering and Canvas Lifecycle
11. Selection and Interactions
12. Events
13. Object Controls and Locking
14. Layers and Stacking
15. Grouping and Active Selection
16. Text: `FabricText`, `IText`, and `Textbox`
17. Images
18. Image Filters
19. Free Drawing and Brushes
20. Gradients, Shadows, and Patterns
21. Clip Paths and Masks
22. Serialization: Save and Load JSON
23. Custom Properties
24. Export: PNG, JPEG, SVG
25. SVG Import
26. Clipboard: Copy, Paste, Clone
27. Undo and Redo
28. Keyboard Shortcuts
29. Zoom and Pan
30. Snapping and Alignment Guides
31. Custom Controls
32. Custom Classes and Subclassing
33. Transformations and Matrix Math
34. Performance and Caching
35. TypeScript Patterns
36. React Integration
37. Security and Safe Loading
38. Common Mistakes
39. Beginner Projects
40. Intermediate Projects
41. Advanced Capstone Project
42. Master Checklist

---

## 1. What Fabric.js Is

Fabric.js is an object-based canvas framework.

With native canvas:

```js
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = 'red';
ctx.fillRect(50, 50, 100, 80);
```

The rectangle is not an object. The canvas only has pixels. If you want to move it later, you must clear and redraw everything yourself.

With Fabric.js:

```ts
const rect = new Rect({
  left: 50,
  top: 50,
  width: 100,
  height: 80,
  fill: 'red',
});

canvas.add(rect);
```

The rectangle is an object. Fabric stores it, renders it, detects mouse hits, shows controls, serializes it, and lets the user transform it.

Fabric.js is useful for:

- Graphic design editors
- Whiteboards
- Poster/banner makers
- Product customization tools
- Diagram builders
- Annotation tools
- Meme editors
- Image editors
- PDF/image markup tools
- Canvas-based UI builders

Fabric.js is not the best choice for:

- Heavy 3D graphics
- WebGL games
- Pixel-perfect low-level painting apps
- Huge CAD-like scenes without careful optimization
- Pure DOM interfaces

---

## 2. Required JavaScript Knowledge

Before Fabric.js, know these JavaScript topics:

- Variables: `const`, `let`
- Functions and arrow functions
- Objects and arrays
- Classes, at least basic usage
- Promises and `async/await`
- DOM basics
- Events
- Modules and imports
- TypeScript basics are helpful but not required

Example of the kind of JavaScript you should understand:

```ts
type Tool = 'select' | 'rectangle' | 'text' | 'draw';

let currentTool: Tool = 'select';

function setTool(tool: Tool) {
  currentTool = tool;
}

async function loadSomething() {
  const result = await fetch('/data.json');
  return result.json();
}
```

If this feels new, learn JavaScript fundamentals in parallel.

---

## 3. Setup

Use Vite with TypeScript. It gives a clean modern environment.

```bash
npm create vite@latest fabric-course -- --template vanilla-ts
cd fabric-course
npm install
npm install fabric
npm run dev
```

Your `index.html` can contain:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Fabric.js Course</title>
  </head>
  <body>
    <div id="toolbar">
      <button id="addRect">Rectangle</button>
      <button id="addCircle">Circle</button>
      <button id="delete">Delete</button>
    </div>

    <canvas id="canvas" width="900" height="600"></canvas>

    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

Add simple CSS:

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #e5e7eb;
}

#toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: white;
  border-bottom: 1px solid #d1d5db;
}

button {
  padding: 8px 12px;
}

canvas {
  display: block;
  margin: 24px auto;
  background: white;
  border: 1px solid #cbd5e1;
}
```

---

## 4. Your First Fabric App

Create `src/main.ts`:

```ts
import { Canvas, Rect, Circle, FabricText } from 'fabric';
import './style.css';

const canvas = new Canvas('canvas', {
  backgroundColor: '#ffffff',
});

const rect = new Rect({
  left: 100,
  top: 100,
  originX: 'left',
  originY: 'top',
  width: 180,
  height: 110,
  fill: '#3b82f6',
  stroke: '#1e40af',
  strokeWidth: 4,
  rx: 8,
  ry: 8,
});

const circle = new Circle({
  left: 380,
  top: 135,
  originX: 'left',
  originY: 'top',
  radius: 55,
  fill: '#f97316',
});

const text = new FabricText('Hello Fabric.js', {
  left: 100,
  top: 270,
  originX: 'left',
  originY: 'top',
  fontSize: 36,
  fill: '#111827',
});

canvas.add(rect, circle, text);
canvas.setActiveObject(rect);
canvas.requestRenderAll();
```

What this does:

- `new Canvas('canvas')` connects Fabric to the `<canvas id="canvas">`.
- `new Rect(...)` creates a rectangle object.
- `canvas.add(...)` adds objects to the scene.
- `canvas.setActiveObject(rect)` selects the rectangle.
- `canvas.requestRenderAll()` asks Fabric to redraw.

You can now drag, scale, and rotate objects.

---

## 5. Canvas Types: `StaticCanvas` vs `Canvas`

Fabric has two main canvas classes.

Use `StaticCanvas` when you only need rendering and exporting:

```ts
import { StaticCanvas, FabricText } from 'fabric';

const canvas = new StaticCanvas('canvas');
canvas.add(new FabricText('Non-interactive export canvas'));
```

Use `Canvas` when the user should interact with objects:

```ts
import { Canvas, Rect } from 'fabric';

const canvas = new Canvas('canvas');
canvas.add(new Rect({ width: 100, height: 100, fill: 'red' }));
```

`Canvas` supports:

- Selection
- Dragging
- Scaling
- Rotation
- Mouse events
- Keyboard-driven editing when you wire it
- Drawing mode
- Control handles

`StaticCanvas` supports:

- Adding objects
- Rendering
- Serialization
- Exporting
- Backgrounds
- Viewport transforms

Rule: build editors with `Canvas`; build server/export/preview canvases with `StaticCanvas`.

---

## 6. Object Mental Model

Almost everything visible in Fabric is a `FabricObject`.

Examples:

- `Rect`
- `Circle`
- `Ellipse`
- `Triangle`
- `Line`
- `Polyline`
- `Polygon`
- `Path`
- `FabricText`
- `IText`
- `Textbox`
- `FabricImage`
- `Group`

Every object has properties:

```ts
const rect = new Rect({
  left: 100,
  top: 100,
  width: 200,
  height: 120,
  fill: 'red',
  stroke: 'black',
  strokeWidth: 2,
  angle: 15,
  opacity: 0.8,
});
```

You can change properties later:

```ts
rect.set({
  fill: '#22c55e',
  angle: 45,
});

rect.setCoords();
canvas.requestRenderAll();
```

Important: when changing position, size, scale, or angle programmatically, call `setCoords()` if the object must immediately have accurate selection borders and hit testing.

```ts
rect.set({ left: 300, top: 200 });
rect.setCoords();
canvas.requestRenderAll();
```

---

## 7. Coordinates, Origins, Size, Scale, and Rotation

This is one of the most important Fabric.js topics.

### Canvas Coordinates

Canvas coordinates start at the top-left:

```text
(0, 0) -----------------> x
  |
  |
  v
  y
```

So:

```ts
left: 100,
top: 50,
```

means the object is placed 100 pixels from the left and 50 pixels from the top, depending on the object's origin.

### Origin

Origin means: which part of the object does `left` and `top` describe?

Common origins:

- `originX: 'left'`
- `originX: 'center'`
- `originX: 'right'`
- `originY: 'top'`
- `originY: 'center'`
- `originY: 'bottom'`

Beginner-friendly placement:

```ts
const rect = new Rect({
  left: 100,
  top: 100,
  originX: 'left',
  originY: 'top',
  width: 200,
  height: 100,
  fill: 'red',
});
```

Modern Fabric v7 defaults to center origins. That means this:

```ts
const rect = new Rect({
  left: 0,
  top: 0,
  width: 100,
  height: 100,
  fill: 'red',
});
```

places the center of the object at `(0, 0)`, so most of the object is outside the visible canvas.

For learning, explicitly set:

```ts
originX: 'left',
originY: 'top',
```

For advanced editors, center origin can make rotation, alignment, and transform math cleaner.

### Width/Height vs Scale

`width` and `height` are the object's natural size.

`scaleX` and `scaleY` multiply that size.

```ts
const rect = new Rect({
  width: 100,
  height: 50,
  scaleX: 2,
  scaleY: 3,
});
```

Rendered size:

- Width: `100 * 2 = 200`
- Height: `50 * 3 = 150`

To get actual rendered dimensions:

```ts
const width = rect.getScaledWidth();
const height = rect.getScaledHeight();
```

### Rotation

Rotation uses degrees:

```ts
rect.rotate(45);
canvas.requestRenderAll();
```

Or:

```ts
rect.set({ angle: 45 });
rect.setCoords();
canvas.requestRenderAll();
```

### Skew

Skew slants an object:

```ts
rect.set({
  skewX: 20,
  skewY: 0,
});

rect.setCoords();
canvas.requestRenderAll();
```

Skew is useful for perspective-like effects, italic-style transformations, and advanced design tools.

---

## 8. Basic Shapes

### Rectangle

```ts
import { Rect } from 'fabric';

const rect = new Rect({
  left: 50,
  top: 50,
  originX: 'left',
  originY: 'top',
  width: 200,
  height: 120,
  fill: '#60a5fa',
});

canvas.add(rect);
```

Rounded rectangle:

```ts
const rounded = new Rect({
  left: 80,
  top: 80,
  originX: 'left',
  originY: 'top',
  width: 200,
  height: 100,
  rx: 16,
  ry: 16,
  fill: '#22c55e',
});
```

### Circle

```ts
import { Circle } from 'fabric';

const circle = new Circle({
  left: 300,
  top: 80,
  originX: 'left',
  originY: 'top',
  radius: 60,
  fill: '#f97316',
});

canvas.add(circle);
```

### Ellipse

```ts
import { Ellipse } from 'fabric';

const ellipse = new Ellipse({
  left: 100,
  top: 220,
  originX: 'left',
  originY: 'top',
  rx: 100,
  ry: 50,
  fill: '#a855f7',
});

canvas.add(ellipse);
```

### Triangle

```ts
import { Triangle } from 'fabric';

const triangle = new Triangle({
  left: 350,
  top: 240,
  originX: 'left',
  originY: 'top',
  width: 120,
  height: 100,
  fill: '#ef4444',
});

canvas.add(triangle);
```

### Line

```ts
import { Line } from 'fabric';

const line = new Line([50, 450, 350, 450], {
  stroke: '#111827',
  strokeWidth: 6,
});

canvas.add(line);
```

The array means:

```ts
[x1, y1, x2, y2]
```

### Polyline

A polyline is an open connected set of points:

```ts
import { Polyline } from 'fabric';

const polyline = new Polyline(
  [
    { x: 50, y: 50 },
    { x: 150, y: 20 },
    { x: 250, y: 80 },
    { x: 350, y: 30 },
  ],
  {
    left: 100,
    top: 100,
    originX: 'left',
    originY: 'top',
    fill: '',
    stroke: '#2563eb',
    strokeWidth: 4,
  },
);

canvas.add(polyline);
```

### Polygon

A polygon is a closed shape:

```ts
import { Polygon } from 'fabric';

const polygon = new Polygon(
  [
    { x: 0, y: 80 },
    { x: 80, y: 0 },
    { x: 160, y: 80 },
    { x: 120, y: 160 },
    { x: 40, y: 160 },
  ],
  {
    left: 520,
    top: 80,
    originX: 'left',
    originY: 'top',
    fill: '#14b8a6',
    stroke: '#0f766e',
    strokeWidth: 3,
  },
);

canvas.add(polygon);
```

### Path

Path uses SVG path syntax:

```ts
import { Path } from 'fabric';

const path = new Path('M 0 0 L 120 0 L 60 100 z', {
  left: 500,
  top: 300,
  originX: 'left',
  originY: 'top',
  fill: '#facc15',
  stroke: '#854d0e',
  strokeWidth: 3,
});

canvas.add(path);
```

Path is powerful for icons, custom vector shapes, and imported SVG-like graphics.

---

## 9. Object Styling

Common style properties:

```ts
const rect = new Rect({
  width: 200,
  height: 120,
  fill: '#3b82f6',
  stroke: '#1e3a8a',
  strokeWidth: 4,
  opacity: 0.9,
  angle: 10,
});
```

### Fill

```ts
rect.set({ fill: 'red' });
canvas.requestRenderAll();
```

You can use:

- Named colors: `'red'`
- Hex: `'#ff0000'`
- RGB: `'rgb(255, 0, 0)'`
- RGBA: `'rgba(255, 0, 0, 0.5)'`
- Gradients
- Patterns

### Stroke

```ts
rect.set({
  stroke: '#111827',
  strokeWidth: 8,
});
```

### Dashed Stroke

```ts
rect.set({
  strokeDashArray: [10, 5],
});
```

### Opacity

```ts
rect.set({ opacity: 0.5 });
```

### Shadow

```ts
import { Shadow } from 'fabric';

rect.set({
  shadow: new Shadow({
    color: 'rgba(0,0,0,0.35)',
    blur: 16,
    offsetX: 6,
    offsetY: 8,
  }),
});
```

### Stroke Uniform

By default, stroke scales with the object. If you want stroke width to visually stay consistent while the object scales:

```ts
rect.set({
  strokeUniform: true,
});
```

This is useful in editors, diagrams, and icon tools.

---

## 10. Rendering and Canvas Lifecycle

Fabric does not always redraw instantly after every property change. You usually call:

```ts
canvas.requestRenderAll();
```

Use `requestRenderAll()` for normal apps. It schedules a render efficiently.

Use `renderAll()` when you need immediate rendering:

```ts
canvas.renderAll();
```

### Add and Remove

```ts
canvas.add(rect);
canvas.remove(rect);
canvas.requestRenderAll();
```

### Clear Canvas

```ts
canvas.clear();
canvas.backgroundColor = '#ffffff';
canvas.requestRenderAll();
```

### Dispose Canvas

In single-page apps, clean up when the component/page is destroyed:

```ts
canvas.dispose();
```

This removes listeners and releases internal resources.

---

## 11. Selection and Interactions

Get the current selected object:

```ts
const active = canvas.getActiveObject();
```

Get all selected objects:

```ts
const selected = canvas.getActiveObjects();
```

Select an object:

```ts
canvas.setActiveObject(rect);
canvas.requestRenderAll();
```

Clear selection:

```ts
canvas.discardActiveObject();
canvas.requestRenderAll();
```

Delete selected:

```ts
function deleteSelected() {
  const selected = canvas.getActiveObjects();

  selected.forEach((object) => {
    canvas.remove(object);
  });

  canvas.discardActiveObject();
  canvas.requestRenderAll();
}
```

Disable selection for an object:

```ts
rect.set({
  selectable: false,
  evented: false,
});
```

Difference:

- `selectable: false` means the object cannot be selected.
- `evented: false` means the object does not receive pointer events.

Disable canvas selection box:

```ts
canvas.selection = false;
```

This stops drag-to-select rectangle behavior.

---

## 12. Events

Fabric objects and canvases inherit event methods:

- `on`
- `off`
- `once`
- `fire`

Basic event:

```ts
const dispose = canvas.on('selection:created', (event) => {
  console.log('Selected:', event.selected);
});

// Later:
dispose();
```

The disposer returned by `on` is the safest way to remove one listener.

Avoid this:

```ts
canvas.off('mouse:down');
```

It removes every listener for that event and can break internal behavior or other code.

### Common Canvas Events

```ts
canvas.on('mouse:down', (event) => {
  console.log(event.scenePoint);
});

canvas.on('mouse:move', (event) => {
  console.log(event.scenePoint);
});

canvas.on('mouse:up', () => {
  console.log('pointer released');
});

canvas.on('selection:created', () => {
  console.log('selection created');
});

canvas.on('selection:updated', () => {
  console.log('selection changed');
});

canvas.on('selection:cleared', () => {
  console.log('selection cleared');
});

canvas.on('object:modified', (event) => {
  console.log('object changed', event.target);
});
```

### Object Events

```ts
rect.on('mousedown', () => {
  console.log('rect clicked');
});

rect.on('moving', () => {
  console.log('rect is moving');
});

rect.on('modified', () => {
  console.log('rect transform finished');
});
```

### When to Use Events

Use events when user interaction happens inside Fabric and your app needs to respond.

Good uses:

- Update toolbar when selection changes.
- Save history after object modification.
- Show object position while dragging.
- Trigger UI when text editing starts.

Avoid using events as your main app architecture when you already control the action.

Instead of this:

```ts
canvas.on('object:added', (event) => {
  canvas.centerObject(event.target!);
});
```

Prefer this:

```ts
function addCentered(object: FabricObject) {
  canvas.add(object);
  canvas.centerObject(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
}
```

Clear functions are easier to reason about than event chains.

---

## 13. Object Controls and Locking

Controls are the handles around selected objects.

Common control styling:

```ts
rect.set({
  cornerSize: 14,
  touchCornerSize: 28,
  cornerColor: '#2563eb',
  cornerStrokeColor: '#ffffff',
  transparentCorners: false,
  borderColor: '#2563eb',
  borderScaleFactor: 2,
  padding: 4,
});
```

Hide controls:

```ts
rect.set({ hasControls: false });
```

Hide selection border:

```ts
rect.set({ hasBorders: false });
```

Lock movement:

```ts
rect.set({
  lockMovementX: true,
  lockMovementY: true,
});
```

Lock scaling:

```ts
rect.set({
  lockScalingX: true,
  lockScalingY: true,
});
```

Lock rotation:

```ts
rect.set({
  lockRotation: true,
});
```

Prevent flipping while scaling:

```ts
rect.set({
  lockScalingFlip: true,
});
```

Hide specific controls:

```ts
rect.setControlsVisibility({
  mt: false,
  mb: false,
  ml: false,
  mr: false,
});
```

Common control names:

- `tl`: top-left
- `tr`: top-right
- `bl`: bottom-left
- `br`: bottom-right
- `mt`: middle-top
- `mb`: middle-bottom
- `ml`: middle-left
- `mr`: middle-right
- `mtr`: rotation handle

---

## 14. Layers and Stacking

Objects are rendered in array order. Later objects appear on top.

```ts
canvas.add(background);
canvas.add(photo);
canvas.add(text);
```

Here, `text` appears above `photo`, and `photo` appears above `background`.

Bring forward:

```ts
const active = canvas.getActiveObject();
if (active) {
  canvas.bringObjectForward(active);
  canvas.requestRenderAll();
}
```

Bring to front:

```ts
if (active) {
  canvas.bringObjectToFront(active);
  canvas.requestRenderAll();
}
```

Send backward:

```ts
if (active) {
  canvas.sendObjectBackwards(active);
  canvas.requestRenderAll();
}
```

Send to back:

```ts
if (active) {
  canvas.sendObjectToBack(active);
  canvas.requestRenderAll();
}
```

Move to a specific index:

```ts
canvas.moveObjectTo(rect, 0);
canvas.requestRenderAll();
```

Get objects:

```ts
const objects = canvas.getObjects();
console.log(objects);
```

Build a layers panel from `canvas.getObjects().toReversed()` so the visual top layer appears at the top of the UI.

---

## 15. Grouping and Active Selection

`ActiveSelection` is a temporary multi-selection.

`Group` is a real object that contains child objects.

Group selected objects:

```ts
function groupSelected() {
  const active = canvas.getActiveObject();

  if (!active || active.type !== 'activeselection') {
    return;
  }

  active.toGroup();
  canvas.requestRenderAll();
}
```

Ungroup:

```ts
function ungroupSelected() {
  const active = canvas.getActiveObject();

  if (!active || active.type !== 'group') {
    return;
  }

  active.toActiveSelection();
  canvas.requestRenderAll();
}
```

Create a group manually:

```ts
import { Group, Rect, Circle } from 'fabric';

const rect = new Rect({
  width: 100,
  height: 80,
  fill: '#3b82f6',
  originX: 'center',
  originY: 'center',
});

const circle = new Circle({
  radius: 40,
  fill: '#f97316',
  left: 130,
  originX: 'center',
  originY: 'center',
});

const group = new Group([rect, circle], {
  left: 250,
  top: 180,
});

canvas.add(group);
```

Important group concepts:

- Children live in the group's coordinate plane.
- A group's `left` and `top` position the group, not each child directly in canvas space.
- Transforming a group affects its children.
- Serialization stores group children inside the group.

---

## 16. Text: `FabricText`, `IText`, and `Textbox`

Fabric has multiple text classes.

### `FabricText`

Use for static text:

```ts
import { FabricText } from 'fabric';

const title = new FabricText('Poster Title', {
  left: 100,
  top: 80,
  originX: 'left',
  originY: 'top',
  fontSize: 48,
  fontFamily: 'Arial',
  fontWeight: 'bold',
  fill: '#111827',
});

canvas.add(title);
```

### `IText`

Use for editable text. User can click/double-click and edit:

```ts
import { IText } from 'fabric';

const editable = new IText('Edit me', {
  left: 100,
  top: 160,
  originX: 'left',
  originY: 'top',
  fontSize: 36,
  fill: '#2563eb',
});

canvas.add(editable);
```

### `Textbox`

Use for paragraph-like text with wrapping:

```ts
import { Textbox } from 'fabric';

const paragraph = new Textbox('This text wraps inside a fixed width.', {
  left: 100,
  top: 240,
  originX: 'left',
  originY: 'top',
  width: 300,
  fontSize: 24,
  fill: '#374151',
});

canvas.add(paragraph);
```

### Text Styling

```ts
textbox.set({
  fontFamily: 'Georgia',
  fontSize: 28,
  fontWeight: 'bold',
  fontStyle: 'italic',
  underline: true,
  linethrough: false,
  overline: false,
  textAlign: 'center',
  lineHeight: 1.3,
  charSpacing: 80,
});

canvas.requestRenderAll();
```

`charSpacing` is measured in thousandths of font size. `80` means small extra spacing.

### Editing Toolbar Example

```ts
function updateSelectedTextFontSize(size: number) {
  const active = canvas.getActiveObject();

  if (active instanceof FabricText || active instanceof IText || active instanceof Textbox) {
    active.set({ fontSize: size });
    active.setCoords();
    canvas.requestRenderAll();
  }
}
```

---

## 17. Images

Images are represented by `FabricImage`.

Load from URL:

```ts
import { FabricImage } from 'fabric';

async function addImage(url: string) {
  const image = await FabricImage.fromURL(url, {
    crossOrigin: 'anonymous',
  });

  image.set({
    left: 100,
    top: 100,
    originX: 'left',
    originY: 'top',
  });

  image.scaleToWidth(300);
  canvas.add(image);
  canvas.setActiveObject(image);
  canvas.requestRenderAll();
}
```

### CORS Warning

If you load images from another domain and then export the canvas, the browser can block export because the canvas is "tainted".

Use:

```ts
crossOrigin: 'anonymous'
```

But the remote server must also allow CORS. If it does not, you need to proxy the image through your backend or use user-uploaded files.

### Load User File

HTML:

```html
<input id="imageInput" type="file" accept="image/*" />
```

TypeScript:

```ts
const input = document.querySelector<HTMLInputElement>('#imageInput')!;

input.addEventListener('change', async () => {
  const file = input.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const image = await FabricImage.fromURL(url);

  image.set({
    left: 100,
    top: 100,
    originX: 'left',
    originY: 'top',
  });

  image.scaleToWidth(400);
  canvas.add(image);
  canvas.setActiveObject(image);
  canvas.requestRenderAll();

  URL.revokeObjectURL(url);
});
```

### Crop Image

```ts
image.set({
  cropX: 50,
  cropY: 30,
  width: 300,
  height: 200,
});

image.setCoords();
canvas.requestRenderAll();
```

Cropping changes which part of the source image is drawn.

---

## 18. Image Filters

Fabric includes filters such as:

- `Grayscale`
- `Sepia`
- `Invert`
- `Brightness`
- `Contrast`
- `Saturation`
- `Vibrance`
- `Blur`
- `Pixelate`
- `Noise`
- `HueRotation`
- `BlendColor`

Example:

```ts
import { FabricImage, filters } from 'fabric';

async function addFilteredImage(url: string) {
  const image = await FabricImage.fromURL(url, {
    crossOrigin: 'anonymous',
  });

  image.filters = [
    new filters.Grayscale(),
    new filters.Contrast({ contrast: 0.2 }),
    new filters.Brightness({ brightness: 0.1 }),
  ];

  image.applyFilters();

  image.set({
    left: 100,
    top: 100,
    originX: 'left',
    originY: 'top',
  });

  image.scaleToWidth(400);
  canvas.add(image);
  canvas.requestRenderAll();
}
```

Update filter from slider:

```ts
function setSelectedImageBrightness(value: number) {
  const active = canvas.getActiveObject();

  if (!(active instanceof FabricImage)) {
    return;
  }

  active.filters = [
    new filters.Brightness({ brightness: value }),
  ];

  active.applyFilters();
  canvas.requestRenderAll();
}
```

Filter value ranges vary. Common examples:

- Brightness: roughly `-1` to `1`
- Contrast: roughly `-1` to `1`
- Saturation: roughly `-1` to `1`
- Blur: small positive values

For production, make a filter state object and rebuild the filter stack from UI values.

---

## 19. Free Drawing and Brushes

Enable drawing mode:

```ts
import { PencilBrush } from 'fabric';

canvas.isDrawingMode = true;
canvas.freeDrawingBrush = new PencilBrush(canvas);
canvas.freeDrawingBrush.color = '#2563eb';
canvas.freeDrawingBrush.width = 8;
```

Disable drawing mode:

```ts
canvas.isDrawingMode = false;
```

Change brush:

```ts
function setBrush(color: string, width: number) {
  if (!canvas.freeDrawingBrush) {
    canvas.freeDrawingBrush = new PencilBrush(canvas);
  }

  canvas.freeDrawingBrush.color = color;
  canvas.freeDrawingBrush.width = width;
}
```

Listen for created path:

```ts
canvas.on('path:created', (event) => {
  console.log('drawn path', event.path);
});
```

Other brushes include:

- `PencilBrush`
- `CircleBrush`
- `SprayBrush`
- `PatternBrush`

Free drawing creates `Path` objects. That means drawn strokes can be selected, moved, deleted, styled, and serialized.

---

## 20. Gradients, Shadows, and Patterns

### Linear Gradient

```ts
import { Gradient, Rect } from 'fabric';

const gradient = new Gradient({
  type: 'linear',
  coords: {
    x1: 0,
    y1: 0,
    x2: 200,
    y2: 0,
  },
  colorStops: [
    { offset: 0, color: '#3b82f6' },
    { offset: 1, color: '#ec4899' },
  ],
});

const rect = new Rect({
  left: 100,
  top: 100,
  originX: 'left',
  originY: 'top',
  width: 200,
  height: 120,
  fill: gradient,
});

canvas.add(rect);
```

### Radial Gradient

```ts
const radial = new Gradient({
  type: 'radial',
  coords: {
    x1: 100,
    y1: 60,
    r1: 0,
    x2: 100,
    y2: 60,
    r2: 100,
  },
  colorStops: [
    { offset: 0, color: '#ffffff' },
    { offset: 1, color: '#2563eb' },
  ],
});
```

### Shadow

```ts
import { Shadow } from 'fabric';

rect.set({
  shadow: new Shadow({
    color: 'rgba(0, 0, 0, 0.3)',
    blur: 18,
    offsetX: 8,
    offsetY: 10,
  }),
});
```

### Pattern

Patterns use images or canvas elements as repeated fills.

```ts
import { Pattern } from 'fabric';

const patternCanvas = document.createElement('canvas');
patternCanvas.width = 20;
patternCanvas.height = 20;

const ctx = patternCanvas.getContext('2d')!;
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 20, 20);
ctx.fillStyle = '#3b82f6';
ctx.fillRect(0, 0, 10, 10);
ctx.fillRect(10, 10, 10, 10);

rect.set({
  fill: new Pattern({
    source: patternCanvas,
    repeat: 'repeat',
  }),
});

canvas.requestRenderAll();
```

---

## 21. Clip Paths and Masks

A clip path limits where an object is visible.

Circle mask over image:

```ts
import { Circle, FabricImage } from 'fabric';

async function addCircularImage(url: string) {
  const image = await FabricImage.fromURL(url, {
    crossOrigin: 'anonymous',
  });

  image.scaleToWidth(300);

  image.clipPath = new Circle({
    radius: 150,
    originX: 'center',
    originY: 'center',
  });

  image.set({
    left: 300,
    top: 220,
  });

  canvas.add(image);
  canvas.requestRenderAll();
}
```

Clip path basics:

- The clip path is itself a Fabric object.
- It can be a circle, rectangle, path, group, etc.
- Clip paths often require careful origin handling.
- Clip paths can force caching because Fabric may need an offscreen canvas to render them correctly.

Use cases:

- Avatar cropper
- Product mockup mask
- Frame designs
- Text/image masks
- Non-destructive cropping

---

## 22. Serialization: Save and Load JSON

Serialization is one of Fabric's strongest features.

Save:

```ts
const json = canvas.toJSON();
localStorage.setItem('design', JSON.stringify(json));
```

Load:

```ts
const raw = localStorage.getItem('design');

if (raw) {
  await canvas.loadFromJSON(raw);
  canvas.requestRenderAll();
}
```

`loadFromJSON` is Promise-based in modern Fabric.

You can also save only object data:

```ts
const objects = canvas.getObjects().map((object) => object.toObject());
```

But for full designs, prefer `canvas.toJSON()`.

### Important Serialization Notes

Serialization includes:

- Object type
- Position
- Size
- Scale
- Rotation
- Fill/stroke
- Text values
- Image source
- Filters
- Groups
- Custom properties if configured

Serialization may not include:

- App-only UI state unless you add it
- Runtime event listeners
- DOM references
- Functions
- Temporary selection state

---

## 23. Custom Properties

Real editors need app-specific data:

- Object id
- Layer name
- Locked state
- User role
- Database id
- Template placeholder key

Without configuration:

```ts
(rect as any).id = 'shape-1';
rect.toObject(['id']);
```

Better TypeScript setup:

```ts
import { FabricObject } from 'fabric';

declare module 'fabric' {
  interface FabricObject {
    id?: string;
    name?: string;
    layerType?: 'shape' | 'text' | 'image';
  }

  interface SerializedObjectProps {
    id?: string;
    name?: string;
    layerType?: 'shape' | 'text' | 'image';
  }
}

FabricObject.customProperties = ['id', 'name', 'layerType'];
```

Now:

```ts
const rect = new Rect({
  id: crypto.randomUUID(),
  name: 'Blue rectangle',
  layerType: 'shape',
  width: 200,
  height: 100,
  fill: '#3b82f6',
});

const json = rect.toObject();
console.log(json.id);
```

This is essential for serious apps.

---

## 24. Export: PNG, JPEG, SVG

### Export PNG

```ts
const dataUrl = canvas.toDataURL({
  format: 'png',
  multiplier: 2,
});

const link = document.createElement('a');
link.href = dataUrl;
link.download = 'design.png';
link.click();
```

`multiplier: 2` exports at 2x resolution.

### Export JPEG

```ts
const dataUrl = canvas.toDataURL({
  format: 'jpeg',
  quality: 0.9,
  multiplier: 2,
});
```

JPEG does not support transparency.

### Export Region

```ts
const dataUrl = canvas.toDataURL({
  format: 'png',
  left: 100,
  top: 100,
  width: 400,
  height: 300,
  multiplier: 2,
});
```

### Export SVG

```ts
const svg = canvas.toSVG();
console.log(svg);
```

Download SVG:

```ts
const blob = new Blob([canvas.toSVG()], {
  type: 'image/svg+xml',
});

const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.href = url;
link.download = 'design.svg';
link.click();
URL.revokeObjectURL(url);
```

### Export Quality Tips

- Use `multiplier` for high-resolution PNG/JPEG export.
- Check image CORS before export.
- For print, think in document units and export at required DPI.
- Use SVG for scalable vector output when possible.
- Complex filters, images, and clip paths may not export identically in every SVG consumer.

---

## 25. SVG Import

Fabric can load SVG.

```ts
import { loadSVGFromURL, util } from 'fabric';

async function addSvg(url: string) {
  const result = await loadSVGFromURL(url);
  const object = util.groupSVGElements(result.objects, result.options);

  object.set({
    left: 100,
    top: 100,
  });

  canvas.add(object);
  canvas.setActiveObject(object);
  canvas.requestRenderAll();
}
```

Load from string:

```ts
import { loadSVGFromString, util } from 'fabric';

const svgString = `
<svg width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
`;

const result = await loadSVGFromString(svgString);
const object = util.groupSVGElements(result.objects, result.options);
canvas.add(object);
```

SVG import is useful for:

- Icons
- Templates
- Vector illustrations
- Logo upload
- Design assets

Security warning: do not load arbitrary untrusted SVG without sanitizing it. SVG can contain dangerous markup or references.

---

## 26. Clipboard: Copy, Paste, Clone

Cloning is Promise-based.

```ts
import type { FabricObject } from 'fabric';

let clipboard: FabricObject | null = null;

async function copySelected() {
  const active = canvas.getActiveObject();
  if (!active) return;

  clipboard = await active.clone();
}

async function pasteClipboard() {
  if (!clipboard) return;

  const clone = await clipboard.clone();

  clone.set({
    left: (clone.left ?? 0) + 20,
    top: (clone.top ?? 0) + 20,
  });

  clone.setCoords();
  canvas.add(clone);
  canvas.setActiveObject(clone);
  canvas.requestRenderAll();
}
```

You can wire this to buttons or keyboard shortcuts.

---

## 27. Undo and Redo

Simple undo/redo can store JSON snapshots.

```ts
const undoStack: string[] = [];
const redoStack: string[] = [];
let isRestoring = false;

function saveHistory() {
  if (isRestoring) return;

  undoStack.push(JSON.stringify(canvas.toJSON()));
  redoStack.length = 0;
}

async function undo() {
  if (undoStack.length <= 1) return;

  const current = undoStack.pop()!;
  redoStack.push(current);

  const previous = undoStack[undoStack.length - 1];

  isRestoring = true;
  await canvas.loadFromJSON(previous);
  canvas.requestRenderAll();
  isRestoring = false;
}

async function redo() {
  const next = redoStack.pop();
  if (!next) return;

  undoStack.push(next);

  isRestoring = true;
  await canvas.loadFromJSON(next);
  canvas.requestRenderAll();
  isRestoring = false;
}
```

Initialize history:

```ts
saveHistory();
```

Save after user modifications:

```ts
canvas.on('object:modified', saveHistory);
canvas.on('object:added', saveHistory);
canvas.on('object:removed', saveHistory);
canvas.on('path:created', saveHistory);
```

Production notes:

- Snapshot history is easy but can be memory-heavy.
- For large designs, use command-based history.
- Debounce history for typing and slider changes.
- Avoid saving history while restoring history.
- Do not save every `object:moving` event; save after `object:modified`.

---

## 28. Keyboard Shortcuts

```ts
document.addEventListener('keydown', async (event) => {
  const active = canvas.getActiveObject();

  if (event.key === 'Delete' || event.key === 'Backspace') {
    deleteSelected();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
    event.preventDefault();
    await copySelected();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'v') {
    event.preventDefault();
    await pasteClipboard();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
    event.preventDefault();
    await undo();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
    event.preventDefault();
    await redo();
  }

  if (active && event.key === 'ArrowRight') {
    active.set({ left: (active.left ?? 0) + 1 });
    active.setCoords();
    canvas.requestRenderAll();
  }
});
```

Important: when editing text, do not steal keyboard events.

```ts
function isEditingText() {
  const active = canvas.getActiveObject();
  return active && 'isEditing' in active && active.isEditing;
}

document.addEventListener('keydown', (event) => {
  if (isEditingText()) {
    return;
  }

  // app shortcuts here
});
```

---

## 29. Zoom and Pan

Zoom changes the viewport transform. It does not change object coordinates.

Mouse wheel zoom:

```ts
canvas.on('mouse:wheel', (event) => {
  const wheelEvent = event.e;
  let zoom = canvas.getZoom();

  zoom *= 0.999 ** wheelEvent.deltaY;
  zoom = Math.min(5, Math.max(0.2, zoom));

  canvas.zoomToPoint(event.scenePoint, zoom);

  wheelEvent.preventDefault();
  wheelEvent.stopPropagation();
});
```

Pan with Alt-drag:

```ts
let isPanning = false;
let lastX = 0;
let lastY = 0;

canvas.on('mouse:down', (event) => {
  if (!event.e.altKey) return;

  isPanning = true;
  canvas.selection = false;
  lastX = event.e.clientX;
  lastY = event.e.clientY;
});

canvas.on('mouse:move', (event) => {
  if (!isPanning) return;

  const dx = event.e.clientX - lastX;
  const dy = event.e.clientY - lastY;

  canvas.relativePan({ x: dx, y: dy });

  lastX = event.e.clientX;
  lastY = event.e.clientY;
});

canvas.on('mouse:up', () => {
  isPanning = false;
  canvas.selection = true;
});
```

Reset zoom:

```ts
canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
canvas.requestRenderAll();
```

Viewport transform array:

```ts
[scaleX, skewY, skewX, scaleY, translateX, translateY]
```

For normal zoom/pan:

- `scaleX` and `scaleY` are zoom.
- `translateX` and `translateY` are pan.

---

## 30. Snapping and Alignment Guides

Simple grid snapping after object movement:

```ts
const grid = 20;

canvas.on('object:moving', (event) => {
  const object = event.target;
  if (!object) return;

  object.set({
    left: Math.round((object.left ?? 0) / grid) * grid,
    top: Math.round((object.top ?? 0) / grid) * grid,
  });

  object.setCoords();
});
```

Snap rotation:

```ts
rect.set({
  snapAngle: 15,
  snapThreshold: 5,
});
```

Simple center alignment:

```ts
function centerSelectedHorizontally() {
  const active = canvas.getActiveObject();
  if (!active) return;

  active.set({
    left: canvas.getWidth() / 2,
    originX: 'center',
  });

  active.setCoords();
  canvas.requestRenderAll();
}
```

Simple object-to-object snapping:

```ts
const threshold = 6;

canvas.on('object:moving', (event) => {
  const moving = event.target;
  if (!moving) return;

  const movingCenter = moving.getCenterPoint();

  for (const object of canvas.getObjects()) {
    if (object === moving) continue;

    const center = object.getCenterPoint();

    if (Math.abs(movingCenter.x - center.x) < threshold) {
      moving.set({ left: center.x });
    }

    if (Math.abs(movingCenter.y - center.y) < threshold) {
      moving.set({ top: center.y });
    }
  }

  moving.setCoords();
});
```

Professional alignment guides require:

- Calculating object bounding boxes
- Drawing temporary guide lines on the top context or as non-exported objects
- Considering viewport zoom
- Snapping left/center/right and top/middle/bottom
- Cleaning guides after movement

---

## 31. Custom Controls

Controls are the small handles around an active object. Fabric exposes a custom controls API.

Use cases:

- Delete button on object
- Duplicate button on object
- Crop handles for images
- Custom rotate handle
- Polygon point editing
- Text resize behavior

Simple custom delete control example:

```ts
import { Control, FabricObject } from 'fabric';

function deleteObject(_eventData: MouseEvent, transform: any) {
  const object = transform.target;
  const canvas = object.canvas;

  canvas.remove(object);
  canvas.requestRenderAll();

  return true;
}

FabricObject.ownDefaults.controls.deleteControl = new Control({
  x: 0.5,
  y: -0.5,
  offsetY: -24,
  cursorStyle: 'pointer',
  mouseUpHandler: deleteObject,
  render(ctx, left, top) {
    ctx.save();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(left, top, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left - 4, top - 4);
    ctx.lineTo(left + 4, top + 4);
    ctx.moveTo(left + 4, top - 4);
    ctx.lineTo(left - 4, top + 4);
    ctx.stroke();
    ctx.restore();
  },
});
```

Notes:

- Control coordinates are relative to the object bounding box.
- `x: 0.5`, `y: -0.5` means top-right area.
- Render functions draw on canvas context.
- For production, type the handler carefully instead of using `any`.
- Custom controls are better than correcting transforms after events.

---

## 32. Custom Classes and Subclassing

Fabric v6+ uses real TypeScript classes. Subclassing uses standard `extends`.

Why create custom classes?

- A special object with custom rendering
- A diagram node with built-in label
- A product placeholder object
- A non-standard shape
- A reusable branded component

Simple custom object idea:

```ts
import { Rect, classRegistry } from 'fabric';

class BadgeRect extends Rect {
  static type = 'BadgeRect';

  badgeText = 'NEW';

  override _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);

    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.badgeText, 0, 0);
    ctx.restore();
  }
}

classRegistry.setClass(BadgeRect);
```

Use it:

```ts
const badge = new BadgeRect({
  width: 120,
  height: 60,
  fill: '#2563eb',
});

canvas.add(badge);
```

Custom class notes:

- Register the class for deserialization.
- Include custom properties in `toObject` if needed.
- Understand object coordinate space before drawing.
- `_render` draws around the object's local center.
- Do not mutate global prototypes casually.

For many apps, custom classes are not needed. Custom properties plus normal Fabric objects are enough.

---

## 33. Transformations and Matrix Math

Fabric objects have transformations:

- Translation
- Rotation
- Scale
- Skew

Fabric represents transformations internally with matrices:

```ts
[a, b, c, d, e, f]
```

Conceptually:

- `a`, `b`, `c`, `d` describe scale, rotation, and skew.
- `e`, `f` describe translation.

Get an object's own transform:

```ts
const own = object.calcOwnMatrix();
```

Get transform including parent groups:

```ts
const full = object.calcTransformMatrix();
```

Get center point:

```ts
const center = object.getCenterPoint();
```

Get bounding rectangle:

```ts
const bounds = object.getBoundingRect();
console.log(bounds.left, bounds.top, bounds.width, bounds.height);
```

Get object corners:

```ts
const corners = object.getCoords();
```

Common advanced problem:

You have a mouse point in viewport coordinates and need scene coordinates. Fabric events often give useful points:

```ts
canvas.on('mouse:down', (event) => {
  console.log('scene point', event.scenePoint);
  console.log('viewport point', event.viewportPoint);
});
```

Scene point means canvas coordinate system after accounting for viewport transform. Viewport point means screen/canvas element coordinate system.

Matrix math becomes important for:

- Custom controls
- Group internals
- Advanced snapping
- Clip paths
- Custom object rendering
- Coordinate conversion
- Precise drag handles
- Polygon/path editing

---

## 34. Performance and Caching

Fabric can cache objects on offscreen canvases. During movement, scaling, rotation, or skewing, it can draw the cached image instead of fully redrawing the object.

Object caching:

```ts
rect.set({
  objectCaching: true,
});
```

Disable object caching:

```ts
rect.set({
  objectCaching: false,
});
```

Avoid cache regeneration while scaling:

```ts
rect.set({
  noScaleCache: true,
});
```

Canvas render optimization:

```ts
canvas.renderOnAddRemove = false;

for (let i = 0; i < 1000; i++) {
  canvas.add(new Rect({
    left: Math.random() * 900,
    top: Math.random() * 600,
    width: 20,
    height: 20,
    fill: '#3b82f6',
  }));
}

canvas.renderOnAddRemove = true;
canvas.requestRenderAll();
```

Performance rules:

- Use `requestRenderAll()` instead of many immediate renders.
- Do not save undo history on every mouse move.
- Avoid thousands of heavy shadows.
- Avoid huge images without resizing.
- Cache complex objects when useful.
- Turn off caching for very simple frequently changing objects if it helps.
- Avoid unnecessary event listeners on every object.
- Use groups carefully; groups can help or hurt depending on caching.
- Do not keep invisible unused objects forever.
- For large editors, virtualize layer panels and avoid React state updates on every mouse move.

Cache configuration exists in Fabric's `config`:

```ts
import { config } from 'fabric';

config.perfLimitSizeTotal = 4096 * 1024;
config.maxCacheSideLimit = 8192;
```

Only tune these after measuring. Bigger cache limits may improve export quality but can hurt memory.

---

## 35. TypeScript Patterns

Use named imports:

```ts
import {
  Canvas,
  Rect,
  Circle,
  FabricObject,
  FabricImage,
  Textbox,
  filters,
} from 'fabric';
```

Type helper:

```ts
function getActiveObject(): FabricObject | undefined {
  return canvas.getActiveObject();
}
```

Type guard:

```ts
function isImage(object: unknown): object is FabricImage {
  return object instanceof FabricImage;
}

const active = canvas.getActiveObject();

if (isImage(active)) {
  active.filters = [new filters.Grayscale()];
  active.applyFilters();
}
```

Custom app object metadata:

```ts
type LayerType = 'shape' | 'text' | 'image' | 'group';

declare module 'fabric' {
  interface FabricObject {
    id?: string;
    layerType?: LayerType;
  }
}
```

Avoid storing Fabric objects directly in global UI state if your UI framework expects immutable data. Store IDs, selection summaries, and derived state instead.

---

## 36. React Integration

React should own the UI. Fabric should own the canvas scene.

Basic pattern:

```tsx
import { useEffect, useRef } from 'react';
import { Canvas, Rect } from 'fabric';

export function FabricEditor() {
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (!canvasElementRef.current) return;

    const canvas = new Canvas(canvasElementRef.current, {
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    canvas.add(new Rect({
      left: 100,
      top: 100,
      originX: 'left',
      originY: 'top',
      width: 200,
      height: 100,
      fill: '#3b82f6',
    }));

    canvas.requestRenderAll();

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, []);

  return <canvas ref={canvasElementRef} width={900} height={600} />;
}
```

Good React + Fabric rules:

- Create Fabric canvas once.
- Store it in a `ref`, not state.
- Dispose it on unmount.
- Use React state for toolbar values and panels.
- Use Fabric events to update React selection state.
- Do not re-render Fabric objects through JSX.
- Do not recreate the Fabric canvas on every render.
- Use IDs to connect React layer list items to Fabric objects.

### HTML Canvas Ref vs Fabric Canvas Ref

In React + Fabric apps, there are two different things that both get called "canvas":

```tsx
<canvas />
```

This is the real browser canvas element. React needs a ref to this DOM element so Fabric has a place to draw.

```tsx
new Canvas(...)
```

This is the Fabric canvas controller. It manages Fabric objects, selection, rendering, events, zoom, export, and cleanup.

Use clearer names:

```tsx
const htmlCanvasRef = useRef<HTMLCanvasElement | null>(null);
const fabricEditorRef = useRef<Canvas | null>(null);
```

Use `htmlCanvasRef` only for the real JSX canvas element:

```tsx
return <canvas ref={htmlCanvasRef} />;
```

And only once when creating Fabric:

```tsx
useEffect(() => {
  if (!htmlCanvasRef.current) return;

  const fabricCanvas = new Canvas(htmlCanvasRef.current, {
    width: 500,
    height: 500,
    backgroundColor: '#ffffff',
  });

  fabricEditorRef.current = fabricCanvas;

  return () => {
    fabricCanvas.dispose();
    fabricEditorRef.current = null;
  };
}, []);
```

Use `fabricEditorRef` whenever you want to do Fabric things:

```tsx
const addSquare = () => {
  const fabricCanvas = fabricEditorRef.current;
  if (!fabricCanvas) return;

  const square = new Rect({
    left: 150,
    top: 50,
    originX: 'left',
    originY: 'top',
    width: 50,
    height: 50,
    fill: 'red',
  });

  fabricCanvas.add(square);
  fabricCanvas.requestRenderAll();
};
```

"Fabric things" means using Fabric's API:

```tsx
fabricCanvas.add(object);
fabricCanvas.remove(object);
fabricCanvas.getActiveObject();
fabricCanvas.setActiveObject(object);
fabricCanvas.getObjects();
fabricCanvas.clear();
fabricCanvas.requestRenderAll();
fabricCanvas.dispose();
```

Memory rule:

```txt
htmlCanvasRef: give Fabric a place to draw.
fabricEditorRef: tell Fabric what to draw and edit.
```

Selection sync:

```tsx
useEffect(() => {
  const canvas = fabricCanvasRef.current;
  if (!canvas) return;

  const updateSelection = () => {
    const active = canvas.getActiveObject();
    setSelectedId(active?.id ?? null);
  };

  const disposeCreated = canvas.on('selection:created', updateSelection);
  const disposeUpdated = canvas.on('selection:updated', updateSelection);
  const disposeCleared = canvas.on('selection:cleared', updateSelection);

  return () => {
    disposeCreated();
    disposeUpdated();
    disposeCleared();
  };
}, []);
```

---

## 37. Security and Safe Loading

Treat these as untrusted input:

- User-uploaded SVG
- Remote SVG
- Remote JSON
- Design templates from users
- Image URLs from users

Risks:

- SVG can contain dangerous content.
- JSON can create unexpected object properties.
- Remote images can taint canvas export.
- Old library versions may have known vulnerabilities.

Safety rules:

- Keep Fabric.js updated.
- Sanitize SVG before loading.
- Validate JSON before `loadFromJSON`.
- Avoid loading arbitrary remote image URLs directly.
- Use CORS-aware image loading.
- Do not trust custom properties from user designs.
- Consider a backend sanitizer for shared templates.

Fabric.js `7.2.0` release notes mention an SVG export stored XSS fix. That is a practical reminder: do not treat design files as harmless.

---

## 38. Common Mistakes

### Mistake 1: Object Is Half Outside Canvas

Cause: Fabric v7 center origin.

Fix:

```ts
originX: 'left',
originY: 'top',
```

Or place by center intentionally:

```ts
left: 300,
top: 200,
originX: 'center',
originY: 'center',
```

### Mistake 2: Changed Object Position But Controls Are Wrong

Fix:

```ts
object.setCoords();
canvas.requestRenderAll();
```

### Mistake 3: Export Fails After Loading Image

Cause: canvas is tainted by cross-origin image.

Fix:

```ts
FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
```

Also ensure server sends CORS headers.

### Mistake 4: Too Many Renders

Bad:

```ts
objects.forEach((object) => {
  canvas.add(object);
  canvas.renderAll();
});
```

Better:

```ts
objects.forEach((object) => canvas.add(object));
canvas.requestRenderAll();
```

### Mistake 5: Using Events for Everything

If your app code adds an object, write an app function:

```ts
function addObject(object: FabricObject) {
  canvas.add(object);
  canvas.centerObject(object);
  canvas.setActiveObject(object);
  saveHistory();
  canvas.requestRenderAll();
}
```

Do not rely on `object:added` for all side effects unless there is a good reason.

### Mistake 6: Saving Fabric Objects in React State

Store:

```ts
selectedId
selectedType
selectedFill
```

Not the full live object unless you know exactly why.

### Mistake 7: Forgetting Cleanup

In apps:

```ts
canvas.dispose();
```

And call event disposers.

---

## 39. Beginner Projects

### Project 1: Shape Playground

Features:

- Add rectangle
- Add circle
- Add triangle
- Select objects
- Delete selected
- Change fill color
- Export PNG

Skills learned:

- Canvas creation
- Object creation
- Selection
- Styling
- Export

### Project 2: Simple Poster Maker

Features:

- Add title text
- Add subtitle text
- Add background shape
- Change font size
- Change text color
- Align center
- Export image

Skills learned:

- Text classes
- Toolbar actions
- Object styling
- Layout helpers

### Project 3: Whiteboard

Features:

- Free drawing
- Brush size
- Brush color
- Erase by selecting path and deleting
- Undo/redo
- Save JSON

Skills learned:

- Drawing mode
- Paths
- History
- Serialization

---

## 40. Intermediate Projects

### Project 4: Image Editor

Features:

- Upload image
- Scale image to canvas
- Brightness slider
- Contrast slider
- Grayscale toggle
- Crop frame
- Export PNG/JPEG

Skills learned:

- `FabricImage`
- Filters
- CORS
- File input
- Crop properties

### Project 5: Layer-Based Editor

Features:

- Layers panel
- Rename layer
- Show/hide layer
- Lock/unlock layer
- Reorder layers
- Group/ungroup
- Duplicate layer

Skills learned:

- `canvas.getObjects()`
- Stack order
- Custom properties
- Active selection
- Groups

### Project 6: Diagram Builder

Features:

- Add nodes
- Add connector lines
- Snap to grid
- Align nodes
- Export SVG
- Save/load JSON

Skills learned:

- Lines
- Coordinates
- Snapping
- Bounding boxes
- SVG export

---

## 41. Advanced Capstone Project

Build a mini Canva-like editor.

### Core Features

- Canvas with fixed artboard size
- Add shapes
- Add editable text
- Upload images
- Layer panel
- Properties panel
- Color picker
- Font controls
- Image filters
- Group/ungroup
- Delete/duplicate
- Copy/paste
- Undo/redo
- Zoom/pan
- Export PNG/JPEG/SVG
- Save/load JSON

### Advanced Features

- Custom object IDs
- Custom controls
- Snap to grid
- Alignment guides
- Lock/hide layers
- Template loading
- SVG import
- Image masking
- Crop mode
- Keyboard shortcuts
- Responsive canvas container
- High-resolution export
- React integration

### Architecture

Suggested structure:

```text
src/
  editor/
    createCanvas.ts
    objectFactory.ts
    history.ts
    serialization.ts
    clipboard.ts
    shortcuts.ts
    zoomPan.ts
    snapping.ts
    layers.ts
    export.ts
  components/
    Toolbar.tsx
    CanvasView.tsx
    LayersPanel.tsx
    PropertiesPanel.tsx
  types/
    fabric-extensions.ts
```

### Object Factory

```ts
import { Rect, Circle, IText, FabricObject } from 'fabric';

function createBaseObjectProps() {
  return {
    id: crypto.randomUUID(),
    originX: 'left' as const,
    originY: 'top' as const,
    cornerColor: '#2563eb',
    cornerStrokeColor: '#ffffff',
    transparentCorners: false,
  };
}

export function createRectangle(): FabricObject {
  return new Rect({
    ...createBaseObjectProps(),
    left: 100,
    top: 100,
    width: 200,
    height: 120,
    fill: '#3b82f6',
  });
}

export function createCircle(): FabricObject {
  return new Circle({
    ...createBaseObjectProps(),
    left: 140,
    top: 140,
    radius: 70,
    fill: '#f97316',
  });
}

export function createText(): FabricObject {
  return new IText('New text', {
    ...createBaseObjectProps(),
    left: 120,
    top: 120,
    fontSize: 42,
    fill: '#111827',
  });
}
```

### Editor Command Pattern

```ts
function addObject(object: FabricObject) {
  canvas.add(object);
  canvas.setActiveObject(object);
  saveHistory();
  canvas.requestRenderAll();
}

function updateActiveObject(props: Record<string, unknown>) {
  const active = canvas.getActiveObject();
  if (!active) return;

  active.set(props);
  active.setCoords();
  saveHistory();
  canvas.requestRenderAll();
}
```

Keep app operations explicit. This is easier to test and debug than relying on event chains.

---

## 42. Master Checklist

You are beginner-level when you can:

- Create a Fabric canvas
- Add shapes
- Move/select objects
- Change fill/stroke
- Delete selected objects
- Export PNG

You are intermediate-level when you can:

- Use text objects
- Load and filter images
- Save/load JSON
- Build undo/redo
- Build a layers panel
- Use groups
- Add keyboard shortcuts
- Use zoom and pan

You are advanced-level when you can:

- Write custom controls
- Use custom properties safely
- Create custom classes
- Understand coordinate planes
- Debug viewport transforms
- Optimize performance
- Build snapping/alignment guides
- Integrate Fabric with React cleanly
- Sanitize imported JSON/SVG
- Export high-resolution assets reliably

You are production-level when you can:

- Design a clean editor architecture
- Keep UI state and Fabric state synchronized
- Handle large designs
- Avoid memory leaks
- Manage history efficiently
- Build a robust import/export pipeline
- Support templates and user assets safely
- Test important editor workflows

---

## Suggested Learning Order

Follow this exact path:

1. Build the first app.
2. Learn shapes and styling.
3. Learn selection and deletion.
4. Build a toolbar.
5. Add text.
6. Add image upload.
7. Add filters.
8. Add JSON save/load.
9. Add undo/redo.
10. Add layer panel.
11. Add zoom/pan.
12. Add snapping.
13. Add custom controls.
14. Add SVG import/export.
15. Build the capstone editor.

Do not jump directly to custom controls or matrix math. Fabric becomes easy when the object model, coordinates, selection, and serialization are clear.

---

## Final Advice

Fabric.js mastery comes from building editors, not only reading APIs.

The most important ideas are:

- Fabric is object-based.
- Canvas coordinates start at top-left.
- Fabric v7 origins default to center.
- Use `Canvas` for interaction and `StaticCanvas` for non-interactive rendering.
- Use `requestRenderAll()` after changes.
- Call `setCoords()` after programmatic transform changes.
- Use JSON for save/load.
- Use custom properties for app metadata.
- Keep Fabric canvas in refs in React.
- Keep security in mind for SVG/JSON/image loading.
- Measure before optimizing performance.

If you deeply understand these, you can build almost any 2D editor with Fabric.js.
