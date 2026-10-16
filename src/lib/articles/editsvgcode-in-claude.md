A lot of SVG is written in chats now. Someone asks Claude for a logo or an icon, gets a block of markup, and brings it here to see it, fix it or change it. This update works the other way round: Claude can now open EditSvgCode itself and work on the drawing where it is kept.

## Add it once

EditSvgCode is now an MCP server. MCP, the Model Context Protocol, is the open standard Claude uses to reach other services. Press [Add to Claude](https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=EditSvgCode&connectorUrl=https%3A%2F%2Feditsvgcode.com%2Fmcp) and Claude opens its Add custom connector dialog with our name and address filled in. Claude warns that the connector came from a link, as it does for every connector outside its own directory. Check that the address is `editsvgcode.com/mcp`, press Continue, sign in to EditSvgCode and press Allow.

![Claude's Add custom connector dialog with the name EditSvgCode and the address https://editsvgcode.com/mcp filled in.](/screenshots/articles/editsvgcode-in-claude/add-connector.png) From then on it is in Claude on the web, on the desktop and on your phone.

## What changes when Claude has the drawing

Asked for SVG in a plain chat, Claude writes the whole file out, and every change means writing it out again. A long drawing gets cut short, a coordinate drifts, and the change you wanted arrives alongside three you did not.

With EditSvgCode connected, Claude works on a saved drawing instead. It makes a change the way you would in the editor: set the fill on these three shapes, rewrite this label, remove that group, recolour one region of a traced path. Everything it did not address stays exactly as it was, and each change is saved to your account as it is made. Claude shows the drawing in the chat, rendered, after each round, so you see the result rather than markup.

Claude sees it too. It can render the drawing as a picture for itself, outline the shapes it is unsure of to find the part you mean, and look again to check a change before it says it is done. For a recognisable object or symbol, it can insert an icon from an open-source library instead of drawing one.

Every drawing it makes has its editor link. Open it here to look at the code, drag a shape, export a PNG or publish it to the gallery, and Claude can pick it up again later by name.

## Your files

Ask Claude for your files and it shows your saved drawings in the chat, newest first, with a small preview of each. The same list has a box to drop an SVG file from your computer into. That is the way to hand Claude a file of yours: a file attached to the chat stays with Claude and never reaches EditSvgCode, while one dropped in the box is saved to your account, where Claude can open it.

Claude can also copy a drawing before changing it, so the original stays as it was, and give you a link to download the SVG file or a PNG of it.

## Pictures

Some things are better painted than drawn with a few shapes: a character, an animal, a scene. Ask for one and Claude puts a card in the chat with the prompt and its price. You can reword the prompt there. Nothing is made or charged until you press Generate. The image model paints the picture, your browser traces it into SVG, and the result is saved as a new drawing. Asking for a change, such as a different pose, a hat or another expression, brings up the same card, which redraws the picture and keeps the original. It works on any picture-like drawing in your account, including one traced or uploaded earlier.

## What it costs

The thinking is Claude's, so your Claude plan pays for it. In the editor, every request to the AI assistant costs credits; here the conversation and every edit Claude makes cost no EditSvgCode credits at all. Opening drawings, the files list and uploads are free too.

Only pictures use credits, the same as in the editor: 10 with gpt-image-1-mini, the default, shown on the card before you press Generate.

## Other apps

The address, `https://editsvgcode.com/mcp`, works in other apps that connect to MCP servers over the web. In Claude Code it is one command, `claude mcp add --transport http editsvgcode https://editsvgcode.com/mcp`, and VS Code takes it as an HTTP server. Apps that show no cards in the chat open the picture card in the editor instead. The [MCP page](/features/mcp) has the details.
