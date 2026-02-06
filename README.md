# Snowflake 3D

An interactive 3D snowflake generator built with Three.js. Create and customize beautiful, unique snowflakes with real-time controls for geometry, materials, lighting, and animation.

![Demo](Screenshot.png)

## Features

- **Procedural Generation**: Generate unique snowflakes with adjustable recursion levels (1-12)
- **Real-time Controls**: Modify length, size, offset, and rotation parameters on the fly
- **Material Customization**: Adjust roughness, metalness, transmission, and environment reflections
- **Lighting System**: Control directional and hemisphere lighting with custom colors and intensity
- **HDR Environment Maps**: Two included environment maps for realistic reflections
- **Save/Load**: Export and import snowflake configurations as JSON
- **Image Export**: Save rendered snowflakes as images
- **Visual Guides**: Toggle guides, mirrors, and wireframes for design assistance

## Setup

### Method 1: Local Server (MAMP)
You will need to run this project on a server, like MAMP (i.e., localhost)

### Method 2: Node.js
You will need to have Node installed:
1. Open a CMD (command prompt) and navigate into the parent folder where `app.js` is located
2. Run the command: `node app.js`
3. If successful, you will see: "Server running at http://localhost:3000/"
4. Open your browser and navigate to: `http://localhost:3000/`
5. To exit the server, press `Ctrl+C` or close the CMD

## Usage

Open the menu to access controls for:
- **Level**: Adjust the recursion depth of the snowflake
- **Lengths/Size/Offset**: Fine-tune branch dimensions
- **Randomise**: Generate random variations
- **Material Control**: Adjust surface properties and environment mapping
- **Light Control**: Modify lighting setup
- **Rotation**: Enable automatic rotation on different axes

Have fun exploring!
