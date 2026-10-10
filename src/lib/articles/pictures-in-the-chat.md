People paste pictures into the chat: a screenshot of a logo, a sketch, something another tool made. Until now the message box ignored them, because a text box has nowhere to put an image. This update gives a picture somewhere to go, and two ways to become SVG.

## Paste it, drop it, or attach it

Paste a picture into the message box, drop it there, or add it with the paperclip button next to the model menu. It waits above the message box until you send. An SVG file opens straight in the editor, the same as pasted SVG code. What happens next depends on whether you wrote anything.

## On its own: redraw it or trace it

Send a picture without a message and you get one question, with the price of each answer on its button.

**Redraw as an illustration** sends the picture to the image model, which draws it again in flat colours, and the result is traced into SVG. This is the one for characters, scenes and photos: clean shapes that still look like your picture. It costs the image model's credits, 10 with gpt-image-1-mini and 30 with gpt-image-1.5.

**Trace to SVG** turns the picture into shapes directly, in your browser. It is free, works without an account, and copies the picture exactly. That means many small shapes, one for each patch of colour.

Either way you get the tracing sliders to adjust the result, and Accept puts the drawing in the editor. Reject puts the picture back in the message box, so you can try the other way.

The image model matters more here than anywhere else. We tried it on John Tenniel's illustration of Alice and the flamingo, from 1865.

![John Tenniel's Alice holding the flamingo, a black-and-white engraving with fine hatching.](/screenshots/articles/pictures-in-the-chat/alice-original.png)

gpt-image-1-mini redrew it as a different Alice in its own cartoon style. gpt-image-1.5 kept her face, her hair, the hedgehogs and Tenniel's own linework, and added colour:

![The same scene redrawn by gpt-image-1.5: Alice in a blue dress with a pink flamingo, still in Tenniel's style.](/screenshots/articles/pictures-in-the-chat/alice-redrawn.png)

Traced, that picture is 1,638 shapes and about 470 KB of SVG, nearly indistinguishable from the picture it came from. [Open the traced SVG](/screenshots/articles/pictures-in-the-chat/alice-traced.svg) to look at it closely.

So when gpt-image-1-mini is selected, the question suggests gpt-image-1.5 for a closer likeness. It is one of the Pro image models.

## With a message: the assistant sees it

Write something and the picture goes to the assistant with your words: "match the colours of this", "add this icon to the corner", "redraw this logo as a few clean shapes". For a simple logo or icon, that last one often gives the best result of all. The assistant writes a handful of shapes by hand instead of tracing hundreds.

Later messages show the same picture to the assistant again, until you attach another one. So "make it closer to the original" works, because the assistant knows what the original is. DeepSeek-V4-Flash and Kimi-K2.6 cannot see pictures; pick another model to send one.

## A tracer that keeps the detail

While testing this we found that the tracer was throwing away much of what the image model drew. It dropped every patch smaller than 10 × 10 pixels and kept few shades of each colour. A detailed portrait came out as 43 shapes, with the ribs of the knitted hat and the strands of the beard gone.

![A generated portrait of an old fisherman, its trace before this update, and its trace now: before, the hat is one flat shape and the beard a grey block; now both match the picture.](/screenshots/articles/pictures-in-the-chat/tracer-detail.png)

The tracer now starts from the settings its authors chose as defaults. The same portrait keeps 162 shapes and is still only 68 KB. A very detailed picture would grow too big to save with the chat, so it is traced one step coarser, and the sliders open at the settings it ended up with. Pictures you generate get the same detail.

## Outlines, or not

Generated pictures have always been asked for with bold outlines and two or three shades per colour, because that traces cleanly. We compared it with a lighter style on eight prompts, and most pictures looked better with the outlines. Not all of them, though, so the card that asks before a picture is made now has two small options. **Bold outlines** draws a dark outline round every shape; untick it and areas of colour meet edge to edge. **More detail** asks for as many shades and small details as the subject needs, instead of two or three tones per colour. They work independently, and the card remembers what you picked last.
