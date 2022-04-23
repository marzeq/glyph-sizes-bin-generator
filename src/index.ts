import { readFile, writeFile } from "fs/promises"
import { join } from "path"
import { jsonc } from "jsonc"

type GlyphSizesJson<parsed = boolean> = {
	[key in parsed extends true ? number : string | number]: { start: number; end: number }
}

const main = async () => {
	if (process.argv.length < 3) {
		console.error("Requires a file to parse")
		help()
		process.exit(1)
	}

	const content: GlyphSizesJson<false> = await jsonc.read(process.argv[2])

	Object.keys(content).forEach(key => {
		const values = content[key]
		delete content[key]
		content[parseInt(key, 16)] = values
	})

	const parsedContent: GlyphSizesJson<true> = content,
		originalSizes = new Uint16Array(await readFile(join(__dirname, "../glyph_sizes_original.bin")))

	for (const [keystr, value] of Object.entries(parsedContent)) {
		const key = parseInt(keystr),
			startHex = value.start.toString(16),
			endHex = value.end.toString(16),
			valueString = `${startHex}${endHex}`,
			valueNumber = parseInt(valueString, 16)

		originalSizes[key] = valueNumber
	}

	await writeFile("glyph_sizes.bin", Buffer.from(originalSizes))

	console.log("Written to glyph_sizes.bin")
}

const reverse = async () => {
	if (process.argv.length < 4) {
		console.error("Requires a file to parse")
		help()
		process.exit(1)
	}

	let remainingArgs = process.argv.slice(3)

	const binaryFile = remainingArgs[0],
		writeFile = remainingArgs[1]

	remainingArgs = remainingArgs.slice(2)

	if (remainingArgs.length < 2 || remainingArgs.length % 2 !== 0) {
		console.error("Requires a non-zero even number of arguments (Unicode character ranges)")
		process.exit(1)
	}

	const ranges: [number, number][] = []

	for (let i = 0; i < remainingArgs.length; i += 2) {
		const startStr = remainingArgs[i],
			endStr = remainingArgs[i + 1],
			start = parseInt(startStr.replace(/^[Uu]\+?/, ""), 16),
			end = parseInt(endStr.replace(/^[Uu]\+?/, ""), 16)

		ranges.push([start, end])
	}

	const expandedRanges: number[] = []

	for (const [start, end] of ranges) {
		for (let i = start; i <= end; i++) {
			expandedRanges.push(i)
		}
	}

	const binary = new Uint16Array(await readFile(binaryFile)),
		content: GlyphSizesJson<false> = {}

	for (const [i, value] of binary.entries()) {
		if (expandedRanges.includes(i)) {
			const valueString = value < 16 ? `0${value.toString(16)}` : value.toString(16),
				start = parseInt(valueString[0], 16),
				end = parseInt(valueString[1], 16)

			content[i.toString(16)] = { start, end }
		}
	}

	await jsonc.write(writeFile, content)
}

const help = () => console.log(`Usage: Read the README.md file for the usage instructions`)

if (process.argv[2] === "--reverse" || process.argv[2] === "-r") reverse().catch(console.error)
else if (process.argv.some(s => s === "--help" || s === "-h" || s === "--?" || s === "-?")) help()
else main().catch(console.error)
