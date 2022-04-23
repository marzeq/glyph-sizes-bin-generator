# glyph-sizes-bin-generator

This project can generate a glyph_sizes.bin file for the Minecraft Unicode font from a json file containing the glyph sizes. (Example file: [example_file.json](./example_file.jsonc))

It can also generate a json file containing the glyph sizes for a specific range of Unicode characters from a glyph_sizes.bin file.

## Usage:

### Json to bin:

- `<script> [jsonInput]`
  - `<script>`: The path to the script (could be `yarn start` or `npx glyphsizesgen`)
  - `[jsonInput]`: The name of the json file to convert to a bin file (can contain comments).

#### Example usage:

`yarn start ./example_file.json`

### Bin to json:

- `<script> --reverse [binaryFile] [jsonOutput] [[start] [end]]...`
  - `<script>`: The path to the script (could be `yarn start` or `npx glyphsizesgen`)
  - `[binaryFile]`: The name of the bin file to convert to a json file.
  - `[jsonOutput]`: The name of the json file to write the json data to.
  - `[[start] [end]]...`: The range of Unicode characters to write to the json file.

#### Example usage:

`yarn start --reverse glyph_sizes.bin example_file.json U+0400 U+045F U+047A U+04A1`
