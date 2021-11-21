import Jimp from 'jimp';
import { GifUtil, GifFrame } from 'gifwrap';


type GifWriterOptions = {
    src: string,
    dest: string,
    text_options: {
        text: string,
        font_path?: string, // if this is set, setting font_size & font_color will have no effect.
        font_color?: string,
        font_size?: number,
        alignmentX?: string,
        alignmentY?: string,
        positionX?: string,
        positionY?: string
    }[]
}


class GifWriter {
    async writeTextOnGif(options: GifWriterOptions) {
        let src = this.getSrc(options.src);
        let dest = options.dest;
    
        var frames: GifFrame[] = [];
    
        await GifUtil.read(src).then(async inputGif => {
            console.info(`[GifEditor] Input gif contains ${inputGif.frames.length} frames.`);

            for (let frameIndex = 0; frameIndex < inputGif.frames.length; frameIndex++) {
            // for (let frameIndex = 0; frameIndex < 4; frameIndex++) {
                let frame = inputGif.frames[frameIndex];
                var jimpCopied = GifUtil.copyAsJimp(Jimp, frame);

                for (var index = 0; index < options.text_options.length; index++) {
                    let text = options.text_options[index].text;
                    let font = this.getFont(options.text_options[index].font_path, options.text_options[index].font_color, options.text_options[index].font_size);
                    if (font == null) {
                        return;
                    }
                    let alignmentX = this.getAlignmentX(options.text_options[index].alignmentX);
                    let alignmentY = this.getAlignmentY(options.text_options[index].alignmentY);
                    let positionX = options.text_options[index].positionX;
                    let positionY = options.text_options[index].positionY;
                    // print(font, x axis offset, y axis offset, text options, maxWidth, maxHeight)
                    let [offsetX, offsetY, maxWidth, maxHeight] = this.getPosition(jimpCopied, positionX, positionY);
                    await Jimp.loadFont(font).then(font => {
                        jimpCopied.print(font, offsetX, offsetY, {
                            text: text,
                            alignmentX: alignmentX,
                            alignmentY: alignmentY
                            },
                            maxWidth,
                            maxHeight);
                    });
                }
                const GifCopied = new GifFrame(jimpCopied.bitmap,{
                    disposalMethod: frame.disposalMethod,
                    delayCentisecs: frame.delayCentisecs,
                });
                GifUtil.quantizeSorokin(GifCopied, 256);
                frames.push(GifCopied); 
            };
        });
        // write to the destination file.
        GifUtil.write(dest, frames);
    }

    private getSrc(src: string): string {
        return src;
    }
    
    /*
      font_path: if supplied, omit font_color & font_size, load the custom font from the path
    */
    private getFont(font_path?: string, font_color?: string, font_size?: number): string | null {
        if (!!font_path) {
            if (font_path.substr(font_path.length - 4, 4) == ".fnt") {
                return font_path;
            }
            console.error("[GifEditor] Error: only fnt files are accepted.")
            return null;
        } else if (font_color == "black") {
            switch (font_size) {
                case 8: return Jimp.FONT_SANS_8_BLACK;
                case 10: return Jimp.FONT_SANS_10_BLACK;
                case 12: return Jimp.FONT_SANS_12_BLACK;
                case 14: return Jimp.FONT_SANS_14_BLACK;
                case 16: return Jimp.FONT_SANS_16_BLACK;
                case 32: return Jimp.FONT_SANS_32_BLACK;
                case 64: return Jimp.FONT_SANS_64_BLACK;
                case 128: return Jimp.FONT_SANS_128_BLACK;
                default: return Jimp.FONT_SANS_32_BLACK;
            }
        } else if (font_color == "white") {
            switch (font_size) {
                case 8: return Jimp.FONT_SANS_8_WHITE;
                case 16: return Jimp.FONT_SANS_16_WHITE;
                case 32: return Jimp.FONT_SANS_32_WHITE;
                case 64: return Jimp.FONT_SANS_64_WHITE;
                case 128: return Jimp.FONT_SANS_128_WHITE;
                default: return Jimp.FONT_SANS_32_WHITE;
            }
        } else {
            return Jimp.FONT_SANS_32_BLACK;
        }
    }
    
    private getAlignmentX(alignment?: string) {
        switch (alignment) {
            case "left": return Jimp.HORIZONTAL_ALIGN_LEFT;
            case "middle": return Jimp.HORIZONTAL_ALIGN_CENTER;
            case "right": return Jimp.HORIZONTAL_ALIGN_RIGHT;
            default: return Jimp.HORIZONTAL_ALIGN_LEFT;
        }
    }
    
    private getAlignmentY(alignment?: string) {
        switch (alignment) {
            case "top": return Jimp.VERTICAL_ALIGN_TOP;
            case "middle": return Jimp.VERTICAL_ALIGN_MIDDLE;
            case "bottom": return Jimp.VERTICAL_ALIGN_BOTTOM;
            default: return Jimp.VERTICAL_ALIGN_TOP;
        }
    }
    
    private getPosition(jimpCopied: any, positionX?: string, positionY?: string) {
        let positionXResult, positionYResult;
        if (positionX) {
            if (positionX.includes("%")){
                positionX = positionX.replace("%", "");
                positionXResult = (jimpCopied.bitmap.width / 100) * parseInt(positionX);
            } else {
                positionXResult = parseInt(positionX);
            }
        } else {
            positionXResult = 0;
        }

        if (positionY) {
            if (positionY.includes("%")){
                positionY = positionY.replace("%", "");
                positionYResult = (jimpCopied.bitmap.height / 100) * parseInt(positionY);
            } else {
                positionYResult = parseInt(positionY);
            }
        } else {
            positionYResult = 0;
        }
        // console.log(`${[positionXResult, positionYResult, jimpCopied.bitmap.width, jimpCopied.bitmap.height]}`);
        return [positionXResult, positionYResult, jimpCopied.bitmap.width, jimpCopied.bitmap.height];
    }
}

function test() {
    let options: GifWriterOptions = {
        // src: __dirname + "/../girl-5.gif",
        // src: "girl-5.gif",
        src: "share.gif",
        dest: "output.gif",
        text_options: [
            {
                text: "I'm produced by a cool Gif Editor",
                alignmentX: "right",
                alignmentY: "middle",
                font_path: "Minecraft.ttf.fnt"
            },
            {
                text: "top",
                alignmentX: "left",
                alignmentY: "top",
            },
            {
                text: "bottom",
                alignmentX: "right",
                alignmentY: "bottom",
                positionX: "-50%"
            }
        ]
    }

    let writer = new GifWriter();
    writer.writeTextOnGif(options);
}

test();

export { GifWriter };