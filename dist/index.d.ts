declare type GifWriterOptions = {
    src: string;
    dest: string;
    text_options: {
        text: string;
        font_path?: string;
        font_color?: string;
        font_size?: number;
        alignmentX?: string;
        alignmentY?: string;
        positionX?: string;
        positionY?: string;
    }[];
};
declare class GifWriter {
    writeTextOnGif(options: GifWriterOptions): Promise<void>;
    private getSrc;
    private getFont;
    private getAlignmentX;
    private getAlignmentY;
    private getPosition;
}
export { GifWriter };
//# sourceMappingURL=index.d.ts.map